import { Button } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";

type PokerControlsProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const PokerControls: React.FC<PokerControlsProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const { me, players, onStartGame, onBettingCall, onBettingFold } = gameStore;

  const enoughPlayers =
    players.filter(({ tablePosition }) => tablePosition != null).length >= 2;

  return (
    <div className={css(styles.root, style)}>
      {me?.isLeader && !gameStore.isGameStarted && (
        <Tooltip2
          content="Not enough players!"
          placement="top-end"
          disabled={enoughPlayers}
          intent="warning"
        >
          <Button
            intent="primary"
            large
            className={css(
              styles.actionButton,
              !enoughPlayers && styles.disabled
            )}
            onClick={() => onStartGame()}
          >
            Start game
          </Button>
        </Tooltip2>
      )}
      {gameStore.isGameStarted && (
        <>
          <Button outlined className={css(styles.actionButton)}>
            Raise
          </Button>
          <Button
            outlined
            className={css(styles.actionButton)}
            onClick={() => onBettingCall()}
          >
            Call
          </Button>
          <Button
            outlined
            className={css(styles.actionButton)}
            intent="warning"
            onClick={() => onBettingFold()}
          >
            Fold
          </Button>
        </>
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
          gap: 16,
        },
        actionButton: {
          height: 100,
          padding: 38,
          minWidth: 120,
        },
        disabled: {
          opacity: 0.65,
          cursor: "default",
          pointerEvents: "none",
        },
      }),
    []
  );
};

export default PokerControls;
