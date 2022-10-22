import { Colors, Text } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import Suit, { SuitToColour } from "features/room/components/cards/Suit";
import { useMemo } from "react";
import { Card } from "schema/types";
import { DefaultProps } from "utils/styles";

type PlayingCardProps = DefaultProps & {
  // null indicates back of card is shown
  readonly card: Card | null;

  readonly numberSize?: number;
  readonly suitSize?: number;
};

const PlayingCard: React.FC<PlayingCardProps> = ({
  style,
  card,
  numberSize = 48,
  suitSize,
}) => {
  const styles = useStyleSheet({ card, numberSize });

  return (
    <div className={css(styles.root, style)}>
      {card != null && (
        <>
          <div className={css(styles.valueContainer)}>
            <Text className={css(styles.value)}>{card.value}</Text>
          </div>
          <div className={css(styles.suitContainer)}>
            <Suit suit={card.suit} size={suitSize} />
          </div>
        </>
      )}
    </div>
  );
};

export const PlayingCardAspectRatio = 24 / 17;
const DefaultWidth = 90;

const useStyleSheet = ({
  card,
  numberSize,
}: {
  readonly card: Card | null;
  readonly numberSize: number;
}) => {
  const suit = card?.suit;
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          minHeight: DefaultWidth * PlayingCardAspectRatio,
          maxHeight: DefaultWidth * PlayingCardAspectRatio,
          minWidth: DefaultWidth,
          maxWidth: DefaultWidth,
          // backgroundColor: "white",
          backgroundImage:
            card == null
              ? "url(/assets/card-back-background.png)"
              : "url(/assets/card-background.jpg)",
          backgroundRepeat: "repeat",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow:
            "0 0 0 1px rgb(17 20 24 / 10%), 0 1px 1px rgb(17 20 24 / 20%)",
          padding: 12,
          userSelect: "none",
          border: `1px solid ${Colors.GRAY4}`,
        },
        valueContainer: {
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
        },
        value: {
          fontFamily: "'Alkalami', sans-serif",
          fontSize: numberSize,
          lineHeight: 1.3,
          height: numberSize,
          color: SuitToColour[suit ?? "SPADE"],
        },
        suitContainer: {
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
        },
      }),
    [suit, card, numberSize]
  );
};

export default PlayingCard;
