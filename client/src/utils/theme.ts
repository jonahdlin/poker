import { Colors } from "@blueprintjs/core";

export type ThemeType = {
  readonly suitRed: string;
  readonly suitBlack: string;

  readonly danger: string;
  readonly dangerLight: string;

  readonly backgroundWhite: string;
  readonly backgroundLight: string;

  readonly fontColorLight: string;

  readonly intentPrimary: string;
  readonly intentSuccess: string;
  readonly intentWarning: string;
  readonly intentDanger: string;
  readonly appBackground: string;
  readonly darkAppBackground: string;
  readonly outline: string;
  readonly text: string;
  readonly textMuted: string;
  readonly textDisabled: string;
  readonly heading: string;
  readonly link: string;
  readonly darkText: string;
  readonly darkTextMuted: string;
  readonly darkTextDisabled: string;
  readonly darkHeading: string;
  readonly darkLink: string;
  readonly textSelection: string;
  readonly icon: string;
  readonly iconHover: string;
  readonly iconDisabled: string;
  readonly iconSelected: string;
  readonly darkIcon: string;
  readonly darkIconHover: string;
  readonly darkIconDisabled: string;
  readonly darkIconSelected: string;
  readonly dividerBlack: string;
  readonly darkDividerBlack: string;
  readonly darkDividerWhite: string;
};

export const Theme: ThemeType = {
  suitBlack: Colors.BLACK,
  suitRed: Colors.RED3,

  danger: Colors.RED2,
  dangerLight: Colors.RED3,

  backgroundWhite: Colors.WHITE,
  backgroundLight: Colors.LIGHT_GRAY4,

  fontColorLight: Colors.GRAY1,

  intentPrimary: Colors.BLUE3,
  intentSuccess: Colors.GREEN3,
  intentWarning: Colors.ORANGE3,
  intentDanger: Colors.RED3,

  appBackground: Colors.LIGHT_GRAY5,
  darkAppBackground: Colors.DARK_GRAY2,

  outline: `rgba(45, 114, 210, 0.6)`,

  text: Colors.DARK_GRAY1,
  textMuted: Colors.GRAY1,
  textDisabled: `rgba(95, 107, 124, 0.6)`,
  heading: Colors.DARK_GRAY1,
  link: Colors.BLUE2,
  darkText: Colors.LIGHT_GRAY5,
  darkTextMuted: Colors.GRAY4,
  darkTextDisabled: `rgba(171, 179, 191, 0.6)`,
  darkHeading: Colors.LIGHT_GRAY5,
  darkLink: Colors.BLUE5,
  // Default text selection color using #7dbcff
  textSelection: `rgba(125, 188, 255, 60%)`,

  icon: Colors.GRAY1,
  iconHover: Colors.DARK_GRAY1,
  iconDisabled: `rgba(95, 107, 124, 0.6)`,
  iconSelected: Colors.BLUE3,
  darkIcon: Colors.GRAY4,
  darkIconHover: Colors.LIGHT_GRAY5,
  darkIconDisabled: `rgba(171, 179, 191, 0.6)`,
  darkIconSelected: Colors.BLUE3,

  dividerBlack: `rgba(0, 0, 0, 0.15)`,
  darkDividerBlack: `rgba(0, 0, 0, 0.4)`,
  darkDividerWhite: `rgba(255, 255, 255, 0.2)`,
};
