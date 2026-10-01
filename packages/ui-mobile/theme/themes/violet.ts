import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const violetLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#7C3AED",
    primaryForeground: "#FFFFFF",
    secondary: "#F5F3FF",
    secondaryForeground: "#5B21B6",
    accent: "#9333EA",
    accentForeground: "#FFFFFF",
    ring: "#8B5CF6",
  },
};

export const violetDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#8B5CF6",
    primaryForeground: "#FFFFFF",
    secondary: "#2E1065",
    secondaryForeground: "#DDD6FE",
    accent: "#A855F7",
    accentForeground: "#3B0764",
    ring: "#A78BFA",
  },
};
