// @/components/ui/avatar.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/theme-context";
import LiquidBorder from "./liquid/liquid-border";

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number | "xs" | "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 80,
};

const COLOR_PALETTE = [
  "#1E3A8A",
  "#0F766E",
  "#B45309",
  "#4D7C0F",
  "#6D28D9",
  "#BE185D",
  "#0369A1",
  "#C2410C",
];

function getColorFromName(name: string): string {
  if (!name) return COLOR_PALETTE[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return COLOR_PALETTE[sum % COLOR_PALETTE.length];
}

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = "Utilisateur",
  size = "md",
  verified = false,
  style,
}) => {
  const { theme, isDark } = useTheme();
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 48;
  const initials = getInitials(name);
  const fallbackBgColor = getColorFromName(name);

  const badgeSize = Math.max(14, Math.floor(pixelSize * 0.28));
  const badgeOffset = Math.max(-2, Math.floor(pixelSize * 0.02));

  return (
    <View
      style={[
        styles.container,
        { width: pixelSize, height: pixelSize, borderRadius: pixelSize / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: pixelSize / 2 }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            {
              borderRadius: pixelSize / 2,
              backgroundColor: fallbackBgColor,
            },
          ]}
        >
          <Text
            style={[
              styles.fallbackText,
              {
                fontSize: Math.floor(pixelSize * 0.38),
                lineHeight: Math.floor(pixelSize * 0.48),
              },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* Subtle Glass Ring Border */}
      <LiquidBorder variant="subtle" borderRadius={pixelSize / 2} />

      {verified && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: badgeOffset,
              right: badgeOffset,
              backgroundColor: theme.colors.card,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={badgeSize}
            color={theme.colors.primary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallbackContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default Avatar;
