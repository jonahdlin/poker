import { Button, H5, H6 } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { useMemo, useState } from "react";
import { DefaultProps } from "utils/styles";

type AdminControlsProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const HoverOpenDelay = 500;

const AdminControls: React.FC<AdminControlsProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const [open, setOpen] = useState(false);

  const { players, isGameStarted, round, onStartGame, onNextRound } = gameStore;

  const enoughPlayers = useMemo(
    () =>
      players.filter(({ tablePosition }) => tablePosition != null).length >= 2,
    [players]
  );

  const startGameDisabledReason = useMemo(() => {
    if (!enoughPlayers) {
      return "Not enough players!";
    }

    if (isGameStarted) {
      return "Game already started";
    }
  }, [enoughPlayers, isGameStarted]);

  const restartGameDisabledReason = useMemo(() => {
    if (!enoughPlayers) {
      return "Not enough players!";
    }

    if (!isGameStarted) {
      return "Game not yet started";
    }
  }, [enoughPlayers, isGameStarted]);

  const nextRoundDisabledReason = useMemo(() => {
    if (!enoughPlayers) {
      return "Not enough players!";
    }

    if (round != null && round.bettingRound !== "SHOWING_SUMMARY") {
      return "Wait until the end of the round";
    }
  }, [enoughPlayers, round]);

  return (
    <div className={css(style)}>
      <Popover2
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
        content={
          <div className={css(styles.content)}>
            <H5>Admin Controls</H5>
            <H6>Game state</H6>
            <div className={css(styles.buttonGroup)}>
              <Tooltip2
                content={startGameDisabledReason}
                placement="top"
                disabled={startGameDisabledReason == null}
                intent="warning"
                hoverOpenDelay={HoverOpenDelay}
              >
                <Button
                  intent="primary"
                  minimal
                  outlined
                  className={css(
                    startGameDisabledReason != null && styles.disabled
                  )}
                  onClick={() => onStartGame()}
                >
                  Start game
                </Button>
              </Tooltip2>

              <Tooltip2
                content={"Does not reset chip amounts"}
                placement="top"
                intent="danger"
                hoverOpenDelay={HoverOpenDelay}
              >
                <Button
                  intent="danger"
                  minimal
                  outlined
                  className={css(
                    restartGameDisabledReason != null && styles.disabled
                  )}
                  onClick={() => onStartGame()}
                >
                  Restart game
                </Button>
              </Tooltip2>
            </div>

            <div className={css(styles.buttonGroup)}>
              <Tooltip2
                content={nextRoundDisabledReason}
                placement="top"
                disabled={nextRoundDisabledReason == null}
                hoverOpenDelay={HoverOpenDelay}
              >
                <Button
                  minimal
                  outlined
                  className={css(
                    nextRoundDisabledReason != null && styles.disabled
                  )}
                  onClick={() => onNextRound()}
                >
                  Next round
                </Button>
              </Tooltip2>
            </div>
          </div>
        }
        placement="top-start"
      >
        <div className={css(styles.buttonContainer)}>
          <Button
            className={css(styles.button)}
            icon="dashboard"
            onClick={() => setOpen(!open)}
            intent={open ? "primary" : "none"}
            outlined
          />
        </div>
      </Popover2>
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
        buttonContainer: {
          position: "relative",
        },
        disabled: {
          opacity: 0.65,
          cursor: "default",
          pointerEvents: "none",
        },
        content: {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          maxHeight: 400,
          maxWidth: 408,
          gap: 4,
          overflowY: "auto",
          overflowX: "hidden",
          padding: 24,
        },
        buttonGroup: {
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        },
      }),
    []
  );
};

export default AdminControls;
