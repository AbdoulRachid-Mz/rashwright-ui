import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const emeraldLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#059669",
    primaryForeground: "#FFFFFF",
    secondary: "#ECFDF5",
    secondaryForeground: "#065F46",
    accent: "#0D9488",
    accentForeground: "#FFFFFF",
    ring: "#10B981",
  },
};

export const emeraldDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#10B981",
    primaryForeground: "#FFFFFF",
    secondary: "#064E3B",
    secondaryForeground: "#A7F3D0",
    accent: "#14B8A6",
    accentForeground: "#042F2E",
    ring: "#34D399",
  },
};
