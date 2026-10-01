// @/components/ui/icon.tsx
//
// Wrapper d'icône unifié et léger.
// Résout automatiquement les couleurs depuis le thème.
// Compatible Ionicons (défaut), Feather, MaterialCommunityIcons, etc.

import React from "react";
import { StyleProp, TextStyle } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/theme-context";

export type IconLibrary = "ionicons" | "feather" | "material";
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface IconProps {
  name: string;
  size?: IconSize;
  color?: string;
  library?: IconLibrary;
  style?: StyleProp<TextStyle>;
}

const SIZE_MAP: Record<Exclude<IconSize, number>, number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "foreground",
  library = "ionicons",
  style,
}) => {
  const { theme } = useTheme();

  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 22;

  const resolvedColor =
    (theme.colors as Record<string, string>)[color] ||
    (theme.propertyColors as Record<string, string>)[color] ||
    color;

  switch (library) {
    case "feather":
      return (
        <Feather
          name={name as any}
          size={pixelSize}
          color={resolvedColor}
          style={style}
        />
      );
    case "material":
      return (
        <MaterialCommunityIcons
          name={name as any}
          size={pixelSize}
          color={resolvedColor}
          style={style}
        />
      );
    case "ionicons":
    default:
      return (
        <Ionicons
          name={name as any}
          size={pixelSize}
          color={resolvedColor}
          style={style}
        />
      );
  }
};

export default Icon;
