import {
  Card,
  Hand,
  Round,
  TablePosition,
  TextMessageHistoryEntry,
} from "src/types";
import { Writeable } from "src/utils/types";
import { WebSocketServer } from "ws";

export type Player = {
  // secret, used to identify player when they connect or make a request
  readonly secretId: string;
  // public, used to send to all clients. Kept separate from secretId so not just any player
  // can send requests for any other player
  readonly publicId: string;
  isLeader: boolean;
  isConnected: boolean;
  tablePosition: TablePosition | null;
  guestName: string;
  textMessageTimeoutSeconds?: number;

  name?: string;
  chips?: number;
  hand?: Hand;
};

export type RoundWithHiddenInfo = Writeable<Omit<Round, "bettingRound">> & {
  bettingRound: Writeable<Round["bettingRound"]>;
} & {
  deck: Array<Card>;
  hands: Map<
    string, // secret player ID
    Hand
  >;
};

export type Session = {
  // Session data
  readonly id: string;
  readonly wss: WebSocketServer;
  readonly name: string;

  // Session constants
  maxTextMessageLength: number;
  maxNameLength: number;
  minNameLength: number;
  maxInitialChipCount: number;
  minInitialChipCount: number;

  // Player info
  players: Player[];

  // Game state
  gameStarted: boolean;
  dealerPlayerId?: string; // public player ID
  round?: RoundWithHiddenInfo;
  bigBlind: number;

  // Messages
  textMessageHistory: Array<TextMessageHistoryEntry>;
};

export type TransientMockDatabaseType = {
  sessions: {
    [id: string]: Session;
  };
};
