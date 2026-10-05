// @/components/ui/slider.tsx
//
// Slider interactif Liquid Glass avec curseur Rubber / Gel et track translucide.

import React, { useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  label?: string;
  valueFormatter?: (value: number) => string;
  style?: StyleProp<ViewStyle>;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled = false,
  label,
  valueFormatter,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const [trackWidth, setTrackWidth] = useState(0);
  const [internalValue, setInternalValue] = useState(
    value ?? defaultValue ?? min
  );

  const currentValue = value !== undefined ? value : internalValue;
  const thumbScale = useSharedValue(1);

  const trackRef = useRef<React.ElementRef<typeof View>>(null);

  const clampValue = (val: number) => {
    let clamped = Math.min(max, Math.max(min, val));
    if (step > 0) {
      clamped = Math.round((clamped - min) / step) * step + min;
    }
    return clamped;
  };

  const updateValueFromPosition = (pageX: number, trackPageX: number) => {
    if (trackWidth <= 0 || disabled) return;
    const relX = Math.max(0, Math.min(trackWidth, pageX - trackPageX));
    const ratio = relX / trackWidth;
    const rawVal = min + ratio * (max - min);
    const finalVal = clampValue(rawVal);

    if (onValueChange) {
      onValueChange(finalVal);
    } else {
      setInternalValue(finalVal);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
          thumbScale.value = withSpring(1.2, { damping: 12, stiffness: 300 });
          trackRef.current?.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
            updateValueFromPosition(evt.nativeEvent.pageX, pageX);
          });
        },
        onPanResponderMove: (evt) => {
          trackRef.current?.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
            updateValueFromPosition(evt.nativeEvent.pageX, pageX);
          });
        },
        onPanResponderRelease: () => {
          thumbScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        },
      }),
    [disabled, trackWidth, min, max, step]
  );

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const ratio = max > min ? (currentValue - min) / (max - min) : 0;
  const thumbPosition = ratio * trackWidth;

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const formattedValue = valueFormatter
    ? valueFormatter(currentValue)
    : `${Math.round(currentValue)}`;

  return (
    <View style={[styles.wrapper, disabled && { opacity: 0.5 }, style]}>
      {(label || valueFormatter) && (
        <View style={styles.labelRow}>
          {label && (
            <ThemedText variant="sm" weight="medium">
              {label}
            </ThemedText>
          )}
          <ThemedText variant="sm" weight="semibold" color="primary">
            {formattedValue}
          </ThemedText>
        </View>
      )}

      <View
        ref={trackRef}
        style={styles.trackContainer}
        onLayout={onLayout}
        {...panResponder.panHandlers}
      >
        {/* Background Track */}
        <View
          style={[
            styles.track,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
            },
          ]}
        />

        {/* Active Fill Track */}
        <View
          style={[
            styles.activeTrack,
            {
              width: thumbPosition,
              backgroundColor: theme.colors.primary,
            },
          ]}
        >
          <LiquidHighlight type="top" borderRadius={3} opacity={0.6} />
        </View>

        {/* Gel / Rubber Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: Math.max(0, thumbPosition - 12),
              backgroundColor: theme.colors.card,
              shadowColor: isDark ? "#000" : "rgba(15, 23, 42, 0.2)",
            },
            thumbAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.thumbInnerDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <LiquidBorder variant="regular" borderRadius={12} />
        </Animated.View>
      </View>
    </View>
  );
};

export default Slider;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackContainer: {
    height: 36,
    justifyContent: "center",
    position: "relative",
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: "100%",
  },
  activeTrack: {
    height: 6,
    borderRadius: 3,
    position: "absolute",
    left: 0,
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 4,
  },
  thumbInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
