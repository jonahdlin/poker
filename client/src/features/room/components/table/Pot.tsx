import { H4, Tag } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import numeral from "numeral";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type PotProps = DefaultProps & {
  readonly pot: number;
  readonly toBeAddedToPot?: number;
};

const Pot: React.FC<PotProps> = ({ style, pot, toBeAddedToPot }) => {
  const styles = useStyleSheet();

  return (
    <Tag
      className={css(styles.root, style)}
      large
      minimal
      round
      icon="lifesaver"
    >
      <H4 className={css(styles.text)}>
        {numeral(pot - (toBeAddedToPot ?? 0)).format("0,0")}
        {toBeAddedToPot == null || toBeAddedToPot === 0
          ? null
          : ` (+${numeral(toBeAddedToPot).format("0, 0")})`}
      </H4>
    </Tag>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: Theme.backgroundLight,
          padding: 16,
        },
        text: {
          margin: 0,
        },
      }),
    []
  );
};

export default Pot;
