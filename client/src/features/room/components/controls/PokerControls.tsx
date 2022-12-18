import { Button, Text } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import ChipCount from "features/room/components/common/ChipCount";
import WagerButton from "features/room/components/controls/WagerButton";
import { GameStore, PokerAction } from "features/room/utils/game";
import max from "lodash/max";
import React, { useMemo, useState } from "react";
import { Round } from "schema/types";
import { DefaultProps } from "utils/styles";

type PokerControlsProps = DefaultProps & {
  readonly gameStore: GameStore;
};

// For when the round is over but we still want to display some disabled controls
const DefaultActions: ReadonlyArray<PokerAction> = ["RAISE", "CALL", "FOLD"];

const getHighestBet = (bettingRound: Round["bettingRound"]): number => {
  return bettingRound === "SHOWING_SUMMARY"
    ? 0
    : max(Object.values(bettingRound.betsThisRound).map((n) => n ?? 0)) ?? 0;
};

const PokerControls: React.FC<PokerControlsProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();

  const [customRaise, setCustomRaise] = useState<number>();
  const [customBet, setCustomBet] = useState<number>();

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
    if (
      round == null ||
      round.bettingRound === "SHOWING_SUMMARY" ||
      me == null ||
      me.chips == null
    ) {
      const pokerActionToDisabledButtonTitle: {
        readonly [T in PokerAction]: string;
      } = {
        RAISE: "Raise",
        BET: "Bet",
        CHECK: "Check",
        CALL: "Call",
        FOLD: "Fold",
      };

      if (action === "RAISE") {
        return (
          <WagerButton
            key={action}
            disabled
            callAmount={0}
            wagerMinimum={0}
            maximum={0}
            onChange={() => {}}
            wager={0}
            onSubmit={() => {}}
          >
            {pokerActionToDisabledButtonTitle.RAISE}
          </WagerButton>
        );
      }

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

    const highestBet = getHighestBet(round.bettingRound);

    const callAmount = Math.min(
      highestBet - (round.bettingRound.betsThisRound[me.publicId] ?? 0),
      me.chips
    );

    const minimumRaiseTotalBet = Math.min(
      callAmount + round.minimumRaise,
      me.chips
    );

    const callTitle = (() => {
      if (callAmount === 0) {
        return "Call";
      }

      // all in
      if (callAmount === me.chips) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>All in</Text>
            <ChipCount count={callAmount} />
          </div>
        );
      }

      return (
        <div className={css(styles.textAndChips)}>
          <Text>Call</Text>
          <ChipCount count={callAmount} />
        </div>
      );
    })();

    const raiseDisabledNotEnoughChips = minimumRaiseTotalBet < callAmount;

    const raiseTitle = (() => {
      if (raiseDisabledNotEnoughChips) {
        return "Raise";
      }

      // all in
      if (minimumRaiseTotalBet === me.chips) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>All in</Text>
            <ChipCount count={callAmount} />
          </div>
        );
      }
      if (customRaise != null && customRaise + callAmount === me.chips) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>All in</Text>
            <ChipCount count={customRaise + callAmount} />
          </div>
        );
      }

      if (customRaise != null) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>Raise</Text>
            <ChipCount count={customRaise + callAmount} />
          </div>
        );
      }

      return (
        <div className={css(styles.textAndChips)}>
          <Text>Raise</Text>
          <ChipCount count={minimumRaiseTotalBet} />
        </div>
      );
    })();

    const betTitle = (() => {
      if (raiseDisabledNotEnoughChips) {
        return "Bet";
      }

      // all in
      if (minimumRaiseTotalBet === me.chips) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>Bet</Text>
            <ChipCount count={callAmount} />
          </div>
        );
      }
      if (customBet != null && customBet + callAmount === me.chips) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>All in</Text>
            <ChipCount count={customBet + callAmount} />
          </div>
        );
      }

      if (customBet != null) {
        return (
          <div className={css(styles.textAndChips)}>
            <Text>Bet</Text>
            <ChipCount count={customBet + callAmount} />
          </div>
        );
      }

      return (
        <div className={css(styles.textAndChips)}>
          <Text>Bet</Text>
          <ChipCount count={minimumRaiseTotalBet} />
        </div>
      );
    })();

    const pokerActionToButton: {
      readonly [T in PokerAction]: React.ReactNode;
    } = {
      RAISE: (
        <WagerButton
          key={action}
          disabled={raiseDisabledNotEnoughChips}
          callAmount={callAmount}
          wagerMinimum={round.minimumRaise}
          maximum={me.chips}
          onChange={(raise) => setCustomRaise(raise)}
          wager={customRaise || minimumRaiseTotalBet - callAmount}
          onSubmit={() => {
            onBettingRaise(customRaise ?? minimumRaiseTotalBet - callAmount);
            setCustomRaise(undefined);
          }}
        >
          {raiseTitle}
        </WagerButton>
      ),
      BET: (
        <WagerButton
          key={action}
          disabled={raiseDisabledNotEnoughChips}
          callAmount={0}
          wagerMinimum={round.minimumRaise}
          maximum={me.chips}
          onChange={(bet) => setCustomBet(bet)}
          wager={customBet || minimumRaiseTotalBet}
          onSubmit={() => {
            onBettingBet(customBet ?? minimumRaiseTotalBet);
            setCustomBet(undefined);
          }}
        >
          {betTitle}
        </WagerButton>
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
          className={css(
            styles.actionButton,
            callAmount === 0 && styles.disabled
          )}
          onClick={callAmount === 0 ? undefined : () => onBettingCall()}
        >
          {callTitle}
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
        buttonGroup: {
          display: "flex",
          alignItems: "stretch",
        },
        leftButtonInGroup: {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        rightButtonInGroup: {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderLeft: 0,
        },
        moreButton: {
          height: 100,
          padding: 8,
        },
        textAndChips: {
          display: "flex",
          alignItems: "center",
          gap: 6,
        },
      }),
    []
  );
};

export default PokerControls;
