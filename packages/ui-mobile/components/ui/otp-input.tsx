// @/components/ui/otp-input.tsx
import React, { useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  variant?: "default" | "outline" | "glass";
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ─── OtpCell ─────────────────────────────────────────────────────────────────

interface OtpCellProps {
  char: string;
  isFocused: boolean;
  isError: boolean;
  secureTextEntry: boolean;
  variant: "default" | "outline" | "glass";
  onPress: () => void;
}

const OtpCell: React.FC<OtpCellProps> = ({
  char,
  isFocused,
  isError,
  secureTextEntry,
  variant,
  onPress,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const borderAnim = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    borderAnim.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
  }, [isFocused, borderAnim]);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: isError
      ? theme.colors.destructive
      : isFocused
        ? theme.colors.primary
        : theme.colors.border,
    borderWidth: isFocused ? 2 : 1,
  }));

  const useGlass = variant === "glass" && liquidGlassEnabled;
  const glassTheme = useGlass
    ? createGlassTheme(theme, isDark)
    : null;

  const cellBackground: ViewStyle = {
    ...(useGlass && glassTheme
      ? { backgroundColor: glassTheme.materials.soft.background }
      : variant === "default"
        ? {
            backgroundColor: char
              ? theme.colors.muted
              : theme.colors.background,
          }
        : { backgroundColor: "transparent" }),
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="none"
      accessibilityElementsHidden
    >
      <Animated.View
        style={[
          styles.cell,
          {
            borderRadius: theme.borderRadius.md,
            width: 48,
            height: 56,
          },
          cellBackground,
          animatedBorderStyle,
        ]}
      >
        <Text
          style={[
            styles.cellText,
            { color: theme.colors.foreground },
          ]}
        >
          {secureTextEntry && char ? "•" : char}
        </Text>
        {isFocused && !char && (
          <View
            style={[
              styles.cursor,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

// ─── OtpInput ─────────────────────────────────────────────────────────────────

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value = "",
  onChange,
  onComplete,
  variant = "default",
  error = false,
  disabled = false,
  autoFocus = false,
  secureTextEntry = false,
  style,
}) => {
  const { theme } = useTheme();
  const inputRefs = useRef<Array<TextInput | null>>(
    Array.from({ length }, () => null),
  );
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      const cleaned = text.replace(/[^0-9]/g, "");
      if (!cleaned) return;

      const char = cleaned[cleaned.length - 1];
      const newValue = value.split("");
      newValue[index] = char;
      const next = newValue.join("").slice(0, length);

      onChange(next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        inputRefs.current[index]?.blur();
        if (next.length === length) {
          onComplete?.(next);
        }
      }
    },
    [value, length, onChange, onComplete],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace") {
        if (digits[index]) {
          const newValue = value.split("");
          newValue[index] = "";
          onChange(newValue.join(""));
        } else if (index > 0) {
          const newValue = value.split("");
          newValue[index - 1] = "";
          onChange(newValue.join(""));
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [digits, value, onChange],
  );

  const focusCell = useCallback(
    (index: number) => {
      if (disabled) return;
      // Focus the first empty cell or the given index
      const firstEmpty = digits.findIndex((d) => !d);
      const targetIndex =
        firstEmpty === -1 ? length - 1 : Math.min(index, firstEmpty);
      inputRefs.current[targetIndex]?.focus();
    },
    [disabled, digits, length],
  );

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="none"
      accessibilityLabel="OTP input"
    >
      {digits.map((char, index) => (
        <View key={index} style={styles.cellWrapper}>
          <OtpCell
            char={char}
            isFocused={focusedIndex === index}
            isError={error}
            secureTextEntry={secureTextEntry}
            variant={variant}
            onPress={() => focusCell(index)}
          />
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={char}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
            caretHidden
            selectTextOnFocus={false}
            style={styles.hiddenInput}
            accessibilityLabel={`Digit ${index + 1} of ${length}`}
            accessibilityRole="none"
            importantForAccessibility={
              Platform.OS === "android" ? "no-hide-descendants" : "no"
            }
          />
        </View>
      ))}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cellWrapper: {
    position: "relative",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  cellText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  cursor: {
    position: "absolute",
    bottom: 8,
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    top: 0,
    left: 0,
  },
});

export default OtpInput;
