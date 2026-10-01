// @/components/ui/checkbox.tsx
//
// Case à cocher accessible avec animations Reanimated et style Liquid Glass.

import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";

export interface CheckboxProps {
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  label,
  description,
  disabled = false,
  size = "md",
  style,
  labelStyle,
}) => {
  const { theme, isDark } = useTheme();

  const scale = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, {
      damping: 15,
      stiffness: 300,
    });
  }, [checked]);

  const sizeConfig = {
    sm: { box: 18, radius: 4, icon: 12, fontSize: theme.typography.xs },
    md: { box: 22, radius: 6, icon: 16, fontSize: theme.typography.sm },
    lg: { box: 26, radius: 8, icon: 20, fontSize: theme.typography.base },
  }[size];

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!checked);
    }
  };

  return (
    <LiquidPressable
      onPress={handleToggle}
      disabled={disabled}
      viscosity="soft"
      style={[styles.container, style]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View
        style={[
          styles.box,
          {
            width: sizeConfig.box,
            height: sizeConfig.box,
            borderRadius: sizeConfig.radius,
            borderColor: checked
              ? theme.colors.primary
              : isDark
              ? "rgba(255, 255, 255, 0.2)"
              : theme.colors.border,
            backgroundColor: checked
              ? theme.colors.primary
              : isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
          },
        ]}
      >
        {checked && (
          <LiquidHighlight
            type="top"
            borderRadius={sizeConfig.radius}
            opacity={0.6}
          />
        )}
        <Animated.View style={checkAnimatedStyle}>
          <Ionicons
            name="checkmark"
            size={sizeConfig.icon}
            color={theme.colors.primaryForeground}
          />
        </Animated.View>
      </View>

      {(label || description) && (
        <View style={styles.textContainer}>
          {label && (
            <ThemedText
              style={[
                styles.label,
                { fontSize: sizeConfig.fontSize },
                labelStyle,
              ]}
              weight="medium"
            >
              {label}
            </ThemedText>
          )}
          {description && (
            <ThemedText variant="xs" color="mutedForeground">
              {description}
            </ThemedText>
          )}
        </View>
      )}
    </LiquidPressable>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    alignSelf: "flex-start",
  },
  box: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {},
});
