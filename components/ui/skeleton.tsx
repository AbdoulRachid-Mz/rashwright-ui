// @/components/ui/skeleton.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/theme-context";
import LiquidSurface from "./liquid/liquid-surface";

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  animated = true,
}: SkeletonProps) => {
  const { isDark } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    if (!animated) return;
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 750 }),
        withTiming(0.35, { duration: 750 })
      ),
      -1,
      true
    );
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated ? opacity.value : 0.35,
  }));

  const backgroundColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor,
          overflow: "hidden",
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Skeleton circulaire (avatar)
export const SkeletonCircle = ({
  size = 40,
  ...props
}: Omit<SkeletonProps, "width" | "height" | "borderRadius"> & { size?: number }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} {...props} />;
};

// Skeleton en ligne (pour les textes)
export const SkeletonText = ({
  lines = 1,
  width = "100%",
  spacing = 8,
  lastLineWidth = "60%",
}: {
  lines?: number;
  width?: number | string;
  spacing?: number;
  lastLineWidth?: number | string;
}) => {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={16}
          borderRadius={4}
        />
      ))}
    </View>
  );
};

// Skeleton Card
export const SkeletonCard = ({
  height = 100,
  children,
}: {
  height?: number;
  children?: React.ReactNode;
}) => {
  return (
    <LiquidSurface
      material="soft"
      style={[styles.card, { minHeight: height }]}
    >
      {children || (
        <>
          <Skeleton width="60%" height={20} style={{ marginBottom: 12 }} />
          <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </>
      )}
    </LiquidSurface>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});