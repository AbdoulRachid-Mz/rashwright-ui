import { lightTheme as baseLight, darkTheme as baseDark, Theme } from "../../constants/theme";

export const slateLight: Theme = {
  ...baseLight,
  colors: {
    ...baseLight.colors,
    primary: "#334155",
    primaryForeground: "#FFFFFF",
    secondary: "#F1F5F9",
    secondaryForeground: "#0F172A",
    accent: "#64748B",
    accentForeground: "#FFFFFF",
    ring: "#475569",
  },
};

export const slateDark: Theme = {
  ...baseDark,
  colors: {
    ...baseDark.colors,
    primary: "#94A3B8",
    primaryForeground: "#0F172A",
    secondary: "#1E293B",
    secondaryForeground: "#F8FAFC",
    accent: "#CBD5E1",
    accentForeground: "#0F172A",
    ring: "#E2E8F0",
  },
};
