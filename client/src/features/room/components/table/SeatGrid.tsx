import { Button, Card, Tag, H6, H4 } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import ChooseSeatForm from "features/room/components/table/ChooseSeatForm";
import Hand from "features/room/components/cards/Hand";
import { AllSeats, GameStore } from "features/room/utils/game";
import numeral from "numeral";
import { CSSProperties, useMemo, useState } from "react";
import { TablePosition } from "schema/types";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";
import { formatNumber } from "utils/number";

type SeatGridProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const TablePositionToDisplay: { readonly [T in TablePosition]: string } = {
  ONE: "1",
  TWO: "2",
  THREE: "3",
  FOUR: "4",
  FIVE: "5",
  SIX: "6",
  SEVEN: "7",
  EIGHT: "8",
  NINE: "9",
};

const TablePositionToGridPosition: {
  readonly [T in TablePosition]: Pick<
    CSSProperties,
    "alignSelf" | "gridRow" | "gridColumn" | "justifySelf"
  >;
} = {
  ONE: {
    gridRow: "1",
    gridColumn: "2",
    alignSelf: "flex-start",
    justifySelf: "center",
  },
  TWO: {
    gridRow: "1",
    gridColumn: "6",
    alignSelf: "flex-start",
    justifySelf: "center",
  },
  THREE: {
    gridRow: "2",
    gridColumn: "7",
    alignSelf: "center",
    justifySelf: "flex-end",
  },
  FOUR: {
    gridRow: "3",
    gridColumn: "7",
    alignSelf: "center",
    justifySelf: "flex-end",
  },
  FIVE: {
    gridRow: "4",
    gridColumn: "6",
    alignSelf: "flex-end",
    justifySelf: "center",
  },
  SIX: {
    gridRow: "4",
    gridColumn: "4",
    alignSelf: "flex-end",
    justifySelf: "center",
  },
  SEVEN: {
    gridRow: "4",
    gridColumn: "2",
    alignSelf: "flex-end",
    justifySelf: "center",
  },
  EIGHT: {
    gridRow: "3",
    gridColumn: "1",
    alignSelf: "center",
    justifySelf: "flex-start",
  },
  NINE: {
    gridRow: "2",
    gridColumn: "1",
    alignSelf: "center",
    justifySelf: "flex-start",
  },
};

const CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT = 53;
const CHIPS_THIS_ROUND_MARGIN = 8;

const TablePositionToChipBetPosition: {
  readonly [T in TablePosition]: Pick<
    CSSProperties,
    "top" | "bottom" | "left" | "right"
  >;
} = {
  ONE: {
    bottom: -CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT - CHIPS_THIS_ROUND_MARGIN,
    right: -50,
  },
  TWO: {
    bottom: -CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT - CHIPS_THIS_ROUND_MARGIN,
    left: -50,
  },
  THREE: {
    top: `calc(50% - ${CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT / 2}px)`,
    left: -163 - CHIPS_THIS_ROUND_MARGIN,
  },
  FOUR: {
    top: `calc(50% - ${CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT / 2}px)`,
    left: -163 - CHIPS_THIS_ROUND_MARGIN,
  },
  FIVE: {
    top: -CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT - CHIPS_THIS_ROUND_MARGIN,
    left: -50,
  },
  SIX: {
    top: -CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT - CHIPS_THIS_ROUND_MARGIN,
    left: 70,
  },
  SEVEN: {
    top: -CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT - CHIPS_THIS_ROUND_MARGIN,
    right: -50,
  },
  EIGHT: {
    top: `calc(50% - ${CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT / 2}px)`,
    right: -163 - CHIPS_THIS_ROUND_MARGIN,
  },
  NINE: {
    top: `calc(50% - ${CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT / 2}px)`,
    right: -163 - CHIPS_THIS_ROUND_MARGIN,
  },
};

type HandPosition = "LEFT" | "RIGHT";
const TablePositionToHandPosition: {
  readonly [T in TablePosition]: HandPosition;
} = {
  ONE: "RIGHT",
  TWO: "RIGHT",
  THREE: "LEFT",
  FOUR: "LEFT",
  FIVE: "RIGHT",
  SIX: "RIGHT",
  SEVEN: "RIGHT",
  EIGHT: "RIGHT",
  NINE: "RIGHT",
};

