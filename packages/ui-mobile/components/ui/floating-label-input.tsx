// @/components/ui/floating-label-input.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Platform,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";
import LiquidHighlight from "./liquid/liquid-highlight";
import LiquidBorder from "./liquid/liquid-border";

export interface FloatingLabelInputProps extends Omit<RNTextInputProps, "style"> {
  /** Libellé flottant */
  label: string;
  /** État d'erreur ou message d'erreur */
  error?: boolean | string;
  /** Texte d'aide en dessous */
  hint?: string;
  /** Icône gauche optionnelle */
  leftIcon?: React.ReactNode;
  /** Icône droite optionnelle */
  rightIcon?: React.ReactNode;
  /** Variante visuelle */
  variant?: "default" | "outline" | "glass";
  /** Style du conteneur extérieur */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style de l'input */
  inputStyle?: StyleProp<TextStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

export const FloatingLabelInput = React.forwardRef<RNTextInput, FloatingLabelInputProps>(
  (
    {
      label,
      error = false,
      hint,
      leftIcon,
      rightIcon,
      variant = "default",
      containerStyle,
      inputStyle,
      className,
      value: controlledValue,
      defaultValue,
      onChangeText,
      onFocus,
      onBlur,
      editable = true,
      ...props
    },
    ref
  ) => {
    const { theme, isDark, liquidGlassEnabled } = useTheme();
    const [internalValue, setInternalValue] = useState<string>(defaultValue ?? "");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const hasValue = Boolean(value && value.length > 0);

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    // Animation progress : 0 = resting in center, 1 = floating above
    const floatAnim = useSharedValue(hasValue || isFocused ? 1 : 0);

    useEffect(() => {
      floatAnim.value = withTiming(hasValue || isFocused ? 1 : 0, { duration: 180 });
    }, [hasValue, isFocused, floatAnim]);

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChangeText = useCallback(
      (text: string) => {
        if (!isControlled) {
          setInternalValue(text);
        }
        onChangeText?.(text);
      },
      [isControlled, onChangeText]
    );

    const glass = useMemo(
      () => createGlassTheme(theme, isDark),
      [theme, isDark]
    );

    const animatedLabelStyle = useAnimatedStyle(() => {
      const translateY = interpolate(floatAnim.value, [0, 1], [0, -14]);
      const scale = interpolate(floatAnim.value, [0, 1], [1, 0.78]);

      return {
        transform: [{ translateY }, { scale }],
      };
    });

    const activeBorderColor = hasError
      ? theme.colors.destructive
      : isFocused
      ? theme.colors.primary
      : theme.colors.border;

    const containerBackground = useMemo(() => {
      if (variant === "glass" && liquidGlassEnabled) {
        return glass.materials.soft.background;
      }
      return isDark ? theme.colors.card : theme.colors.card;
    }, [variant, liquidGlassEnabled, glass, isDark, theme]);

    return (
      <View className={className} style={[styles.outerContainer, containerStyle]}>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: containerBackground,
              borderColor: activeBorderColor,
              borderWidth: isFocused || hasError ? 1.5 : 1,
              borderRadius: theme.borderRadius.md,
            },
          ]}
        >
          {variant === "glass" && liquidGlassEnabled && (
            <LiquidHighlight type="top" borderRadius={theme.borderRadius.md} opacity={0.4} />
          )}
          {(variant === "glass" || variant === "outline") && (
            <LiquidBorder variant="subtle" borderRadius={theme.borderRadius.md} />
          )}

          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

          <View style={styles.inputBody}>
            <Animated.Text
              pointerEvents="none"
              style={[
                styles.floatingLabel,
                {
                  color: hasError
                    ? theme.colors.destructive
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.mutedForeground,
                },
                animatedLabelStyle,
              ]}
            >
              {label}
            </Animated.Text>

            <RNTextInput
              ref={ref}
              value={value}
              onChangeText={handleChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              editable={editable}
              accessibilityLabel={props.accessibilityLabel ?? label}
              style={[
                styles.input,
                {
                  color: theme.colors.foreground,
                  fontSize: theme.typography.base,
                },
                inputStyle,
              ]}
              {...props}
            />
          </View>

          {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>

        {errorMessage && (
          <ThemedText variant="xs" color="destructive" style={styles.helperText}>
            {errorMessage}
          </ThemedText>
        )}

        {!errorMessage && hint && (
          <ThemedText variant="xs" color="mutedForeground" style={styles.helperText}>
            {hint}
          </ThemedText>
        )}
      </View>
    );
  }
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export default FloatingLabelInput;

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    gap: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 12,
    position: "relative",
    overflow: "hidden",
  },
  leftIconContainer: {
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBody: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    left: 0,
    top: 18,
    fontSize: 15,
    fontWeight: "500",
    transformOrigin: "left center",
  },
  input: {
    paddingTop: 16,
    paddingBottom: 2,
    paddingHorizontal: 0,
    height: 48,
    ...(Platform.OS === "web" && {
      outlineStyle: "none" as unknown as TextStyle[keyof TextStyle],
      outlineWidth: 0,
      borderWidth: 0,
    }),
  },
  helperText: {
    paddingHorizontal: 4,
  },
});
