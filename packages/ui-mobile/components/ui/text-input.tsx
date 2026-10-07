// @/components/ui/text-input.tsx
import React, { ReactNode, forwardRef, useMemo, useState } from "react";
import {
  Platform,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";

export interface TextInputProps extends RNTextInputProps {
  className?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean | string;
  label?: string;
  hint?: string;
}

const TextInput = forwardRef<React.ElementRef<typeof RNTextInput>, TextInputProps>(
  (
    {
      style,
      containerStyle,
      leftIcon,
      rightIcon,
      error = false,
      onFocus,
      onBlur,
      label,
      hint,
      ...props
    },
    ref
  ) => {
    const { theme, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasError = Boolean(error);
    const errorMessage = typeof error === "string" ? error : undefined;

    const borderColor = hasError
      ? theme.colors.destructive
      : isFocused
      ? theme.colors.primary
      : theme.colors.border;

    const borderWidth = isFocused || hasError ? 1.5 : 1;

    const handleFocus: TextInputProps["onFocus"] = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps["onBlur"] = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const styles = useMemo(() => {
      return StyleSheet.create({
        wrapper: {
          gap: 6,
          width: "100%",
        },
        container: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark
            ? theme.colors.card
            : theme.colors.card,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
          gap: theme.spacing.sm,
          position: "relative",
          overflow: "hidden",
        },
        input: {
          flex: 1,
          color: theme.colors.foreground,
          fontSize: theme.typography.base,
          paddingVertical: theme.spacing.sm,
          ...(Platform.OS === "web" && {
            outlineStyle: "none" satisfies TextStyle[keyof TextStyle],
            outlineWidth: 0,
            borderWidth: 0,
          }),
        },
        icon: {
          justifyContent: "center",
          alignItems: "center",
        },
      });
    }, [theme, isDark]);

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <ThemedText
            variant="sm"
            weight="medium"
            color={hasError ? "destructive" : "foreground"}
          >
            {label}
          </ThemedText>
        )}

        <View
          style={[
            styles.container,
            {
              borderWidth,
              borderColor,
            },
          ]}
        >
          {leftIcon != null && React.isValidElement(leftIcon) && <View style={styles.icon}>{leftIcon}</View>}

          <RNTextInput
            ref={ref}
            style={[styles.input, style] as StyleProp<TextStyle>}
            placeholderTextColor={theme.colors.mutedForeground}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </View>

        {errorMessage && (
          <ThemedText variant="xs" color="destructive">
            {errorMessage}
          </ThemedText>
        )}

        {!errorMessage && hint && (
          <ThemedText variant="xs" color="mutedForeground">
            {hint}
          </ThemedText>
        )}
      </View>
    );
  }
);

TextInput.displayName = "TextInput";

export default TextInput;