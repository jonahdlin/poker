import { css, StyleSheet } from "aphrodite";
import PlayingCard, {
  PlayingCardAspectRatio,
} from "features/room/components/cards/PlayingCard";
import { useMemo } from "react";
import { Card } from "schema/types";
import { DefaultProps } from "utils/styles";

type HandProps = DefaultProps & {
  // null card => hidden
  readonly card1: Card | null;
  readonly card2: Card | null;

  readonly cardWidth?: number;
};

const Hand: React.FC<HandProps> = ({ style, card1, card2, cardWidth = 90 }) => {
  const styles = useStyleSheet({ cardWidth });

  return (
    <div className={css(styles.root, style)}>
      <PlayingCard
        style={[styles.card, styles.card1]}
        card={card1}
        numberSize={cardWidth / 2.5}
        suitSize={cardWidth / 2.5 - 6}
      />
      <PlayingCard
        style={[styles.card, styles.card2]}
        card={card2}
        numberSize={cardWidth / 2.5}
        suitSize={cardWidth / 2.5 - 6}
      />
    </div>
  );
};

const useStyleSheet = ({ cardWidth }: { readonly cardWidth: number }) => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "flex",
          flexDirection: "row",
        },
        card: {
          minHeight: cardWidth,
          maxHeight: cardWidth,
          minWidth: cardWidth / PlayingCardAspectRatio,
          maxWidth: cardWidth / PlayingCardAspectRatio,
        },
        card1: {
          transform: "rotate(-4deg) translateX(8px)",
          transformOrigin: "bottom right",
        },
        card2: {
          transform: "rotate(4deg) translateX(-8px)",
          transformOrigin: "bottom left",
        },
      }),
    [cardWidth]
  );
};

export default Hand;
