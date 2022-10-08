/* Utility */
export type Suit = "SPADE" | "CLUB" | "HEART" | "DIAMOND";

export type Card = {
  readonly value: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A";
  readonly suit: Suit;
};

export type Hand = {
  readonly card1: Card;
  readonly card2: Card;
};

/* Get */
export type GetSuccessResponse<T extends Record<string, unknown>> = {
  readonly ok: true;
  readonly message?: undefined;
  readonly data: T;
};

export type GetErrorResponse = {
  readonly ok: false;
  readonly message: string;
  readonly data?: undefined;
};

export type GetEndpoint = "/api/get-room";

export type GetEndpointIO<T extends GetEndpoint> = T extends "/api/get-room"
  ? {
      readonly req: {
        readonly id: string;
      };
      readonly res:
        | GetSuccessResponse<{
            readonly name: string;
            readonly port: number;
          }>
        | GetErrorResponse;
    }
  : never;

/* Post */
export type PostSuccessResponse<T extends Record<string, unknown>> = {
  readonly ok: true;
  readonly message: undefined;
  readonly data: T;
};

export type PostErrorResponse = {
  readonly ok: false;
  readonly message: string;
  readonly data: undefined;
};

export type PostEndpoint = "/api/create-room" | "/api/join-room";

export type PostEndpointIO<T extends PostEndpoint> =
  T extends "/api/create-room"
    ? {
        readonly req: {
          readonly roomName: string;
        };
        readonly res:
          | PostSuccessResponse<{
              readonly roomId: string;
            }>
          | PostErrorResponse;
      }
    : T extends "/api/join-room"
    ? {
        readonly req: {
          readonly roomId: string;
        };
        readonly res:
          | PostSuccessResponse<{
              readonly secretPlayerId: string;
              readonly publicPlayerId: string;
              readonly port: number;
            }>
          | PostErrorResponse;
      }
    : never;

/* Socket (room) */
export type SitAtTable = {
  readonly isTypeSitAtTable: true;

  readonly position: TablePosition;
  readonly chipCount: number;
  readonly name?: string;
};
export const isSitAtTable = (arg: unknown): arg is SitAtTable => {
  return arg != null && typeof arg == "object" && "isTypeSitAtTable" in arg;
};

export type LeaveTable = {
  readonly isTypeLeaveTable: true;
};
export const isLeaveTable = (arg: unknown): arg is LeaveTable => {
  return arg != null && typeof arg == "object" && "isTypeLeaveTable" in arg;
};

export type SendTextMessage = {
  readonly isTypeSendTextMessage: true;

  readonly message: string;
};
export const isSendTextMessage = (arg: unknown): arg is SendTextMessage => {
  return (
    arg != null && typeof arg == "object" && "isTypeSendTextMessage" in arg
  );
};

export type StartGame = {
  readonly isTypeStartGame: true;
};
export const isStartGame = (arg: unknown): arg is StartGame => {
  return arg != null && typeof arg == "object" && "isTypeStartGame" in arg;
};

export type BettingCall = {
  readonly isTypeBettingCall: true;
};
export const isBettingCall = (arg: unknown): arg is BettingCall => {
  return arg != null && typeof arg == "object" && "isTypeBettingCall" in arg;
};

export type BettingRaise = {
  readonly isTypeBettingRaise: true;

  readonly amount: number;
};
export const isBettingRaise = (arg: unknown): arg is BettingRaise => {
  return arg != null && typeof arg == "object" && "isTypeBettingRaise" in arg;
};

export type BettingBet = {
  readonly isTypeBettingBet: true;

  readonly amount: number;
};
export const isBettingBet = (arg: unknown): arg is BettingBet => {
  return arg != null && typeof arg == "object" && "isTypeBettingBet" in arg;
};

export type BettingFold = {
  readonly isTypeBettingFold: true;
};
export const isBettingFold = (arg: unknown): arg is BettingFold => {
  return arg != null && typeof arg == "object" && "isTypeBettingFold" in arg;
};

