import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const amberLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#D97706",
    primaryForeground: "#FFFFFF",
    secondary: "#FFFBEB",
    secondaryForeground: "#92400E",
    accent: "#F59E0B",
    accentForeground: "#1F2937",
    ring: "#FBBF24",
  },
};

export const amberDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#F59E0B",
    primaryForeground: "#1F2937",
    secondary: "#451A03",
    secondaryForeground: "#FDE68A",
    accent: "#FBBF24",
    accentForeground: "#1F2937",
    ring: "#FCD34D",
  },
};
