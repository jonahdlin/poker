import { Icon, Text } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import React, { useMemo } from "react";
import { formatNumber } from "utils/number";
import { DefaultProps } from "utils/styles";

type ChipCountProps = DefaultProps & {
  readonly count: number;
};

const ChipCount: React.FC<ChipCountProps> = ({ style, count }) => {
  const styles = useStyleSheet();

  return (
    <div className={css(styles.root, style)}>
      <Icon icon="lifesaver" size={12} />
      <Text>{formatNumber(count)}</Text>
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
          gap: 2,
        },
      }),
    []
  );
};

export default ChipCount;
