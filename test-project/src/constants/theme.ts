// @/constants/theme.ts

export const lightTheme = {
  colors: {
    // Base
    background: "#F8FAFC",
    foreground: "#0F172A",

    // Brand
    primary: "#1E3A8A",
    primaryForeground: "#FFFFFF",

    secondary: "#EFF6FF",
    secondaryForeground: "#1E3A8A",

    accent: "#D4A017",
    accentForeground: "#FFFFFF",

    muted: "#F1F5F9",
    mutedForeground: "#64748B",

    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",

    border: "#E2E8F0",
    input: "#CBD5E1",

    ring: "#2563EB",

    card: "#FFFFFF",
    cardForeground: "#0F172A",

    overlay: "rgba(15,23,42,0.55)",
  },

  propertyColors: {
    sale: "#2563EB",
    rent: "#16A34A",
    reserved: "#F59E0B",
    sold: "#DC2626",

    verified: "#059669",

    agency: "#7C3AED",
    owner: "#1D4ED8",

    premium: "#D4A017",

    location: "#0284C7",

    favorite: "#EC4899",

    chat: "#06B6D4",

    installment: "#EA580C",

    map: "#0EA5E9",

    newProperty: "#10B981",

    featured: "#FBBF24",

    land: "#A16207",

    house: "#2563EB",

    apartment: "#4F46E5",

    office: "#475569",

    commercial: "#9333EA",

    farm: "#65A30D",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    "2xl": 24,
    full: 9999,
  },

  typography: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },

  shadows: {
    sm: "0 1px 3px rgba(15,23,42,0.08)",
    md: "0 6px 12px rgba(15,23,42,0.10)",
    lg: "0 12px 24px rgba(15,23,42,0.14)",
    xl: "0 24px 48px rgba(15,23,42,0.16)",
  },
};

export const darkTheme = {
  colors: {
    background: "#020617",
    foreground: "#F8FAFC",

    primary: "#3B82F6",
    primaryForeground: "#FFFFFF",

    secondary: "#111827",
    secondaryForeground: "#F8FAFC",

    accent: "#EAB308",
    accentForeground: "#111827",

    muted: "#1E293B",
    mutedForeground: "#94A3B8",

    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    border: "#334155",
    input: "#334155",

    ring: "#60A5FA",

    card: "#0F172A",
    cardForeground: "#F8FAFC",

    overlay: "rgba(2,6,23,0.75)",
  },

  propertyColors: {
    sale: "#60A5FA",
    rent: "#4ADE80",
    reserved: "#FBBF24",
    sold: "#F87171",

    verified: "#34D399",

    agency: "#A78BFA",
    owner: "#60A5FA",

    premium: "#FACC15",

    location: "#38BDF8",

    favorite: "#F472B6",

    chat: "#22D3EE",

    installment: "#FB923C",

    map: "#38BDF8",

    newProperty: "#34D399",

    featured: "#FBBF24",

    land: "#CA8A04",

    house: "#60A5FA",

    apartment: "#818CF8",

    office: "#94A3B8",

    commercial: "#C084FC",

    farm: "#A3E635",
  },

  spacing: { ...lightTheme.spacing },

  borderRadius: { ...lightTheme.borderRadius },

  typography: { ...lightTheme.typography },

  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.35)",
    md: "0 6px 12px rgba(0,0,0,0.40)",
    lg: "0 12px 24px rgba(0,0,0,0.45)",
    xl: "0 24px 48px rgba(0,0,0,0.55)",
  },
};

export type Theme = typeof lightTheme;

export type ThemeMode = "light" | "dark" | "system";