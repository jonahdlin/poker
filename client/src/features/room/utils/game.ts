import { useEnvironmentContext } from "providers/EnvironmentProvider";
import { useEffect, useMemo, useState } from "react";
import {
  Hand,
  GameState,
  isGameState,
  RoomClientToServer,
  RoomServerToClient,
  TablePosition,
  isPlayerState,
  PlayerState,
  PlayerDataNoId,
  TextMessageHistoryEntry,
  Round,
} from "schema/types";

export type GenericPlayer = {
  readonly publicId: string;
  readonly guestName: string;
  readonly name?: string;
  readonly tablePosition: TablePosition | null;
  readonly isConnected: boolean;
  readonly textMessageTimeout?: number;
  readonly chips?: number;
  readonly secondsLeftInTurn?: number;
};

export type PokerAction = "RAISE" | "CALL" | "CHECK" | "BET" | "FOLD";

export type MePlayer = GenericPlayer & {
  readonly hand?: Hand;
  readonly isLeader: boolean;

  readonly availableActions: ReadonlyArray<PokerAction>;
};

export type GameStore = {
  readonly isConnected: boolean;
  readonly isLoading: boolean;

  readonly maxTextMessageLength: number;
  readonly maxNameLength: number;
  readonly minNameLength: number;
  readonly maxInitialChipCount: number;
  readonly minInitialChipCount: number;

  readonly players: ReadonlyArray<GenericPlayer>;
  readonly me?: MePlayer;
  readonly availableSeats: ReadonlyArray<TablePosition>;

  readonly textMessageHistory: ReadonlyArray<TextMessageHistoryEntry>;

  readonly isGameStarted: boolean;
  readonly round?: Round & {
    readonly potThisRound: number;
    readonly minimumRaise: number;
  };

  readonly getPlayerByPublicId: (
    playerPublicId: string
  ) => GenericPlayer | undefined;

  readonly onSit: (args: {
    readonly position: TablePosition;
    readonly chipCount: number;
    readonly name?: string;
  }) => unknown;
  readonly onLeave: () => unknown;
  readonly onSendTextMessage: (message: string) => unknown;
  readonly onStartGame: () => unknown;
  readonly onNextRound: () => unknown;
  readonly onBettingCall: () => unknown;
  readonly onBettingFold: () => unknown;
  readonly onBettingRaise: (amount: number) => unknown;
  readonly onBettingBet: (amount: number) => unknown;
};

export const AllSeats: ReadonlyArray<TablePosition> = [
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
];

