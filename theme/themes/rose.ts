import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const roseLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#E11D48",
    primaryForeground: "#FFFFFF",
    secondary: "#FFF1F2",
    secondaryForeground: "#9F1239",
    accent: "#FB7185",
    accentForeground: "#FFFFFF",
    ring: "#F43F5E",
  },
};

export const roseDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#F43F5E",
    primaryForeground: "#FFFFFF",
    secondary: "#4C0519",
    secondaryForeground: "#FECDD3",
    accent: "#FB7185",
    accentForeground: "#4C0519",
    ring: "#FDA4AF",
  },
};
