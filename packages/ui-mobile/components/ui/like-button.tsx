// @/components/ui/like-button.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export type LikeButtonVariant = "default" | "filled" | "outline" | "glass" | "subtle";
export type LikeButtonSize = "sm" | "md" | "lg";

export interface LikeButtonProps {
  /** État liké contrôlé */
  liked?: boolean;
  /** État initial non contrôlé */
  defaultLiked?: boolean;
  /** Nombre de likes affiché */
  count?: number;
  /** Affiche ou masque le compteur */
  showCount?: boolean;
  /** Variante visuelle */
  variant?: LikeButtonVariant;
  /** Taille du bouton */
  size?: LikeButtonSize;
  /** Couleur active du like (par défaut rouge/rose vif) */
  activeColor?: string;
  /** Couleur inactive de l'icône */
  inactiveColor?: string;
  /** Nom personnalisé de l'icône de base (Ionicons) */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Nom personnalisé de l'icône active (Ionicons) */
  activeIconName?: keyof typeof Ionicons.glyphMap;
  /** Désactive l'interaction */
  disabled?: boolean;
  /** État de chargement asynchrone */
  loading?: boolean;
  /** Callback unifié déclenché lors du changement d'état */
  onValueChange?: (liked: boolean) => void;
  /** Callback appelé uniquement lors de l'action de like */
  onLike?: () => void;
  /** Callback appelé uniquement lors de l'action de unlike */
  onUnlike?: () => void;
  /** Style personnalisé */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
  /** Libellé d'accessibilité */
  accessibilityLabel?: string;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  liked: controlledLiked,
  defaultLiked = false,
  count,
  showCount = false,
  variant = "default",
  size = "md",
  activeColor = "#EF4444",
  inactiveColor,
  iconName = "heart-outline",
  activeIconName = "heart",
  disabled = false,
  loading = false,
  onValueChange,
  onLike,
  onUnlike,
  style,
  className,
  accessibilityLabel,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();

  const isControlled = controlledLiked !== undefined;
  const [internalLiked, setInternalLiked] = useState<boolean>(defaultLiked);
  const isLiked = isControlled ? controlledLiked : internalLiked;

  // Animation values
  const scale = useSharedValue(1);
  const particleScale = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  const glass = useMemo(
    () => createGlassTheme(theme, isDark),
    [theme, isDark]
  );

