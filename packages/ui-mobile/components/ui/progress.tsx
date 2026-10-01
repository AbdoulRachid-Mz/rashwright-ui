// @/components/ui/progress.tsx
//
// Barre de progression Liquid Glass avec remplissage fluide animé via Reanimated.

import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/theme-context";
import { createGlassTheme } from "../../constants/glass-theme";
import ThemedText from "./text";
import LiquidHighlight from "./liquid/liquid-highlight";

export type ProgressVariant = "default" | "success" | "warning" | "destructive";

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  height?: number;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = "default",
  height = 8,
  showLabel = false,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withSpring(percentage, {
      damping: 22,
      stiffness: 180,
    });
  }, [percentage]);

  const fillColor = useMemo(() => {
    switch (variant) {
      case "success":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "destructive":
        return theme.colors.destructive;
      case "default":
      default:
        return theme.colors.primary;
    }
  }, [variant, theme.colors]);

  const fillAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  return (
    <View style={[styles.wrapper, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <ThemedText variant="xs" weight="medium" color="mutedForeground">
            Progression
          </ThemedText>
          <ThemedText variant="xs" weight="bold">
            {Math.round(percentage)}%
          </ThemedText>
        </View>
      )}

      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.06)",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: fillColor,
            },
            fillAnimatedStyle,
          ]}
        >
          <LiquidHighlight type="top" borderRadius={height / 2} opacity={0.6} />
        </Animated.View>
      </View>
    </View>
  );
};

export default Progress;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
});
