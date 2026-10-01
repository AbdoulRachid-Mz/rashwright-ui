// @/components/ui/liquid/liquid-blob.tsx
//
// Primitive décorative Liquid Blob.
// Forme organique et douce avec animation fluide en boucle (translation & scale légers).
// Idéal pour les fonds, Hero, EmptyState, Login, Splash, etc.

import React, { memo, useEffect, useMemo } from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import type { LiquidBlobProps } from "./liquid-types";

const LiquidBlob = memo(
  ({
    size = 200,
    color = "primary",
    blur = 40,
    animated = true,
    opacity = 0.18,
    style,
  }: LiquidBlobProps) => {
    const { theme, liquidGlassEnabled } = useTheme();

    // ── Guard : si Liquid Glass désactivé, aucun blob décoratif ──
    if (!liquidGlassEnabled) return null;

    const resolvedColor = useMemo(() => {
      const tintMap: Record<string, string> = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        destructive: theme.colors.destructive,
        muted: theme.colors.muted,
      };
      return tintMap[color] || color;
    }, [color, theme.colors]);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
      if (!animated) return;

      translateX.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      translateY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming(12, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.94, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, [animated]);

    const animStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    const webFilterStyle: ViewStyle = useMemo(() => {
      if (Platform.OS !== "web") return {};
      return {
        // @ts-ignore
        filter: `blur(${blur}px)`,
        WebkitFilter: `blur(${blur}px)`,
      };
    }, [blur]);

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blob,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: resolvedColor,
            opacity,
          },
          webFilterStyle,
          animStyle,
          style,
        ]}
      />
    );
  }
);

LiquidBlob.displayName = "LiquidBlob";

export default LiquidBlob;

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
});
