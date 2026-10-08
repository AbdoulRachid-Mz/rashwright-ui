import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const cyanLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#0891B2",
    primaryForeground: "#FFFFFF",
    secondary: "#ECFEFF",
    secondaryForeground: "#155E75",
    accent: "#06B6D4",
    accentForeground: "#FFFFFF",
    ring: "#22D3EE",
  },
};

export const cyanDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#06B6D4",
    primaryForeground: "#083344",
    secondary: "#164E63",
    secondaryForeground: "#CFFAFE",
    accent: "#00D9FF",
    accentForeground: "#083344",
    ring: "#67E8F9",
  },
};
