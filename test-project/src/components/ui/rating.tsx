// @/components/ui/rating.tsx

import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RatingSize = "sm" | "md" | "lg";
export type RatingVariant = "default" | "glass";

export interface RatingProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: RatingSize;
  variant?: RatingVariant;
  allowHalf?: boolean;
  emptyColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<RatingSize, number> = {
  sm: 20,
  md: 28,
  lg: 36,
};

const DEFAULT_FILL_COLOR = "#F59E0B";
const STAR_WIDTH_RATIO = 1.25;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getStarFillRatio = (value: number, index: number): number => {
  return clamp(value - (index - 1), 0, 1);
};

const roundToStep = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

// ─── Star Item ────────────────────────────────────────────────────────────────

interface StarItemProps {
  index: number;
  value: number;
  allowHalf: boolean;
  fillColor: string;
  emptyColor: string;
  fontSize: number;
  readonly: boolean;
  onPress: (value: number) => void;
}

const StarItem: React.FC<StarItemProps> = ({
  index,
  value,
  allowHalf,
  fillColor,
  emptyColor,
  fontSize,
  readonly,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const starWidth = fontSize * STAR_WIDTH_RATIO;
  const fillRatio = getStarFillRatio(value, index);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (readonly) return;

      const localX = clamp(event.nativeEvent.locationX, 0, starWidth);

      // Convert the touch position to a value between 0 and 1.
      const rawFraction = localX / starWidth;

      // Normal mode = full stars.
      // Half mode = 0.5 increments.
      const step = allowHalf ? 0.5 : 1;

      const fraction = clamp(roundToStep(rawFraction, step), 0, 1);

      let newValue = index - 1 + fraction;

      // A click on the extreme left of a star selects the previous
      // star's value when half ratings are enabled.
      if (allowHalf && fraction === 0) {
        newValue = index - 1;
      } else if (!allowHalf) {
        newValue = index;
      }

      scale.value = withSpring(
        1.35,
        { damping: 6, stiffness: 300 },
        () => {
          scale.value = withSpring(1, {
            damping: 10,
            stiffness: 200,
          });
        }
      );

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      onPress(newValue);
    },
    [readonly, allowHalf, index, starWidth, scale, onPress]
  );

  const content = (
    <Animated.View style={animatedStyle}>
      <View
        style={[
          styles.starContainer,
          {
            width: starWidth,
            height: fontSize * 1.2,
          },
        ]}
      >
        {/* Empty star */}
        <Text
          style={[
            styles.star,
            {
              fontSize,
              lineHeight: fontSize,
              color: emptyColor,
            },
          ]}
          allowFontScaling={false}
        >
          ☆
        </Text>

        {/* Dynamic filled portion */}
        {fillRatio > 0 && (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.fillContainer,
              {
                width: starWidth * fillRatio,
              },
            ]}
          >
            <Text
              style={[
                styles.star,
                {
                  width: starWidth,
                  fontSize,
                  lineHeight: fontSize,
                  color: fillColor,
                },
              ]}
              allowFontScaling={false}
            >
              ★
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  if (readonly) {
    return content;
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={`Rate ${index} star${
        index > 1 ? "s" : ""
      }`}
      hitSlop={4}
    >
      {content}
    </Pressable>
  );
};

// ─── Rating ───────────────────────────────────────────────────────────────────

export const Rating: React.FC<RatingProps> = ({
  value = 0,
  max = 5,
  onChange,
  readonly = false,
  size = "md",
  variant = "default",
  allowHalf = false,
  emptyColor,
  fillColor,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const fontSize = SIZE_MAP[size];

  const resolvedMax = Math.max(1, Math.floor(max));

  const resolvedValue = clamp(
    Number.isFinite(value) ? value : 0,
    0,
    resolvedMax
  );

  const resolvedFillColor = fillColor ?? DEFAULT_FILL_COLOR;

  const resolvedEmptyColor =
    emptyColor ?? theme.colors.mutedForeground ?? "#9CA3AF";

  const handlePress = useCallback(
    (newValue: number) => {
      const safeValue = clamp(newValue, 0, resolvedMax);
      onChange?.(safeValue);
    },
    [onChange, resolvedMax]
  );

  const stars = Array.from(
    { length: resolvedMax },
    (_, index) => index + 1
  );

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
      accessibilityLabel={
        accessibilityLabel ??
        `Rating: ${resolvedValue} out of ${resolvedMax}`
      }
      accessibilityRole="adjustable"
      accessibilityValue={{
        min: 0,
        max: resolvedMax,
        now: resolvedValue,
      }}
    >
      {stars.map((index) => (
        <StarItem
          key={index}
          index={index}
          value={resolvedValue}
          allowHalf={allowHalf}
          fillColor={resolvedFillColor}
          emptyColor={resolvedEmptyColor}
          fontSize={fontSize}
          readonly={readonly || !onChange}
          onPress={handlePress}
        />
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  starContainer: {
    position: "relative",
    overflow: "hidden",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  fillContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },

  star: {
    includeFontPadding: false,
    textAlign: "left",
    textAlignVertical: "center",
  },
});

export default Rating;

