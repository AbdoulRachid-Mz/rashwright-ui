import { lightTheme, darkTheme, Theme, ThemeMode } from "../../constants/theme";
import { emeraldLight, emeraldDark } from "./emerald";
import { violetLight, violetDark } from "./violet";
import { amberLight, amberDark } from "./amber";
import { roseLight, roseDark } from "./rose";
import { slateLight, slateDark } from "./slate";
import { greenLight, greenDark } from "./green";
import { redLight, redDark } from "./red";
import { cyanLight, cyanDark } from "./cyan";

export { lightTheme, darkTheme };
export type { Theme, ThemeMode };

export type ThemePresetName =
  | "default"
  | "emerald"
  | "violet"
  | "amber"
  | "rose"
  | "slate"
  | "green"
  | "red"
  | "cyan"
  | "custom";

export interface ThemePreset {
  name: ThemePresetName;
  label: string;
  light: Theme;
  dark: Theme;
}

export const THEME_PRESETS: Record<ThemePresetName, ThemePreset> = {
  default: {
    name: "default",
    label: "Rashwright Blue (Default)",
    light: lightTheme,
    dark: darkTheme,
  },
  emerald: {
    name: "emerald",
    label: "Emerald Mint",
    light: emeraldLight,
    dark: emeraldDark,
  },
  violet: {
    name: "violet",
    label: "Violet Tech",
    light: violetLight,
    dark: violetDark,
  },
  amber: {
    name: "amber",
    label: "Amber Luxury",
    light: amberLight,
    dark: amberDark,
  },
  rose: {
    name: "rose",
    label: "Rose Vibrant",
    light: roseLight,
    dark: roseDark,
  },
  slate: {
    name: "slate",
    label: "Slate Monochrome",
    light: slateLight,
    dark: slateDark,
  },
  green: {
    name: "green",
    label: "Forest Green",
    light: greenLight,
    dark: greenDark,
  },
  red: {
    name: "red",
    label: "Crimson Red",
    light: redLight,
    dark: redDark,
  },
  cyan: {
    name: "cyan",
    label: "Cyber Cyan",
    light: cyanLight,
    dark: cyanDark,
  },
  custom: {
    name: "custom",
    label: "Custom Theme",
    light: lightTheme,
    dark: darkTheme,
  },
};

export const DEFAULT_THEME_NAME: ThemePresetName = "default";
