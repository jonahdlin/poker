import { Button, Drawer, DrawerSize } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { useMemo, useState } from "react";
import { DefaultProps } from "utils/styles";
import PlayerMenu from "./PlayerMenu";

type PlayerMenuButtonProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const PlayerMenuButton: React.FC<PlayerMenuButtonProps> = ({
  style,
  gameStore,
}) => {
  const styles = useStyleSheet();

  const [open, setOpen] = useState(false);

  return (
    <div className={css(style)}>
      <Button
        className={css(styles.button, style)}
        icon="people"
        onClick={() => setOpen(!open)}
        intent={open ? "primary" : "none"}
        outlined
      />
      <Drawer
        title="Players"
        hasBackdrop={false}
        position="top"
        isOpen={open}
        onClose={() => setOpen(false)}
        size={DrawerSize.SMALL}
      >
        <PlayerMenu style={styles.playerMenu} gameStore={gameStore} />
      </Drawer>
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        button: {
          height: 42,
          width: 42,
          borderRadius: "50%",
        },
        playerMenu: { padding: 24 },
      }),
    []
  );
};

export default PlayerMenuButton;
