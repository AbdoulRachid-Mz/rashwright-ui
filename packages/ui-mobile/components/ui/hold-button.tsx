// @/components/ui/hold-button.tsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  View,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export type HoldButtonVariant = "destructive" | "default" | "glass";

export interface HoldButtonProps {
  /** Libellé principal */
  title: string;
  /** Libellé affiché pendant le maintien */
  holdingTitle?: string;
  /** Libellé affiché une fois l'action déclenchée */
  completedTitle?: string;
  /** Durée d'appui en millisecondes pour valider l'action (défaut : 1500) */
  holdDuration?: number;
  /** Callback déclenché uniquement quand l'appui complet est atteint */
  onHoldComplete: () => void;
  /** Variante visuelle */
  variant?: HoldButtonVariant;
  /** Icône optionnelle */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Désactive l'interaction */
  disabled?: boolean;
  /** Style personnalisé */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
  /** Libellé d'accessibilité personnalisé */
  accessibilityLabel?: string;
}

export const HoldButton: React.FC<HoldButtonProps> = ({
  title,
  holdingTitle,
  completedTitle = "Validé !",
  holdDuration = 1500,
  onHoldComplete,
  variant = "destructive",
  icon,
  disabled = false,
  style,
  className,
  accessibilityLabel,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const progress = useSharedValue(0);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerComplete = useCallback(() => {
    setIsCompleted(true);
    setIsHolding(false);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onHoldComplete();

    setTimeout(() => {
      setIsCompleted(false);
      progress.value = 0;
    }, 1500);
  }, [onHoldComplete, progress]);

  const handlePressIn = useCallback(() => {
    if (disabled || isCompleted) return;

    setIsHolding(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    progress.value = withTiming(
      1,
      {
        duration: holdDuration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(triggerComplete)();
        }
      }
    );
  }, [disabled, isCompleted, holdDuration, progress, triggerComplete]);

  const handlePressOut = useCallback(() => {
    if (isCompleted) return;

    setIsHolding(false);
    progress.value = withTiming(0, { duration: 200 });
  }, [isCompleted, progress]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const glass = useMemo(() => createGlassTheme(theme, isDark), [theme, isDark]);

  const colors = useMemo(() => {
    switch (variant) {
      case "destructive":
        return {
          backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.1)",
          progressColor: theme.colors.destructive,
          borderColor: theme.colors.destructive,
          textColor: theme.colors.destructive,
          activeTextColor: "#FFFFFF",
        };
      case "glass":
        return {
          backgroundColor: liquidGlassEnabled
            ? glass.materials.soft.background
            : theme.colors.card,
          progressColor: theme.colors.primary,
          borderColor: liquidGlassEnabled ? glass.border.subtle : theme.colors.border,
          textColor: theme.colors.foreground,
          activeTextColor: "#FFFFFF",
        };
      case "default":
      default:
        return {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          progressColor: theme.colors.primary,
          borderColor: theme.colors.border,
          textColor: theme.colors.foreground,
          activeTextColor: "#FFFFFF",
        };
    }
  }, [variant, theme, isDark, liquidGlassEnabled, glass]);

  const currentLabel = isCompleted
    ? completedTitle
    : isHolding
    ? holdingTitle ?? title
    : title;

  return (
    <Pressable
      disabled={disabled || isCompleted}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={className}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isCompleted }}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={`Maintenez appuyé pendant ${(holdDuration / 1000).toFixed(1)} seconde pour confirmer`}
      style={[
        styles.buttonContainer,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          borderRadius: theme.borderRadius.md,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {/* Barre de progression arrière-plan */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.progressColor,
            borderRadius: theme.borderRadius.md - 1,
          },
          progressAnimatedStyle,
        ]}
      />

      {variant === "glass" && liquidGlassEnabled && (
        <LiquidHighlight type="top" borderRadius={theme.borderRadius.md} opacity={0.4} />
      )}
      {(variant === "glass" || variant === "destructive") && (
        <LiquidBorder variant="subtle" borderRadius={theme.borderRadius.md} />
      )}

      {/* Contenu textuel */}
      <View style={styles.contentRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isHolding || isCompleted ? colors.activeTextColor : colors.textColor}
          />
        )}
        <Text
          style={[
            styles.titleText,
            {
              color: isHolding || isCompleted ? colors.activeTextColor : colors.textColor,
            },
          ]}
        >
          {currentLabel}
        </Text>
      </View>
    </Pressable>
  );
};

export default HoldButton;

const styles = StyleSheet.create({
  buttonContainer: {
    height: 48,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
  },
  progressBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 2,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
