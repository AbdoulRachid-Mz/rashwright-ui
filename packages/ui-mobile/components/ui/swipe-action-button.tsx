// @/components/ui/swipe-action-button.tsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  View,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export interface SwipeActionButtonProps {
  /** Libellé invitant au glissement (ex: "Glisser pour payer") */
  title: string;
  /** Libellé affiché après validation (ex: "Confirmé !") */
  completedTitle?: string;
  /** Callback déclenché lors du franchissement réussi du seuil */
  onActionComplete: () => void;
  /** Icône du curseur glissant (défaut : "chevron-forward") */
  thumbIcon?: keyof typeof Ionicons.glyphMap;
  /** Couleur principale du bouton et du curseur */
  color?: string;
  /** Hauteur du composant (défaut : 56) */
  height?: number;
  /** Seuil de validation (0.5 à 1.0, défaut : 0.85) */
  thresholdRatio?: number;
  /** Variante visuelle */
  variant?: "default" | "glass";
  /** Désactive l'interaction */
  disabled?: boolean;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
  /** Libellé d'accessibilité */
  accessibilityLabel?: string;
}

export const SwipeActionButton: React.FC<SwipeActionButtonProps> = ({
  title,
  completedTitle = "Confirmé !",
  onActionComplete,
  thumbIcon = "chevron-forward",
  color,
  height = 56,
  thresholdRatio = 0.85,
  variant = "default",
  disabled = false,
  style,
  className,
  accessibilityLabel,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const thumbSize = height - 8;
  const maxSlideDistance = Math.max(0, trackWidth - thumbSize - 8);

  const slideX = useRef(new Animated.Value(0)).current;
  const currentSlide = useRef(0);

  React.useEffect(() => {
    const id = slideX.addListener(({ value }) => {
      currentSlide.current = value;
    });
    return () => slideX.removeListener(id);
  }, [slideX]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const triggerSuccess = useCallback(() => {
    setIsCompleted(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onActionComplete();

    // Réinitialisation après 2 secondes
    setTimeout(() => {
      Animated.spring(slideX, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => {
        setIsCompleted(false);
      });
    }, 2000);
  }, [onActionComplete, slideX]);

  const snapReset = useCallback(() => {
    Animated.spring(slideX, {
      toValue: 0,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  }, [slideX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled && !isCompleted,
      onMoveShouldSetPanResponder: (_e, gesture) =>
        !disabled && !isCompleted && Math.abs(gesture.dx) > 4,

      onPanResponderMove: (_e, gesture) => {
        const nextX = Math.max(0, Math.min(gesture.dx, maxSlideDistance));
        slideX.setValue(nextX);
      },

      onPanResponderRelease: (_e, gesture) => {
        const threshold = maxSlideDistance * thresholdRatio;
        if (gesture.dx >= threshold) {
          Animated.timing(slideX, {
            toValue: maxSlideDistance,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            triggerSuccess();
          });
        } else {
          snapReset();
        }
      },

      onPanResponderTerminate: () => {
        snapReset();
      },
    })
  ).current;

  const glass = useMemo(() => createGlassTheme(theme, isDark), [theme, isDark]);

  const activeColor = color ?? theme.colors.primary;

  const textOpacity = slideX.interpolate({
    inputRange: [0, Math.max(1, maxSlideDistance * 0.6)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const trackBg =
    variant === "glass" && liquidGlassEnabled
      ? glass.materials.soft.background
      : isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(0,0,0,0.06)";

  return (
    <View
      onLayout={handleLayout}
      className={className}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint="Glissez le curseur vers la droite pour valider l'action"
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackBg,
          borderRadius: height / 2,
          borderColor: theme.colors.border,
          borderWidth: 1,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {variant === "glass" && liquidGlassEnabled && (
        <LiquidHighlight type="top" borderRadius={height / 2} opacity={0.4} />
      )}
      {variant === "glass" && (
        <LiquidBorder variant="subtle" borderRadius={height / 2} />
      )}

      {/* Libellé centré */}
      <Animated.View style={[styles.textWrapper, { opacity: textOpacity }]}>
        <Text
          style={[
            styles.titleText,
            { color: isCompleted ? activeColor : theme.colors.foreground },
          ]}
        >
          {isCompleted ? completedTitle : title}
        </Text>
      </Animated.View>

      {/* Curseur glissant (Thumb) */}
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: activeColor,
            transform: [{ translateX: slideX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons
          name={isCompleted ? "checkmark" : thumbIcon}
          size={thumbSize * 0.45}
          color="#FFFFFF"
        />
      </Animated.View>
    </View>
  );
};

export default SwipeActionButton;

const styles = StyleSheet.create({
  track: {
    width: "100%",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  textWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 56,
  },
  titleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  thumb: {
    position: "absolute",
    left: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
});
