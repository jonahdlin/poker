import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import PokerTable from "./PokerTable";
import SeatGrid from "./SeatGrid";

type TableProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const Table: React.FC<TableProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const { me, round } = gameStore;

  if (me == null) {
    return null;
  }

  return (
    <div className={css(styles.root, style)}>
      <PokerTable
        style={styles.tableSurface}
        pot={round?.pot}
        toBeAddedToPot={
          round?.bettingRound == null ||
          round?.bettingRound === "SHOWING_SUMMARY"
            ? undefined
            : round.bettingRound.potThisRound
        }
      />
      <SeatGrid style={styles.seats} gameStore={gameStore} />
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          position: "relative",
          maxWidth: "min(60%, 1400px)",
          minHeight: 550,
          maxHeight: 550,
          minWidth: 1000,
          flex: 1,
        },
        tableSurface: {
          position: "absolute",
          zIndex: 1,
          top: "5%",
          left: "5%",
          height: "90%",
          width: "90%",
        },
        seats: {
          position: "absolute",
          zIndex: 2,
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        },
      }),
    []
  );
};

export default Table;
