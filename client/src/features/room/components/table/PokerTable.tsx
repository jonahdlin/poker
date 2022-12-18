import { Colors } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import CommunityCards from "features/room/components/table/CommunityCards";
import Pot from "features/room/components/table/Pot";
import { GameStore } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";

type PokerTableProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const PokerTable: React.FC<PokerTableProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const { round } = gameStore;

  const pot = round?.pot;
  const toBeAddedToPot =
    round?.bettingRound == null ||
    round?.bettingRound === "SHOWING_SUMMARY" ||
    round.potThisRound === 0
      ? undefined
      : round.potThisRound;

  const flop = round?.flop;
  const turn = round?.turn;
  const river = round?.river;

  return (
    <div className={css(styles.root, style)}>
      {pot != null && (
        <Pot style={styles.pot} pot={pot} toBeAddedToPot={toBeAddedToPot} />
      )}
      {(flop != null || turn != null || river != null) && (
        <CommunityCards flop={flop} turn={turn} river={river} />
      )}
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          backgroundRepeat: "repeat",
          border: `10px solid ${Colors.GREEN3}`,
          backgroundColor: Colors.GREEN4,
          boxShadow: "0px 0px 4px 0px rgb(0 0 0 / 40%)",
          gap: 16,
        },
        pot: {},
      }),
    []
  );
};

export default PokerTable;
