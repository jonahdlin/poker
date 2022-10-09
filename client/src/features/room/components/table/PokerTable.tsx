import { Colors, H4, Tag } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import numeral from "numeral";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type PokerTableProps = DefaultProps & {
  readonly pot?: number;
  readonly toBeAddedToPot?: number;
};

const PokerTable: React.FC<PokerTableProps> = ({
  style,
  pot,
  toBeAddedToPot,
}) => {
  const styles = useStyleSheet();

  return (
    <div className={css(styles.root, style)}>
      {pot != null && (
        <Tag
          className={css(styles.potTag)}
          large
          minimal
          round
          icon="lifesaver"
        >
          <H4 className={css(styles.potText)}>
            {numeral(pot - (toBeAddedToPot ?? 0)).format("0,0")}
            {toBeAddedToPot == null || toBeAddedToPot === 0
              ? null
              : ` (+${numeral(toBeAddedToPot).format("0, 0")})`}
          </H4>
        </Tag>
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
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          backgroundImage: "url(/assets/table-background.png)",
          backgroundRepeat: "repeat",
          border: `10px solid ${Colors.GREEN3}`,
          boxShadow: "0px 0px 4px 0px rgb(0 0 0 / 40%)",
        },
        potTag: {
          backgroundColor: Theme.backgroundLight,
          padding: 16,
        },
        potText: {
          margin: 0,
        },
      }),
    []
  );
};

export default PokerTable;
