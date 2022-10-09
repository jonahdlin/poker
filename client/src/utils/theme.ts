import { Colors } from "@blueprintjs/core";

export type ThemeType = {
  readonly suitRed: string;
  readonly suitBlack: string;

  readonly danger: string;
  readonly dangerLight: string;

  readonly backgroundWhite: string;
  readonly backgroundLight: string;

  readonly fontColorLight: string;
};

export const Theme: ThemeType = {
  suitBlack: Colors.BLACK,
  suitRed: Colors.RED3,

  danger: Colors.RED2,
  dangerLight: Colors.RED3,

  backgroundWhite: Colors.WHITE,
  backgroundLight: Colors.LIGHT_GRAY4,

  fontColorLight: Colors.GRAY1,
};
