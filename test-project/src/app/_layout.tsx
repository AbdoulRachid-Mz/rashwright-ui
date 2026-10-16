import "../global.css";
import { Slot } from "expo-router";
import React from "react";
import { ThemeProvider } from "@/contexts/theme-context";

export default function RootLayout() {
  return (
    <ThemeProvider initialMode="dark" initialPreset="amber">
      <Slot />
    </ThemeProvider>
  );
}
