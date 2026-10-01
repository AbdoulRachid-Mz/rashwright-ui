// @/components/ui/liquid/liquid-pressable.tsx
//
// Pressable interactif avec feedback physique Rubber / Viscous.
// Animation Reanimated :
// - pressIn : scale 0.965 (damping/stiffness configurables selon la viscosité)
// - pressOut : micro overshoot 1.012 -> stabilisation à 1
//
// Supporte toutes les PressableProps + haptics optionnel + option material pour surface directe.

import React, { forwardRef, useMemo } from "react";
import {
  Pressable,
  GestureResponderEvent,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../../contexts/theme-context";
import { createGlassTheme } from "../../../constants/glass-theme";
import LiquidSurface from "./liquid-surface";
import type { LiquidPressableProps } from "./liquid-types";
import { SPRING_PRESETS, VISCOSITY_MAP } from "./liquid-types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const LiquidPressable = forwardRef<any, LiquidPressableProps>(
  (
    {
      children,
      material,
      viscosity = "medium",
      haptic = false,
      disabled = false,
      style,
      onPressIn,
      onPressOut,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const scale = useSharedValue(1);

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark]
    );

    const springConfig = useMemo(() => {
      const presetNames = VISCOSITY_MAP[viscosity] || VISCOSITY_MAP.medium;
      return {
        pressIn: SPRING_PRESETS[presetNames.pressIn],
        pressOut: SPRING_PRESETS[presetNames.pressOut],
      };
    }, [viscosity]);

    const handlePressIn = (e: GestureResponderEvent) => {
      if (!disabled) {
        scale.value = withSpring(glass.interaction.pressedScale, springConfig.pressIn);
        if (haptic) {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            // Ignorer si haptics non disponible sur la plateforme
          }
        }
      }
      onPressIn?.(e);
    };

    const handlePressOut = (e: GestureResponderEvent) => {
      if (!disabled) {
        scale.value = withSequence(
          withSpring(glass.interaction.overshootScale, springConfig.pressOut),
          withSpring(1, SPRING_PRESETS.gentle)
        );
      }
      onPressOut?.(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: disabled ? glass.interaction.disabledOpacity : 1,
    }));

    const content = (
      <AnimatedPressable
        ref={ref}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.base, animatedStyle, style]}
        {...props}
      >
        {typeof children === "function"
          ? (state: any) => children(state)
          : children}
      </AnimatedPressable>
    );

    if (material) {
      return (
        <LiquidSurface material={material} style={styles.surfaceWrapper}>
          {content}
        </LiquidSurface>
      );
    }

    return content;
  }
);

LiquidPressable.displayName = "LiquidPressable";

export default LiquidPressable;

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as any) : {}),
  },
  surfaceWrapper: {
    alignSelf: "flex-start",
  },
});
