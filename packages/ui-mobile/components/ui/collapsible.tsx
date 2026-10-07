// @/components/ui/collapsible.tsx
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidPressable from "./liquid/liquid-pressable";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "bordered" | "glass";
  style?: StyleProp<ViewStyle>;
  onToggle?: (open: boolean) => void;
}

// ─── Collapsible ─────────────────────────────────────────────────────────────

export const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  children,
  defaultOpen = false,
  icon,
  variant = "default",
  style,
  onToggle,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();

  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const contentHeight = useRef<number>(0);
  const animatedHeight = useSharedValue(defaultOpen ? -1 : 0);
  const chevronRotation = useSharedValue(defaultOpen ? 1 : 0);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const measured = e.nativeEvent.layout.height;
      if (measured > 0 && contentHeight.current !== measured) {
        contentHeight.current = measured;
        if (isOpen) {
          animatedHeight.value = measured;
        }
      }
    },
    [isOpen, animatedHeight],
  );

  const handlePress = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(next);

    if (next) {
      animatedHeight.value = withTiming(contentHeight.current, {
        duration: 250,
      });
      chevronRotation.value = withTiming(1, { duration: 250 });
    } else {
      animatedHeight.value = withTiming(0, { duration: 250 });
      chevronRotation.value = withTiming(0, { duration: 250 });
    }
  }, [isOpen, animatedHeight, chevronRotation, onToggle]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value < 0 ? undefined : animatedHeight.value,
    overflow: "hidden",
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const useGlass = variant === "glass" && liquidGlassEnabled;
  const glassTheme = useGlass
    ? createGlassTheme(theme, isDark)
    : null;

  const containerStyle: ViewStyle = {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    ...(variant === "bordered"
      ? { borderWidth: 1, borderColor: theme.colors.border }
      : {}),
    ...(useGlass && glassTheme
      ? {
          backgroundColor: glassTheme.materials.soft.background,
          borderWidth: 1,
          borderColor: glassTheme.border.subtle,
        }
      : variant === "default"
        ? { backgroundColor: theme.colors.card }
        : {}),
  };

  const headerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  };

  return (
    <View style={[containerStyle, style]}>
      <LiquidPressable
        onPress={handlePress}
        style={headerStyle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
      >
        {icon && <View>{icon}</View>}
        <Text
          style={[styles.headerTitle, { color: theme.colors.foreground, flex: 1 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Animated.View style={animatedChevronStyle}>
          <Text
            style={{ color: theme.colors.mutedForeground, fontSize: 14 }}
            accessibilityElementsHidden
          >
            ▼
          </Text>
        </Animated.View>
      </LiquidPressable>

      <Animated.View style={animatedContentStyle}>
        <View
          onLayout={handleLayout}
          style={{
            position: animatedHeight.value < 0 ? "relative" : "absolute",
            width: "100%",
            paddingHorizontal: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          }}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );

};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default Collapsible;
