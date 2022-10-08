import { TransientMockDatabaseType } from "src/db/schema";
import range from "lodash/range";

export const PossiblePorts: ReadonlyArray<number> = range(10000, 60000);

export const TransientMockDatabase: TransientMockDatabaseType = {
  sessions: {},
};
