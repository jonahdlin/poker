import { css, StyleSheet } from "aphrodite";
import { useMemo } from "react";
import { Suit as SuitType } from "schema/types";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type SuitProps = DefaultProps & {
  readonly suit: SuitType;
  readonly size?: number;
};

const SuitToSymbol: { readonly [T in SuitType]: string } = {
  CLUB: "♣",
  DIAMOND: "♦",
  HEART: "♥",
  SPADE: "♠",
};

export const SuitToColour: { readonly [T in SuitType]: string } = {
  CLUB: Theme.suitBlack,
  DIAMOND: Theme.suitRed,
  HEART: Theme.suitRed,
  SPADE: Theme.suitBlack,
};

const Suit: React.FC<SuitProps> = ({ style, suit, size = 42 }) => {
  const styles = useStyleSheet({ size, suit });

  return <div className={css(styles.root, style)}>{SuitToSymbol[suit]}</div>;
};

const useStyleSheet = ({
  size,
  suit,
}: {
  readonly size: number;
  readonly suit: SuitType;
}) => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          lineHeight: `${size}px`,
          width: size,
          height: size,
          fontSize: size,
          fontFamily: "'Noto Sans JP', sans-serif",
          color: SuitToColour[suit],
          overflow: "hidden",
        },
      }),
    [size, suit]
  );
};

export default Suit;
