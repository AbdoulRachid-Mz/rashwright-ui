// @/components/ui/stat-card.tsx
//
// Carte de statistique / métrique avec Liquid Glass, indicateur de tendance et icône optionnelle.
// Idéal pour Immo360 (biens publiés, vues, favoris), dashboards et administration.

import React, { ReactNode } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidPressable from "./liquid/liquid-pressable";
import type { LiquidMaterial } from "./liquid/liquid-types";

export type StatTrend = "up" | "down" | "neutral";

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: StatTrend;
  icon?: ReactNode;
  material?: LiquidMaterial;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  material = "regular",
  onPress,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const trendConfig = {
    up: {
      color: "#10B981",
      icon: "trending-up" as const,
      bg: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.10)",
    },
    down: {
      color: theme.colors.destructive,
      icon: "trending-down" as const,
      bg: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.10)",
    },
    neutral: {
      color: theme.colors.mutedForeground,
      icon: "remove" as const,
      bg: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
    },
  }[trend];

  const cardContent = (
    <LiquidSurface
      material={material}
      borderRadius={theme.borderRadius.lg}
      style={[styles.container, style]}
    >
      <View style={styles.header}>
        <ThemedText variant="sm" color="mutedForeground" numberOfLines={1}>
          {label}
        </ThemedText>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <View style={styles.body}>
        <ThemedText variant="3xl" weight="bold" color="foreground">
          {value}
        </ThemedText>

        {change && (
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trendConfig.bg },
            ]}
          >
            <Ionicons
              name={trendConfig.icon}
              size={14}
              color={trendConfig.color}
            />
            <ThemedText
              variant="xs"
              weight="semibold"
              style={{ color: trendConfig.color }}
            >
              {change}
            </ThemedText>
          </View>
        )}
      </View>
    </LiquidSurface>
  );

  if (onPress) {
    return (
      <LiquidPressable
        onPress={onPress}
        viscosity="medium"
        style={styles.pressable}
      >
        {cardContent}
      </LiquidPressable>
    );
  }

  return cardContent;
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  pressable: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    gap: 8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
});