const SeatGrid: React.FC<SeatGridProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();
  const [chooseSeatPopoverTarget, setChooseSeatPopoverTarget] =
    useState<TablePosition>();

  const {
    players,
    me,
    round,
    onSit,
    minNameLength,
    maxNameLength,
    minInitialChipCount,
    maxInitialChipCount,
    isGameStarted,
  } = gameStore;

  if (me == null) {
    return null;
  }

  return (
    <div className={css(styles.root, style)}>
      {AllSeats.map((seat) => {
        const sittingPlayer = players.find(
          ({ tablePosition }) => tablePosition === seat
        );

        if (sittingPlayer == null) {
          if (isGameStarted) {
            return null;
          }

          return (
            <div key={seat} style={TablePositionToGridPosition[seat]}>
              <Popover2
                content={
                  <ChooseSeatForm
                    style={styles.chooseSeatForm}
                    minNameLength={minNameLength}
                    maxNameLength={maxNameLength}
                    minChipCount={minInitialChipCount}
                    maxChipCount={maxInitialChipCount}
                    guestName={me.guestName}
                    currentName={me.name}
                    onSubmit={({ name, chipCount }) => {
                      onSit({
                        position: seat,
                        chipCount,
                        name,
                      });

                      setChooseSeatPopoverTarget(undefined);
                    }}
                  />
                }
                placement="top"
                isOpen={chooseSeatPopoverTarget === seat}
                onClose={() => setChooseSeatPopoverTarget(undefined)}
                disabled={chooseSeatPopoverTarget !== seat}
              >
                <Button
                  className={css(styles.seat)}
                  onClick={() => {
                    if (
                      me?.tablePosition != null ||
                      (chooseSeatPopoverTarget != null &&
                        chooseSeatPopoverTarget !== seat)
                    ) {
                      return;
                    }

                    setChooseSeatPopoverTarget(seat);
                  }}
                  icon="log-in"
                >
                  Take seat {TablePositionToDisplay[seat]}
                </Button>
              </Popover2>
            </div>
          );
        }

        const isMe = me != null && sittingPlayer.publicId === me?.publicId;

        const chips = sittingPlayer.chips ?? 0;
        const chipsBetThisBettingRound =
          round == null || round.bettingRound === "SHOWING_SUMMARY"
            ? undefined
            : round.bettingRound.betsThisRound[sittingPlayer.publicId];

        return (
          <Card
            key={seat}
            className={css(styles.seat, styles.filledSeat)}
            style={{
              ...TablePositionToGridPosition[seat],
              alignItems:
                TablePositionToHandPosition[seat] === "LEFT"
                  ? "flex-end"
                  : "flex-start",
              ...(round?.currentTurnPlayerId === sittingPlayer.publicId
                ? {
                    outline: `2px solid ${Theme.outline}`,
                  }
                : {}),
            }}
            elevation={
              round?.currentTurnPlayerId === sittingPlayer.publicId
                ? 4
                : undefined
            }
          >
            {round != null && (
              <Hand
                style={[
                  styles.hand,
                  TablePositionToHandPosition[seat] === "LEFT"
                    ? styles.leftHand
                    : styles.rightHand,
                ]}
                card1={isMe ? me.hand?.card1 ?? null : null}
                card2={isMe ? me.hand?.card2 ?? null : null}
                cardWidth={95}
              />
            )}
            {chipsBetThisBettingRound != null && (
              <div
                className={css(styles.chipTagContainer)}
                style={TablePositionToChipBetPosition[seat]}
              >
                <Tooltip2
                  disabled={chipsBetThisBettingRound < 10000}
                  content={formatNumber(chipsBetThisBettingRound)}
                  placement="top"
                >
                  <Tag className={css(styles.chipTag)} large minimal round>
                    <H4 className={css(styles.chipText)}>
                      {chipsBetThisBettingRound < 10000
                        ? formatNumber(chipsBetThisBettingRound)
                        : numeral(chipsBetThisBettingRound).format("0,0a")}
                    </H4>
                  </Tag>
                </Tooltip2>
              </div>
            )}
            <div
              className={css(styles.innerSeatContent)}
              style={{
                alignItems:
                  TablePositionToHandPosition[seat] === "LEFT"
                    ? "flex-end"
                    : "flex-start",
                textAlign:
                  TablePositionToHandPosition[seat] === "LEFT"
                    ? "right"
                    : "left",
              }}
            >
              <Tooltip2
                disabled={chips < 100000}
                content={formatNumber(chips)}
                placement="top"
              >
                <Tag icon="bank-account" minimal round large>
                  {chips < 100000
                    ? formatNumber(chips)
                    : numeral(chips).format("0,0.00a")}
                </Tag>
              </Tooltip2>
              <div className={css(styles.playerNameInSeatWrapper)}>
                <H6 className={css(styles.playerNameInSeat)}>
                  {sittingPlayer.name ?? sittingPlayer.guestName}
                </H6>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 104px 1fr 104px 1fr 1fr",
          gridTemplateRows: "1fr 1fr 1fr 1fr",
          gap: "12px 0px",
          flexDirection: "column",
          justifyContent: "center",
        },
        filledSeat: {
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: 0,
        },
        playerNameInSeatWrapper: {
          display: "flex",
          flex: 1,
          alignItems: "center",
        },
        playerNameInSeat: {
          // "-webkit-box" is valid
          // @ts-ignore
          display: "-webkit-box",
          overflow: "hidden",
          textOverflow: "ellipsis",
          "-webkit-line-clamp": "2",
          "-webkit-box-orient": "vertical",
        },
        seat: {
          position: "relative",
          width: 150,
          height: 90,
        },
        chooseSeatForm: {
          padding: 24,
          backgroundColor: Theme.backgroundWhite,
        },
        innerSeatContent: {
          display: "flex",
          flexDirection: "column",
          width: 100,
          margin: 11,
          flex: 1,
          gap: 2,
        },
        hand: {
          position: "absolute",
          top: -5,
        },
        leftHand: {
          left: -100,
        },
        rightHand: {
          right: -100,
        },
        chipTagContainer: {
          position: "absolute",
        },
        chipTag: {
          backgroundColor: Theme.backgroundLight,
          height: CHIPS_THIS_BETTING_ROUND_TAG_HEIGHT,
        },
        chipText: {
          margin: 0,
        },
      }),
    []
  );
};

export default SeatGrid;