  const triggerAnimation = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.35, { damping: 4, stiffness: 350 }),
      withSpring(0.9, { damping: 6, stiffness: 250 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    particleScale.value = 0.4;
    particleOpacity.value = 1;

    particleScale.value = withTiming(1.6, { duration: 350 });
    particleOpacity.value = withTiming(0, { duration: 350 });
  }, [scale, particleScale, particleOpacity]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    const nextState = !isLiked;

    if (!isControlled) {
      setInternalLiked(nextState);
    }

    if (nextState) {
      triggerAnimation();
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      onLike?.();
    } else {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      onUnlike?.();
    }

    onValueChange?.(nextState);
  }, [disabled, loading, isLiked, isControlled, triggerAnimation, onLike, onUnlike, onValueChange]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedParticleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: particleScale.value }],
    opacity: particleOpacity.value,
  }));

  const sizeMetrics = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          iconSize: 16,
          fontSize: theme.typography.xs,
          paddingHorizontal: showCount ? 8 : 6,
          paddingVertical: 4,
          minHeight: 28,
          borderRadius: theme.borderRadius.sm,
          particleSize: 28,
        };
      case "lg":
        return {
          iconSize: 26,
          fontSize: theme.typography.base,
          paddingHorizontal: showCount ? 16 : 12,
          paddingVertical: 10,
          minHeight: 48,
          borderRadius: theme.borderRadius.lg,
          particleSize: 44,
        };
      case "md":
      default:
        return {
          iconSize: 20,
          fontSize: theme.typography.sm,
          paddingHorizontal: showCount ? 12 : 8,
          paddingVertical: 6,
          minHeight: 36,
          borderRadius: theme.borderRadius.md,
          particleSize: 34,
        };
    }
  }, [size, showCount, theme]);

  const currentInactiveColor = inactiveColor ?? theme.colors.mutedForeground;

  const visualStyle = useMemo(() => {
    switch (variant) {
      case "filled":
        return {
          backgroundColor: isLiked ? "rgba(239, 68, 68, 0.12)" : theme.colors.secondary,
          borderColor: isLiked ? activeColor : "transparent",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: isLiked ? activeColor : theme.colors.border,
        };
      case "glass":
        return {
          backgroundColor: liquidGlassEnabled
            ? isLiked
              ? "rgba(239, 68, 68, 0.14)"
              : glass.materials.soft.background
            : theme.colors.card,
          borderColor: liquidGlassEnabled
            ? isLiked
              ? activeColor
              : glass.border.subtle
            : theme.colors.border,
        };
      case "subtle":
        return {
          backgroundColor: isLiked ? "rgba(239, 68, 68, 0.08)" : "transparent",
          borderColor: "transparent",
        };
      case "default":
      default:
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
        };
    }
  }, [variant, isLiked, activeColor, theme, isDark, liquidGlassEnabled, glass]);

  const formatCount = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  };

  const a11yLabel = accessibilityLabel ?? (
    isLiked
      ? `Retirer le like${count !== undefined ? `, ${count} likes` : ""}`
      : `J'aime${count !== undefined ? `, ${count} likes` : ""}`
  );

  return (
    <LiquidPressable
      disabled={disabled || loading}
      onPress={handlePress}
      className={className}
      accessibilityRole="button"
      accessibilityState={{ selected: isLiked, disabled: disabled || loading }}
      accessibilityLabel={a11yLabel}
      style={[
        styles.container,
        {
          backgroundColor: visualStyle.backgroundColor,
          borderColor: visualStyle.borderColor,
          borderWidth: variant === "outline" || (variant === "filled" && isLiked) || variant === "glass" ? 1 : 0,
          borderRadius: sizeMetrics.borderRadius,
          paddingHorizontal: sizeMetrics.paddingHorizontal,
          paddingVertical: sizeMetrics.paddingVertical,
          minHeight: sizeMetrics.minHeight,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {variant === "glass" && liquidGlassEnabled && (
        <LiquidHighlight type="top" borderRadius={sizeMetrics.borderRadius} opacity={0.5} />
      )}
      {(variant === "glass" || variant === "outline") && (
        <LiquidBorder variant="subtle" borderRadius={sizeMetrics.borderRadius} />
      )}

      {/* Halo de particules animé lors de l'activation */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.particleHalo,
          {
            width: sizeMetrics.particleSize,
            height: sizeMetrics.particleSize,
            borderRadius: sizeMetrics.particleSize / 2,
            borderColor: activeColor,
          },
          animatedParticleStyle,
        ]}
      />

      {loading ? (
        <ActivityIndicator size="small" color={isLiked ? activeColor : currentInactiveColor} />
      ) : (
        <View style={styles.contentRow}>
          <Animated.View style={animatedIconStyle}>
            <Ionicons
              name={isLiked ? activeIconName : iconName}
              size={sizeMetrics.iconSize}
              color={isLiked ? activeColor : currentInactiveColor}
            />
          </Animated.View>

          {showCount && count !== undefined && (
            <Text
              style={[
                styles.countText,
                {
                  fontSize: sizeMetrics.fontSize,
                  color: isLiked ? activeColor : theme.colors.foreground,
                },
              ]}
            >
              {formatCount(count)}
            </Text>
          )}
        </View>
      )}
    </LiquidPressable>
  );
};

export default LikeButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    alignSelf: "flex-start",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  countText: {
    fontWeight: "600",
  },
  particleHalo: {
    position: "absolute",
    borderWidth: 2,
  },
});
