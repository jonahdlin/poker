import { css, StyleSheet } from "aphrodite";
import PlayingCard from "features/room/components/cards/PlayingCard";
import { useMemo } from "react";
import { Card } from "schema/types";
import { DefaultProps } from "utils/styles";

type CommunityCardsProps = DefaultProps & {
  readonly flop?: readonly [Card, Card, Card];
  readonly turn?: Card;
  readonly river?: Card;
};

const CommunityCards: React.FC<CommunityCardsProps> = ({
  style,
  flop,
  turn,
  river,
}) => {
  const styles = useStyleSheet();

  return (
    <div className={css(styles.root, style)}>
      {flop != null &&
        flop.map((card) => (
          <PlayingCard key={`${card.suit}_${card.value}`} card={card} />
        ))}
      {turn != null && (
        <PlayingCard key={`${turn.suit}_${turn.value}`} card={turn} />
      )}
      {river != null && (
        <PlayingCard key={`${river.suit}_${river.value}`} card={river} />
      )}
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          gap: 8,
        },
      }),
    []
  );
};

export default CommunityCards;
