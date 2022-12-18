import { Card, H6, Icon } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import { GenericPlayer } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import ChipCount from "features/room/components/common/ChipCount";
import PlayerStatus from "./PlayerStatus";

type PlayerProps = DefaultProps & {
  readonly player: GenericPlayer;
};

const Player: React.FC<PlayerProps> = ({ style, player }) => {
  const styles = useStyleSheet();

  return (
    <Card className={css(styles.root, style)}>
      <div className={css(styles.headerRow)}>
        <H6 style={{ margin: 0 }}>{player.name ?? player.guestName}</H6>
        <PlayerStatus player={player} />
        {player.tablePosition == null && <Icon icon="eye-open" />}
      </div>
      {player.chips !== undefined && (
        <div className={css(styles.infoRow)}>
          <ChipCount count={player.chips} />
        </div>
      )}
    </Card>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          flexDirection: "column",
          gap: 4,
        },
        headerRow: {
          display: "flex",
          gap: 4,
          alignItems: "center",
        },
        infoRow: {
          display: "flex",
          gap: 4,
          alignItems: "center",
        },
      }),
    []
  );
};

export default Player;
