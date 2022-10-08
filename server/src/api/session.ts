import { Express } from "express";
import http from "http";
import {
  BettingBet,
  BettingCall,
  BettingFold,
  BettingRaise,
  Card,
  GameState,
  isBettingBet,
  isBettingCall,
  isBettingFold,
  isBettingRaise,
  isLeaveTable,
  isSendTextMessage,
  isSitAtTable,
  isStartGame,
  PlayerState,
  RoomClientToServer,
  RoomServerToClient,
  TablePosition,
} from "src/types";
import { WebSocket, Server } from "ws";
import url from "url";
import { TransientMockDatabase } from "src/db/db";
import {
  DeleteRoomAfterInactivityTimeout,
  generateDeck,
  sortPlayersBySeat,
} from "src/utils/session";
import { Player, RoundWithHiddenInfo, Session } from "src/db/schema";
import {
  MESSAGE_BURST_MAX,
  MESSAGE_BURST_THRESHOLD_MILLISECONDS,
  MESSAGE_TOO_MANY_TIMEOUT_SECONDS,
} from "src/utils/constants";
import { shuffle } from "lodash";

export const createRoomWs = (app: Express, port: number) => {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server, path: `/socket` });

  const send = (ws: WebSocket, data: RoomServerToClient) => {
    ws.send(JSON.stringify(data));
  };

  const broadcast = (
    ws: WebSocket,
    data: RoomServerToClient,
    excludeSelf: boolean = false
  ) => {
    wss.clients.forEach(function each(client) {
      if (
        (!excludeSelf || client !== ws) &&
        client.readyState === WebSocket.OPEN
      ) {
        send(client, data);
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
    bigBlind,
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
      bigBlind,
      round,
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

  // - mutates players
  // - dealerPlayerId must occur in players and be seated at the table and have chips
  // - bigBlind must be a multiple of 2
  const startRound = ({
    players,
    dealerPlayerId,
    bigBlind,
  }: {
    players: ReadonlyArray<Player>;
    readonly dealerPlayerId: string;
    readonly bigBlind: number;
  }): RoundWithHiddenInfo => {
    let deck: RoundWithHiddenInfo["deck"] = generateDeck();
    const sortedPlayers = sortPlayersBySeat(players).filter(
      ({ chips }) => chips != null && chips > 0
    );
    const hands: RoundWithHiddenInfo["hands"] = new Map(
      sortedPlayers.map(({ secretId }) => [
        secretId,
        {
          // safe cast as long as generateDeck() returns enough cards for every player
          card1: deck.pop() as Card,
          card2: deck.pop() as Card,
        },
      ])
    );

    const dealerIndex = sortedPlayers.findIndex(
      ({ publicId }) => publicId == dealerPlayerId
    );

    const nextIndex = (index: number): number =>
      index == sortedPlayers.length - 1 ? 0 : index + 1;

    const smallBlindPlayer = sortedPlayers[nextIndex(dealerIndex)];
    const bigBlindPlayer = sortedPlayers[nextIndex(nextIndex(dealerIndex))];
    const firstPlayer =
      sortedPlayers[nextIndex(nextIndex(nextIndex(dealerIndex)))];

    const smallBlindRealAmount = Math.min(
      smallBlindPlayer.chips ?? 0,
      bigBlind / 2
    );

    const bigBlindRealAmount = Math.min(bigBlindPlayer.chips ?? 0, bigBlind);

    smallBlindPlayer.chips =
      (smallBlindPlayer.chips ?? 0) - smallBlindRealAmount;
    bigBlindPlayer.chips = (bigBlindPlayer.chips ?? 0) - bigBlindRealAmount;

    sortedPlayers.forEach((player) => {
      const hand = hands.get(player.secretId);
      if (hand != null) {
        player.hand = hand;
      }
    });

    return {
      deck,
      dealerPlayerId,
      hands,
      foldedPlayers: [],
      pot: smallBlindRealAmount + bigBlindRealAmount,
      currentTrickStartingPlayerId: bigBlindPlayer.publicId,
      currentTurnPlayerId: firstPlayer.publicId,
      lastRaise: bigBlind, // set to big blind regardless of whether the BB was actually paid
      roundEnded: false,
    };
  };

  // mutates session
  const handleGameInput = ({
    session,
    publicPlayerId,
    secretPlayerId,
    input,
  }: {
    session: Session;
    readonly publicPlayerId: string; // of player who did the input
    readonly secretPlayerId: string; // of player who did the input
    readonly input: BettingCall | BettingRaise | BettingBet | BettingFold;
  }) => {
    if (
      session.round == null ||
      session.round.currentTurnPlayerId != publicPlayerId
    ) {
      return;
    }

    const { round, bigBlind } = session;

    const sortedPlayersInRound = sortPlayersBySeat(session.players).filter(
      ({ publicId }) => !round.foldedPlayers.includes(publicId)
    );

    const currentPlayerInRoundIndex = sortedPlayersInRound.findIndex(
      ({ publicId, secretId }) =>
        publicId == publicPlayerId && secretId == secretPlayerId
    );
    const currentPlayerInRound =
      currentPlayerInRoundIndex == -1
        ? undefined
        : sortedPlayersInRound[currentPlayerInRoundIndex];

    if (
      currentPlayerInRound == null ||
      currentPlayerInRound.chips == null ||
      sortedPlayersInRound.length < 2
    ) {
      return;
    }

    const nextPlayer =
      currentPlayerInRoundIndex == sortedPlayersInRound.length - 1
        ? sortedPlayersInRound[0]
        : sortedPlayersInRound[currentPlayerInRoundIndex + 1];

    const beginNextPhase = () => {
      const newSortedPlayersInRound = sortPlayersBySeat(session.players).filter(
        ({ publicId }) => !round.foldedPlayers.includes(publicId)
      );

      // everybody folded
      if (newSortedPlayersInRound.length == 1) {
        round.roundEnded = true;
        round.winner = newSortedPlayersInRound[0].publicId;
        newSortedPlayersInRound[0].chips =
          (newSortedPlayersInRound[0].chips ?? 0) + round.pot;
        return;
      }

      // finds first non-folded player starting from left of dealer
      const getNextStartingPlayer = (): Player => {
        const allSeatedPlayers = sortPlayersBySeat(session.players);
        const next = (player: Player): Player => {
          const index = allSeatedPlayers.findIndex(
            ({ publicId }) => publicId == player.publicId
          );
          const nextIndex =
            index == allSeatedPlayers.length - 1 ? 0 : index + 1;
          return allSeatedPlayers[nextIndex];
        };

        // assume dealer is still seated, safe since forfeiting your seat only occurs when you
        // leave the game or run out of chips, neither of which happen mid round
        const dealer = allSeatedPlayers.find(
          ({ publicId }) => publicId == round.dealerPlayerId
        ) as Player;

        let protection = 0;
        let starter = next(dealer);
        while (
          protection <= allSeatedPlayers.length + 1 &&
          !newSortedPlayersInRound.some(
            ({ publicId }) => publicId == starter.publicId
          )
        ) {
          starter = next(starter);
          protection++;
        }

        return starter;
      };

      const resetBetting = () => {
        round.currentBet = undefined;
        round.lastRaise = undefined;
        round.lastRaiserPlayerId = undefined;
        const starter = getNextStartingPlayer();
        round.currentTrickStartingPlayerId = starter.publicId;
        round.currentTurnPlayerId = starter.publicId;
      };

      // finished preflop, deal the flop
      if (round.flop == null) {
        // safe to cast since the deck should have enough cards for the round
        round.flop = [
          round.deck.pop() as Card,
          round.deck.pop() as Card,
          round.deck.pop() as Card,
        ];
        resetBetting();
        return;
      }

      // finished flop, deal the turn
      if (round.turn == null) {
        round.turn = round.deck.pop();
        resetBetting();
        return;
      }

      // finished turn, deal the river
      if (round.river == null) {
        round.river = round.deck.pop();
        resetBetting();
        return;
      }

      // all betting rounds done, finish the round
      // TODO: Actually decide winner
      round.roundEnded = true;
      round.winner = newSortedPlayersInRound[0].publicId;
      newSortedPlayersInRound[0].chips =
        (newSortedPlayersInRound[0].chips ?? 0) + round.pot;
    };

    if (isBettingFold(input)) {
      round.foldedPlayers.push(publicPlayerId);
      const newSortedPlayersInRound = sortPlayersBySeat(session.players).filter(
        ({ publicId }) => !round.foldedPlayers.includes(publicId)
      );
      if (
        (round.lastRaiserPlayerId != null &&
          nextPlayer.publicId == round.lastRaiserPlayerId) ||
        (round.lastRaiserPlayerId == null &&
          nextPlayer.publicId == round.currentTrickStartingPlayerId) ||
        newSortedPlayersInRound.length == 1
      ) {
        beginNextPhase();
      } else {
        round.currentTurnPlayerId = nextPlayer.publicId;
      }
      return;
    }

    if (isBettingCall(input)) {
      // cannot call if no bet has been made
      if (round.currentBet == null || round.currentBet == 0) {
        return;
      }

      // cannot call if you have no chips
      if (currentPlayerInRound.chips == 0) {
        return;
      }

      const targetAmount = round.currentBet;
      const realAmount = Math.min(targetAmount, currentPlayerInRound.chips);

      currentPlayerInRound.chips -= realAmount;
      round.pot += realAmount;

      if (nextPlayer.publicId == round.lastRaiserPlayerId) {
        beginNextPhase();
      } else {
        round.currentTurnPlayerId = nextPlayer.publicId;
      }
      return;
    }

    if (isBettingBet(input)) {
      // cannot check (bet of 0) or bet if there has already been a nonzero bet,
      // in that case you can only call or raise
      if (round.currentBet != null && round.currentBet > 0) {
        return;
      }

      // cannot bet more chips than you have
      if (currentPlayerInRound.chips < input.amount) {
        return;
      }

      // checking case
      if (input.amount == 0) {
        // checks all around
        if (nextPlayer.publicId == round.currentTrickStartingPlayerId) {
          beginNextPhase();
          return;
        }

        round.currentTurnPlayerId = nextPlayer.publicId;
        return;
      }

      // if not a check, must bet at least big blind
      if (input.amount < bigBlind) {
        return;
      }

      currentPlayerInRound.chips -= input.amount;
      round.pot += input.amount;
      round.lastRaise = input.amount;
      round.lastRaiserPlayerId = publicPlayerId;
      round.currentTurnPlayerId = nextPlayer.publicId;

      return;
    }

    if (isBettingRaise(input)) {
      // cannot raise if a bet has not been placed
      // in that case you can only check or bet
      if (
        round.currentBet == null ||
        round.currentBet == 0 ||
        round.lastRaise == null
      ) {
        return;
      }

      // cannot raise more chips than you have
      if (currentPlayerInRound.chips < input.amount) {
        return;
      }

      // cannot raise less than last raise unless it's an all in
      if (
        input.amount != currentPlayerInRound.chips &&
        input.amount < round.lastRaise
      ) {
        return;
      }

      currentPlayerInRound.chips -= input.amount;
      round.pot += input.amount;
      round.lastRaise = input.amount;
      round.lastRaiserPlayerId = publicPlayerId;
      round.currentTurnPlayerId = nextPlayer.publicId;

      return;
    }
  };

  wss.on("connection", (ws: WebSocket, req) => {
    const queryObject = url.parse(req.url ?? "", true).query;
    const secretId = queryObject.secretId;

    if (secretId == null || typeof secretId == "object") {
      send(ws, {
        isTypeMissingPlayerId: true,
        message: `Player ID missing in request`,
      });
      return;
    }

    const roomId = Object.keys(TransientMockDatabase.sessions).find((key) => {
      const possibleSession = TransientMockDatabase.sessions[key];
      return possibleSession != null && possibleSession.port == port;
    });

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

    const pushUpdate = () => {
      broadcast(ws, computeGameState(session));
      const playerState = computePlayerState(session, secretId);
      if (playerState != null) {
        send(ws, playerState);
      }
    };

    pushUpdate();

    let messageCountInTimer = 0;
    let messageCountTimer: NodeJS.Timeout | undefined;

    ws.on("message", (message: string) => {
      const data = JSON.parse(message) as RoomClientToServer;
      if (isSitAtTable(data)) {
        if (
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

      player.isConnected = false;
      pushUpdate();
    });
  });

  server.listen(port, () => {
    console.log(`Room ready and listening on ${port}`);
  });
};
