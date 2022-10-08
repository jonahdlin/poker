import { StyleDeclarationValue } from "aphrodite";
import React from "react";

export type DefaultProps = {
  readonly style?: StyleDeclarationValue;
  readonly children?: React.ReactNode;
};
