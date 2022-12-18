import {
  GameState,
  isBettingBet,
  isBettingCall,
  isBettingFold,
  isBettingRaise,
  isLeaveTable,
  isNextRound,
  isResetGame,
  isSendTextMessage,
  isSitAtTable,
  isStartGame,
  PlayerState,
  RoomClientToServer,
  RoomServerToClient,
} from "src/types";
import { WebSocket, Server } from "ws";
import url from "url";
import { TransientMockDatabase } from "src/db/db";
import {
  DeleteRoomAfterInactivityTimeout,
  handleGameInput,
  sortPlayersBySeat,
  startRound,
} from "src/utils/session";
import { Session } from "src/db/schema";
import {
  MESSAGE_BURST_MAX,
  MESSAGE_BURST_THRESHOLD_MILLISECONDS,
  MESSAGE_TOO_MANY_TIMEOUT_SECONDS,
} from "src/utils/constants";
import isInteger from "lodash/isInteger";
import shuffle from "lodash/shuffle";

export const createRoomWss = (roomId: string): Server<WebSocket> => {
  const wss = new WebSocket.Server({ noServer: true });
  const clients: Map<
    string, // player secret ID
    WebSocket
  > = new Map();

  const send = (ws: WebSocket, data: RoomServerToClient) => {
    ws.send(JSON.stringify(data));
  };

  const broadcast = (session: Session) => {
    clients.forEach((client, secretId) => {
      if (client.readyState === WebSocket.OPEN) {
        const gameState = computeGameState(session);
        send(client, gameState);
        const playerState = computePlayerState(session, secretId);
        playerState && send(client, playerState);
      }
    });
  };

  const computeGameState = ({
    gameStarted,
    maxTextMessageLength,
    maxNameLength,
    minNameLength,
    maxInitialChipCount,
    minInitialChipCount,
    players,
    textMessageHistory,
    bigBlind, // divisible by 2
    round,
  }: Session): GameState => {
    return {
      isTypeGameState: true,
      gameStarted,
      maxTextMessageLength,
      maxNameLength,
      minNameLength,
      maxInitialChipCount,
      minInitialChipCount,
      players: players.map(
        ({ name, guestName, tablePosition, isConnected, publicId, chips }) => ({
          publicId,
          guestName,
          name: name,
          tablePosition,
          isConnected,
          chips,
        })
      ),
      textMessageHistory,
      round:
        round == null
          ? undefined
          : {
              roundEnded: round.roundEnded,
              winners: round.winners,
              flop: round.flop,
              turn: round.turn,
              river: round.river,
              pot: round.pot,
              foldedPlayers: round.foldedPlayers,
              dealerPlayerId: round.dealerPlayerId,
              currentTurnPlayerId: round.currentTurnPlayerId,
              bettingRound: round.bettingRound,
              bigBlind,
              smallBlind: bigBlind / 2,
            },
    };
  };

  const computePlayerState = (
    { players }: Session,
    secretPlayerId: string
  ): PlayerState | undefined => {
    const player = players.find(({ secretId }) => secretId == secretPlayerId);
    return player == null
      ? undefined
      : {
          isTypePlayerState: true,
          hand: player.hand,
          chatTimeout: player.textMessageTimeoutSeconds,
          isLeader: player.isLeader,
          isConnected: player.isConnected,
          chips: player.chips,
        };
  };

  wss.on("connection", (ws: WebSocket, req) => {
    const queryObject = url.parse(req.url ?? "", true).query;
    const secretId = queryObject.secretId;

    console.log(`${roomId}: Player connected ${secretId}`);

    if (secretId == null || typeof secretId == "object") {
      send(ws, {
        isTypeMissingPlayerId: true,
        message: `Player ID missing in request`,
      });
      return;
    }

    const session =
      roomId == null ? null : TransientMockDatabase.sessions[roomId];

    if (session == null || roomId == null) {
      send(ws, {
        isTypeRoomNotFound: true,
        message: `Room with that port not found`,
      });
      return;
    }

    const player = session.players.find(
      ({ secretId: currentSecretId }) => currentSecretId == secretId
    );

    if (player == null) {
      send(ws, {
        isTypePlayerIdRoomMismatch: true,
        message: `You were not found in this room, join the room first`,
      });
      return;
    }

    player.isConnected = true;
    clients.set(secretId, ws);

    const pushUpdate = () => {
      broadcast(session);
    };

    pushUpdate();

    let messageCountInTimer = 0;
    let messageCountTimer: NodeJS.Timeout | undefined;

    ws.on("message", (message: string) => {
      const data = JSON.parse(message) as RoomClientToServer;
      if (isSitAtTable(data)) {
        if (
          !isInteger(data.chipCount) ||
          player.tablePosition != null ||
          session.players.some(
            ({ tablePosition }) => tablePosition === data.position
          ) ||
          data.chipCount < session.minInitialChipCount ||
          data.chipCount > session.maxInitialChipCount ||
          (data.name != null &&
            (data.name.length < session.minNameLength ||
              data.name.length > session.maxNameLength))
        ) {
          return;
        }
        player.tablePosition = data.position;
        player.chips = data.chipCount;
        player.name = data.name;
      } else if (isLeaveTable(data)) {
        player.tablePosition = null;
      } else if (isSendTextMessage(data)) {
        if (
          player.textMessageTimeoutSeconds != null ||
          data.message.length > session.maxTextMessageLength
        ) {
          return;
        }
        if (messageCountInTimer > MESSAGE_BURST_MAX) {
          player.textMessageTimeoutSeconds = MESSAGE_TOO_MANY_TIMEOUT_SECONDS;
          const countdownTimer = setInterval(() => {
            if (player.textMessageTimeoutSeconds == 1) {
              player.textMessageTimeoutSeconds = undefined;
              messageCountInTimer = 0;
              messageCountTimer = undefined;
              clearInterval(countdownTimer);
            } else if (player.textMessageTimeoutSeconds != null) {
              player.textMessageTimeoutSeconds--;
            }
            pushUpdate();
          }, 1000);
          pushUpdate();
          return;
        }

        if (messageCountTimer == null) {
          messageCountTimer = setTimeout(() => {
            messageCountTimer = undefined;
            messageCountInTimer = 0;
          }, MESSAGE_BURST_THRESHOLD_MILLISECONDS);
          messageCountInTimer++;
          session.textMessageHistory.push({
            publicPlayerId: player.publicId,
            time: new Date().getTime(),
            message: data.message,
          });
        } else {
          messageCountInTimer++;
          session.textMessageHistory.push({
            publicPlayerId: player.publicId,
            time: new Date().getTime(),
            message: data.message,
          });
        }
      } else if (isStartGame(data)) {
        const sortedValidPlayers = sortPlayersBySeat(session.players).filter(
          ({ chips }) => chips != null && chips > 0
        );

        if (!player.isLeader || sortedValidPlayers.length < 2) {
          return;
        }
        session.gameStarted = true;
        session.round = startRound({
          players: session.players,
          dealerPlayerId: shuffle(sortedValidPlayers)[0].publicId,
          bigBlind: session.bigBlind,
        });
        session.players;
      } else if (isResetGame(data)) {
        const sortedValidPlayers = sortPlayersBySeat(session.players).filter(
          ({ chips }) => chips != null && chips > 0
        );

        if (!player.isLeader || sortedValidPlayers.length < 2) {
          return;
        }
        session.gameStarted = true;
        session.round = startRound({
          players: session.players,
          dealerPlayerId: shuffle(sortedValidPlayers)[0].publicId,
          bigBlind: session.bigBlind,
        });
      } else if (isNextRound(data)) {
        const sortedValidPlayers = sortPlayersBySeat(session.players).filter(
          ({ chips }) => chips != null && chips > 0
        );

        if (!player.isLeader || sortedValidPlayers.length < 2) {
          return;
        }

        session.round = startRound({
          players: sortedValidPlayers,
          dealerPlayerId: shuffle(sortedValidPlayers)[0].publicId,
          bigBlind: session.bigBlind,
        });
      } else if (
        isBettingBet(data) ||
        isBettingCall(data) ||
        isBettingFold(data) ||
        isBettingRaise(data)
      ) {
        handleGameInput({
          session,
          publicPlayerId: player.publicId,
          secretPlayerId: player.secretId,
          input: data,
        });
      }
      pushUpdate();
    });

    ws.on("close", () => {
      if (
        session.players.filter(({ isConnected }) => isConnected).length == 1
      ) {
        setTimeout(() => {
          delete TransientMockDatabase.sessions[roomId];
        }, DeleteRoomAfterInactivityTimeout);
      }

      console.log(`${roomId}: Player disconnected ${secretId}`);
      player.isConnected = false;
      clients.delete(player.secretId);
      pushUpdate();
    });
  });

  return wss;
};
