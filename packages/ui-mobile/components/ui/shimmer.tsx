// @/components/ui/shimmer.tsx
//
// Wrapper Shimmer indépendant qui applique un balayage lumineux animé
// au-dessus de n'importe quel composant (Card, Avatar, List item, etc.).

import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/theme-context";

export interface ShimmerProps {
  children: React.ReactNode;
  active?: boolean;
  duration?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  active = true,
  duration = 1500,
  borderRadius = 0,
  style,
}) => {
  const { isDark } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    progress.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );
  }, [active, duration]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-200, 400]);
    return {
      transform: [{ translateX }],
    };
  });

  const highlightColors = isDark
    ? (["transparent", "rgba(255, 255, 255, 0.15)", "transparent"] as const)
    : (["transparent", "rgba(255, 255, 255, 0.45)", "transparent"] as const);

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {children}
      {active && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius, overflow: "hidden" }]}>
          <Animated.View style={[styles.shimmerWave, animatedStyle]}>
            <LinearGradient
              colors={highlightColors as any}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradient}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
};

export default Shimmer;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  shimmerWave: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 200,
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
});
