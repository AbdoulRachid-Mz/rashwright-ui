import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const redLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#DC2626",
    primaryForeground: "#FFFFFF",
    secondary: "#FEF2F2",
    secondaryForeground: "#991B1B",
    accent: "#B91C1C",
    accentForeground: "#FFFFFF",
    ring: "#EF4444",
  },
};

export const redDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#EF4444",
    primaryForeground: "#450A0A",
    secondary: "#7F1D1D",
    secondaryForeground: "#FECACA",
    accent: "#DC2626",
    accentForeground: "#FFFFFF",
    ring: "#F87171",
  },
};
