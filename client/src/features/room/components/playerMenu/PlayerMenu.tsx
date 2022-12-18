import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { sortBy } from "lodash";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import Player from "./Player";

type PlayerMenuProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const PlayerMenu: React.FC<PlayerMenuProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const { players } = gameStore;

  return (
    <div className={css(styles.root, style)}>
      {sortBy(players, ({ tablePosition }) =>
        tablePosition == null ? 1 : 0
      ).map((player) => (
        <Player player={player} />
      ))}
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
        },
      }),
    []
  );
};

export default PlayerMenu;