export const useGame = ({
  roomId,
  secretPlayerId,
  publicPlayerId,
}: {
  readonly roomId: string;
  readonly secretPlayerId: string;
  readonly publicPlayerId: string;
}): GameStore => {
  const [socket, setSocket] = useState<WebSocket>();
  const [disconnected, setDisconnected] = useState(false);
  const [localState, setLocalState] = useState<GameState>();
  const [localMeState, setLocalMeState] = useState<PlayerState>();

  const { environment } = useEnvironmentContext();

  // Receiving
  const handleReceiveMessage = (msg: string) => {
    const data = JSON.parse(msg) as RoomServerToClient;
    console.log("Receiving");
    console.log(data);

    if (isGameState(data)) {
      setLocalState(data);
    } else if (isPlayerState(data)) {
      setLocalMeState(data);
      return;
    }
  };

  useEffect(() => {
    if (socket != null) {
      return;
    }
    const newSocket = new WebSocket(
      `ws://${
        environment === "production" ? window.location.host : "localhost:25565"
      }/socket/${roomId}?secretId=${secretPlayerId}`
    );
    newSocket.onclose = () => {
      console.log("closed socket");
      setDisconnected(true);
    };
    newSocket.onerror = () => {
      console.log("error socket");
      setDisconnected(true);
    };
    newSocket.onmessage = ({ data }: { data: string }) =>
      handleReceiveMessage(data);
    setSocket(newSocket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, secretPlayerId]);

  // Sending
  const send = (data: RoomClientToServer) => {
    console.log("Sending");
    console.log(data);
    socket?.send(JSON.stringify(data));
  };

  const onSit = ({
    position,
    chipCount,
    name,
  }: {
    readonly position: TablePosition;
    readonly chipCount: number;
    readonly name?: string;
  }) => {
    send({
      isTypeSitAtTable: true,
      position,
      chipCount,
      name,
    });
  };

  const onLeave = () => {
    send({
      isTypeLeaveTable: true,
    });
  };

  const onSendTextMessage = (message: string) => {
    if (localMeState?.chatTimeout != null) {
      return;
    }
    send({
      isTypeSendTextMessage: true,
      message,
    });
  };

  const onStartGame = () => {
    if (!localMeState?.isLeader) {
      return;
    }

    send({
      isTypeStartGame: true,
    });
  };

  const onNextRound = () => {
    if (!localMeState?.isLeader) {
      return;
    }

    send({
      isTypeNextRound: true,
    });
  };

  const onBettingCall = () => {
    send({
      isTypeBettingCall: true,
    });
  };

  const onBettingFold = () => {
    send({
      isTypeBettingFold: true,
    });
  };

  const onBettingRaise = (amount: number) => {
    send({
      isTypeBettingRaise: true,

      amount,
    });
  };

  const onBettingBet = (amount: number) => {
    send({
      isTypeBettingBet: true,

      amount,
    });
  };

  const takenSeats = (localState?.players ?? []).map(
    ({ tablePosition }) => tablePosition
  );

  const myPlayer = (localState?.players ?? []).find(
    ({ publicId }) => publicId === publicPlayerId
  );

  const statePlayerToGenericPlayer = ({
    guestName,
    name,
    tablePosition,
    isConnected,
    publicId,
    chips,
  }: PlayerDataNoId): GenericPlayer => ({
    publicId,
    guestName,
    name,
    tablePosition,
    isConnected,
    chips,
  });

  const genericPlayers = (localState?.players ?? []).map(
    statePlayerToGenericPlayer
  );

  const computePotThisRound = () => {
    if (
      localState?.round?.bettingRound == null ||
      localState.round.bettingRound === "SHOWING_SUMMARY"
    ) {
      return 0;
    }

    return Object.values(
      localState.round.bettingRound.betsThisRound
    ).reduce<number>((acc, amt) => acc + (amt ?? 0), 0);
  };

  const round = localState?.round;

  const me = useMemo((): MePlayer | undefined => {
    if (myPlayer == null || localMeState == null) {
      return;
    }

    const availableActions = (() => {
      if (round == null || round.bettingRound === "SHOWING_SUMMARY") {
        return [];
      }

      const maxBet = Object.values(
        round.bettingRound.betsThisRound
      ).reduce<number>((acc, bet) => Math.max(acc, bet ?? 0), 0);

      // true if it is
      // - the first betting round
      // - you are the big blind
      // - nobody has raised yet
      const firstRoundCheckException =
        round.flop == null &&
        round.bettingRound.startingPlayerId === myPlayer.publicId &&
        maxBet === round.bigBlind;

      const includeBet = round.bettingRound.lastRaiserPlayerId == null;

      const includeRaise = round.bettingRound.lastRaiserPlayerId != null;

      const includeCheck =
        round.bettingRound.lastRaiserPlayerId == null ||
        firstRoundCheckException;

      const includeCall =
        round.bettingRound.lastRaiserPlayerId != null &&
        !firstRoundCheckException;

      const includeFold = true;

      const allActions: ReadonlyArray<PokerAction | false> = [
        includeBet && "BET",
        includeRaise && "RAISE",
        includeCheck && "CHECK",
        includeCall && "CALL",
        includeFold && "FOLD",
      ];

      return allActions.filter(
        (actionOrFalse) => actionOrFalse
      ) as ReadonlyArray<PokerAction>;
    })();

    return {
      ...myPlayer,
      hand: localMeState.hand,
      textMessageTimeout: localMeState?.chatTimeout,
      isLeader: localMeState.isLeader,
      availableActions,
    };
  }, [myPlayer, localMeState, round]);

  return {
    isConnected: socket != null && !disconnected,
    isLoading: socket == null && !disconnected,

    players: genericPlayers,
    me,
    availableSeats: AllSeats.filter((seat) => !takenSeats.includes(seat)),
    isGameStarted: localState?.gameStarted ?? false,
    round:
      round == null
        ? undefined
        : {
            ...round,
            potThisRound: computePotThisRound(),
            minimumRaise:
              round.bettingRound === "SHOWING_SUMMARY" ||
              round.bettingRound.lastRaise == null ||
              round.bettingRound.lastRaise === 0
                ? round.bigBlind
                : round.bettingRound.lastRaise,
          },

    maxTextMessageLength: localState?.maxTextMessageLength ?? 500,
    maxNameLength: localState?.maxNameLength ?? 50,
    minNameLength: localState?.minNameLength ?? 2,
    maxInitialChipCount: localState?.maxInitialChipCount ?? 1000000,
    minInitialChipCount: localState?.minInitialChipCount ?? 1,

    textMessageHistory: localState?.textMessageHistory ?? [],

    getPlayerByPublicId: (playerPublicId) =>
      genericPlayers.find(({ publicId }) => publicId === playerPublicId),

    onSit,
    onLeave,
    onSendTextMessage,
    onStartGame,
    onNextRound,

    onBettingCall,
    onBettingFold,
    onBettingRaise,
    onBettingBet,
  };
};
