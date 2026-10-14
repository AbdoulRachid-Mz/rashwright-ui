import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const greenLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#16A34A",
    primaryForeground: "#FFFFFF",
    secondary: "#F0FDF4",
    secondaryForeground: "#15803D",
    accent: "#15803D",
    accentForeground: "#FFFFFF",
    ring: "#22C55E",
  },
};

export const greenDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#22C55E",
    primaryForeground: "#052E16",
    secondary: "#14532D",
    secondaryForeground: "#BBF7D0",
    accent: "#16A34A",
    accentForeground: "#FFFFFF",
    ring: "#4ADE80",
  },
};
