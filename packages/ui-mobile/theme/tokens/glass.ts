export const glassTokens = {
  light: {
    background: "rgba(255, 255, 255, 0.65)",
    border: "rgba(255, 255, 255, 0.4)",
    blurIntensity: 40,
    elevation: 2,
    gradient: ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.3)"] as const,
  },
  dark: {
    background: "rgba(15, 23, 42, 0.65)",
    border: "rgba(255, 255, 255, 0.12)",
    blurIntensity: 50,
    elevation: 3,
    gradient: ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)"] as const,
  },
};
