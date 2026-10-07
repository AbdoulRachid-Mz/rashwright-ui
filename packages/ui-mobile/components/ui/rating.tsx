// @/components/ui/rating.tsx
import React, { useCallback, useRef } from "react";
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

// ─── Star Item ────────────────────────────────────────────────────────────────

interface StarItemProps {
  index: number; // 1-based
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (readonly) return;

      let newValue: number;
      if (allowHalf) {
        const x = e.nativeEvent.locationX;
        const starWidth = fontSize * 1.2;
        newValue = x < starWidth / 2 ? index - 0.5 : index;
      } else {
        newValue = index;
      }

      scale.value = withSpring(1.35, { damping: 6, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 200 });
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(newValue);
    },
    [readonly, allowHalf, index, fontSize, scale, onPress]
  );

  const isFull = value >= index;
  const isHalf = !isFull && allowHalf && value >= index - 0.5;

  const starChar = isFull ? "★" : "☆";
  const starColor = isFull || isHalf ? fillColor : emptyColor;

  const content = (
    <Animated.View style={animatedStyle}>
      <View style={{ position: "relative" }}>
        {/* Background empty star */}
        <Text
          style={[styles.star, { fontSize, color: emptyColor }]}
          allowFontScaling={false}
        >
          ☆
        </Text>
        {/* Overlay filled portion */}
        {(isFull || isHalf) && (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                overflow: "hidden",
                width: isFull ? undefined : "50%",
              },
            ]}
          >
            <Text
              style={[styles.star, { fontSize, color: fillColor }]}
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
    return <View>{content}</View>;
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={`Rate ${index} star${index > 1 ? "s" : ""}`}
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

  const resolvedFillColor = fillColor ?? DEFAULT_FILL_COLOR;
  const resolvedEmptyColor =
    emptyColor ?? theme.colors.mutedForeground ?? "#9CA3AF";

  const handlePress = useCallback(
    (newValue: number) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={
        accessibilityLabel ?? `Rating: ${value} out of ${max}`
      }
      accessibilityRole="adjustable"
    >
      {stars.map((index) => (
        <StarItem
          key={index}
          index={index}
          value={value}
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
  star: {
    lineHeight: undefined,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

export default Rating;
