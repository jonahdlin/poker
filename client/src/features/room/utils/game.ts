import { useEffect, useState } from "react";
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

export type MePlayer = GenericPlayer & {
  readonly hand?: Hand;
  readonly isLeader: boolean;
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
  readonly round?: Round;

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
  port,
  secretPlayerId,
  publicPlayerId,
}: {
  readonly port: number;
  readonly secretPlayerId: string;
  readonly publicPlayerId: string;
}): GameStore => {
  const [socket, setSocket] = useState<WebSocket>();
  const [disconnected, setDisconnected] = useState(false);
  const [localState, setLocalState] = useState<GameState>();
  const [localMeState, setLocalMeState] = useState<PlayerState>();

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
      `ws://localhost:${port}/socket?secretId=${secretPlayerId}`
    );
    newSocket.onclose = () => {
      setDisconnected(true);
    };
    newSocket.onerror = () => {
      setDisconnected(true);
    };
    newSocket.onmessage = ({ data }: { data: string }) =>
      handleReceiveMessage(data);
    setSocket(newSocket);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [port, secretPlayerId]);

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

  return {
    isConnected: socket != null && !disconnected,
    isLoading: socket == null && !disconnected,

    players: genericPlayers,
    me:
      myPlayer == null || localMeState == null
        ? undefined
        : {
            publicId: myPlayer.publicId,
            guestName: myPlayer.guestName,
            name: myPlayer.name,
            tablePosition: myPlayer.tablePosition,
            isConnected: myPlayer.isConnected,
            hand: localMeState.hand,
            textMessageTimeout: localMeState?.chatTimeout,
            isLeader: localMeState.isLeader,
          },
    availableSeats: AllSeats.filter((seat) => !takenSeats.includes(seat)),
    isGameStarted: localState?.gameStarted ?? false,
    round: localState?.round,

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
  };
};
