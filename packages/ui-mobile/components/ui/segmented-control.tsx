// @/components/ui/segmented-control.tsx
//
// Contrôle segmenté avec capsule Liquid Glass glissante physique via Reanimated.
// Idéal pour Vente/Location, Jour/Semaine/Mois, Liste/Carte, etc.

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";
import LiquidHighlight from "./liquid/liquid-highlight";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  style,
}: SegmentedControlProps<T>) {
  const { theme, isDark } = useTheme();

  const [internalValue, setInternalValue] = useState<T>(
    value ?? defaultValue ?? options[0]?.value
  );

  const selectedValue = value !== undefined ? value : internalValue;

  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = options.findIndex((opt) => opt.value === selectedValue);

  const itemWidth = options.length > 0 ? (containerWidth - 8) / options.length : 0;
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (itemWidth > 0 && activeIndex >= 0) {
      translateX.value = withSpring(activeIndex * itemWidth, {
        damping: 20,
        stiffness: 260,
        mass: 0.7,
      });
    }
  }, [activeIndex, itemWidth]);

  const handleSelect = (val: T) => {
    if (disabled) return;
    if (onValueChange) {
      onValueChange(val);
    } else {
      setInternalValue(val);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: itemWidth > 0 ? itemWidth : 0,
  }));

  return (
    <LiquidSurface
      material="soft"
      borderRadius={theme.borderRadius.full}
      style={[styles.container, style]}
      onLayout={onLayout}
    >
      {/* Sliding Glass Capsule Indicator */}
      {containerWidth > 0 && itemWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.18)"
                : "rgba(255, 255, 255, 0.95)",
              borderRadius: theme.borderRadius.full,
              shadowColor: isDark ? "#000" : "rgba(15, 23, 42, 0.10)",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 6,
              elevation: 3,
            },
            animatedIndicatorStyle,
          ]}
        >
          <LiquidHighlight
            type="top"
            borderRadius={theme.borderRadius.full}
            opacity={0.6}
          />
        </Animated.View>
      )}

      {/* Segment Items */}
      <View style={styles.segmentsRow}>
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <LiquidPressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              disabled={disabled}
              viscosity="soft"
              style={styles.segmentBtn}
            >
              {option.icon && (
                <View style={styles.iconContainer}>{option.icon}</View>
              )}
              <ThemedText
                variant="sm"
                weight={isSelected ? "semibold" : "medium"}
                color={isSelected ? "foreground" : "mutedForeground"}
                style={styles.label}
              >
                {option.label}
              </ThemedText>
            </LiquidPressable>
          );
        })}
      </View>
    </LiquidSurface>
  );
}

export default SegmentedControl;

const styles = StyleSheet.create({
  container: {
    padding: 4,
    position: "relative",
    alignSelf: "stretch",
  },
  segmentsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
    zIndex: 1,
  },
  indicator: {
    position: "absolute",
    top: 4,
    left: 4,
    bottom: 4,
    zIndex: 0,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    textAlign: "center",
  },
});
