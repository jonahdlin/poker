import { Button } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import { GameStore, PokerAction } from "features/room/utils/game";
import numeral from "numeral";
import React, { useMemo } from "react";
import { DefaultProps } from "utils/styles";

type PokerControlsProps = DefaultProps & {
  readonly gameStore: GameStore;
};

// For when the round is over but we still want to display some disabled controls
const DefaultActions: ReadonlyArray<PokerAction> = ["RAISE", "CALL", "FOLD"];

const PokerControls: React.FC<PokerControlsProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const {
    me,
    players,
    round,
    onStartGame,
    onBettingCall,
    onBettingFold,
    onBettingBet,
    onBettingRaise,
  } = gameStore;

  const enoughPlayers =
    players.filter(({ tablePosition }) => tablePosition != null).length >= 2;

  const renderActionButton = (action: PokerAction): React.ReactNode => {
    if (round == null) {
      const pokerActionToDisabledButtonTitle: {
        readonly [T in PokerAction]: string;
      } = {
        RAISE: "Raise",
        BET: "Bet",
        CHECK: "Check",
        CALL: "Call",
        FOLD: "Fold",
      };

      return (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton, styles.disabled)}
          intent={action === "FOLD" ? "warning" : undefined}
        >
          {pokerActionToDisabledButtonTitle[action]}
        </Button>
      );
    }

    const pokerActionToButton: {
      readonly [T in PokerAction]: React.ReactNode;
    } = {
      RAISE: (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton)}
          onClick={() => onBettingRaise(round.minimumRaise)}
        >
          Raise ({numeral(round.minimumRaise).format("0,0")})
        </Button>
      ),
      BET: (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton)}
          onClick={() => onBettingBet(round.minimumRaise)}
        >
          Bet ({numeral(round.minimumRaise).format("0,0")})
        </Button>
      ),
      CHECK: (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton)}
          onClick={() => onBettingBet(0)}
        >
          Check
        </Button>
      ),
      CALL: (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton)}
          onClick={() => onBettingCall()}
        >
          Call
        </Button>
      ),
      FOLD: (
        <Button
          key={action}
          outlined
          className={css(styles.actionButton)}
          intent="warning"
          onClick={() => onBettingFold()}
        >
          Fold
        </Button>
      ),
    };

    return pokerActionToButton[action];
  };

  if (me == null) {
    return null;
  }

  return (
    <div className={css(styles.root, style)}>
      {me.isLeader &&
        (gameStore.isGameStarted ? (
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
              Restart game
            </Button>
          </Tooltip2>
        ) : (
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
        ))}
      {gameStore.isGameStarted &&
        (me.availableActions || DefaultActions).map((action) =>
          renderActionButton(action)
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
