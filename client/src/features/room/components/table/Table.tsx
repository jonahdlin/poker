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

  const { me } = gameStore;

  if (me == null) {
    return null;
  }

  return (
    <div className={css(styles.root, style)}>
      <PokerTable style={styles.tableSurface} gameStore={gameStore} />
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
        bets: {
          position: "absolute",
          zIndex: 3,
          top: "15%",
          left: "15%",
          height: "70%",
          width: "70%",
        },
      }),
    []
  );
};

export default Table;
