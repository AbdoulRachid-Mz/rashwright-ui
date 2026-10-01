// @/components/ui/radio.tsx
//
// Bouton radio accessible avec point d'indicateur animé Reanimated et RadioGroup contextuel.

import React, { createContext, useContext, useEffect } from "react";
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
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidHighlight from "./liquid/liquid-highlight";

interface RadioGroupContextType<T extends string = string> {
  value?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(
  undefined
);

export interface RadioGroupProps<T extends string = string> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function RadioGroup<T extends string = string>({
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  style,
}: RadioGroupProps<T>) {
  const [internalValue, setInternalValue] = React.useState<T | undefined>(
    value ?? defaultValue
  );

  const selectedValue = value !== undefined ? value : internalValue;

  const handleChange = (val: T) => {
    if (disabled) return;
    if (onValueChange) {
      onValueChange(val);
    } else {
      setInternalValue(val);
    }
  };

  return (
    <RadioGroupContext.Provider
      value={{
        value: selectedValue,
        onValueChange: handleChange as any,
        disabled,
      }}
    >
      <View style={[styles.group, style]}>{children}</View>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps<T extends string = string> {
  value: T;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function Radio<T extends string = string>({
  value,
  label,
  description,
  disabled: itemDisabled,
  size = "md",
  style,
  labelStyle,
}: RadioProps<T>) {
  const context = useContext(RadioGroupContext);
  const { theme, isDark } = useTheme();

  const isSelected = context?.value === value;
  const isDisabled = itemDisabled || context?.disabled || false;

  const scale = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1 : 0, {
      damping: 14,
      stiffness: 280,
    });
  }, [isSelected]);

  const sizeConfig = {
    sm: { outer: 18, inner: 8, fontSize: theme.typography.xs },
    md: { outer: 22, inner: 10, fontSize: theme.typography.sm },
    lg: { outer: 26, inner: 12, fontSize: theme.typography.base },
  }[size];

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const handlePress = () => {
    if (!isDisabled && context?.onValueChange) {
      context.onValueChange(value);
    }
  };

  return (
    <LiquidPressable
      onPress={handlePress}
      disabled={isDisabled}
      viscosity="soft"
      style={[styles.container, style]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
    >
      <View
        style={[
          styles.outerCircle,
          {
            width: sizeConfig.outer,
            height: sizeConfig.outer,
            borderRadius: sizeConfig.outer / 2,
            borderColor: isSelected
              ? theme.colors.primary
              : isDark
              ? "rgba(255, 255, 255, 0.2)"
              : theme.colors.border,
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
          },
        ]}
      >
        {isSelected && (
          <LiquidHighlight
            type="top"
            borderRadius={sizeConfig.outer / 2}
            opacity={0.5}
          />
        )}
        <Animated.View
          style={[
            styles.innerDot,
            {
              width: sizeConfig.inner,
              height: sizeConfig.inner,
              borderRadius: sizeConfig.inner / 2,
              backgroundColor: theme.colors.primary,
            },
            dotAnimatedStyle,
          ]}
        />
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
}

export default Radio;

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    alignSelf: "flex-start",
  },
  outerCircle: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  innerDot: {},
  textContainer: {
    flex: 1,
    gap: 2,
  },
  label: {},
});