export type RoomClientToServer =
  | SitAtTable
  | LeaveTable
  | SendTextMessage
  | StartGame
  | BettingCall
  | BettingRaise
  | BettingBet
  | BettingFold;

export type RoomNotFound = {
  readonly isTypeRoomNotFound: true;
  readonly message: string;
};
export const isRoomNotFound = (arg: unknown): arg is RoomNotFound => {
  return arg != null && typeof arg == "object" && "isTypeRoomNotFound" in arg;
};

export type MissingPlayerId = {
  readonly isTypeMissingPlayerId: true;
  readonly message: string;
};
export const isMissingPlayerId = (arg: unknown): arg is MissingPlayerId => {
  return (
    arg != null && typeof arg == "object" && "isTypeMissingPlayerId" in arg
  );
};

export type PlayerIdRoomMismatch = {
  readonly isTypePlayerIdRoomMismatch: true;
  readonly message: string;
};
export const isPlayerIdRoomMismatch = (
  arg: unknown
): arg is PlayerIdRoomMismatch => {
  return (
    arg != null && typeof arg == "object" && "isTypePlayerIdRoomMismatch" in arg
  );
};

export type TablePosition =
  | "ONE"
  | "TWO"
  | "THREE"
  | "FOUR"
  | "FIVE"
  | "SIX"
  | "SEVEN"
  | "EIGHT"
  | "NINE";
export type PlayerDataNoId = {
  readonly publicId: string;
  readonly guestName: string;
  readonly name?: string;
  readonly tablePosition: TablePosition | null;
  readonly isConnected: boolean;
  readonly chips?: number;
};

export type TextMessageHistoryEntry = {
  readonly publicPlayerId: string;
  readonly message: string;
  // in unix
  readonly time: number;
};

export type Round = {
  // set to false initially and then true when the round is over
  // If this round object still exists and roundEnded is true, then there is likely
  // a timer set on the BE to delete the round object. This time is for players to
  // review the results of the round before the next one starts
  roundEnded: boolean;
  winner?: string; // public player ID

  // cards
  flop?: [Card, Card, Card];
  turn?: Card;
  river?: Card;

  // chip/betting info
  pot: number;
  lastRaise?: number; // kept track of for minimum bets
  lastRaiserPlayerId?: string; // public player ID
  currentTrickStartingPlayerId: string; // public player ID, the person who had the first turn in this round of betting
  currentBet?: number;
  foldedPlayers: Array<string>; // public player ID

  // player positions
  dealerPlayerId: string; // public player ID
  currentTurnPlayerId?: string; // public player ID
};

export type GameState = {
  readonly isTypeGameState: true;

  readonly maxTextMessageLength: number;
  readonly maxNameLength: number;
  readonly minNameLength: number;
  readonly maxInitialChipCount: number;
  readonly minInitialChipCount: number;

  readonly players: ReadonlyArray<PlayerDataNoId>;
  readonly gameStarted: boolean;
  readonly round?: Round;
  readonly bigBlind: number;

  readonly textMessageHistory: ReadonlyArray<TextMessageHistoryEntry>;
};
export const isGameState = (arg: unknown): arg is GameState => {
  return arg != null && typeof arg == "object" && "isTypeGameState" in arg;
};

export type PlayerState = {
  readonly isTypePlayerState: true;

  readonly hand?: Hand;
  readonly chatTimeout?: number;
  readonly isLeader: boolean;
  readonly isConnected: boolean;
  readonly chips?: number;
};
export const isPlayerState = (arg: unknown): arg is PlayerState => {
  return arg != null && typeof arg == "object" && "isTypePlayerState" in arg;
};

export type RoomServerToClient =
  | RoomNotFound
  | MissingPlayerId
  | PlayerIdRoomMismatch
  | GameState
  | PlayerState;
