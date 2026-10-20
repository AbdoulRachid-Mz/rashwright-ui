// @/components/ui/number-input.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";

export interface NumberInputProps {
  /** Valeur numérique contrôlée */
  value?: number;
  /** Valeur initiale non-contrôlée */
  defaultValue?: number;
  /** Valeur minimale autorisée */
  min?: number;
  /** Valeur maximale autorisée */
  max?: number;
  /** Pas d'incrémentation (défaut : 1) */
  step?: number;
  /** Nombre de décimales (défaut : 0 pour entiers) */
  precision?: number;
  /** Callback lors du changement de valeur */
  onChange?: (value: number) => void;
  /** Libellé optionnel */
  label?: string;
  /** Texte d'aide */
  hint?: string;
  /** Message d'erreur */
  error?: boolean | string;
  /** Désactive le composant */
  disabled?: boolean;
  /** Variante visuelle */
  variant?: "default" | "outline" | "glass";
  /** Formatage d'affichage personnalisé */
  formatValue?: (value: number) => string;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision = 0,
  onChange,
  label,
  hint,
  error,
  disabled = false,
  variant = "default",
  formatValue,
  style,
  className,
}) => {
  const { theme, isDark, liquidGlassEnabled } = useTheme();

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const numericValue = isControlled ? controlledValue : internalValue;

  const [textInputString, setTextInputString] = useState<string>(
    numericValue.toFixed(precision)
  );

  useEffect(() => {
    setTextInputString(numericValue.toFixed(precision));
  }, [numericValue, precision]);

  const clamp = useCallback(
    (val: number): number => {
      const clamped = Math.max(min, Math.min(max, val));
      return Number(clamped.toFixed(precision));
    },
    [min, max, precision]
  );

  const updateValue = useCallback(
    (nextVal: number) => {
      const validVal = clamp(nextVal);
      if (!isControlled) {
        setInternalValue(validVal);
      }
      setTextInputString(validVal.toFixed(precision));
      onChange?.(validVal);
    },
    [clamp, isControlled, precision, onChange]
  );

  const handleIncrement = useCallback(() => {
    if (disabled || numericValue >= max) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    updateValue(numericValue + step);
  }, [disabled, numericValue, max, step, updateValue]);

  const handleDecrement = useCallback(() => {
    if (disabled || numericValue <= min) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    updateValue(numericValue - step);
  }, [disabled, numericValue, min, step, updateValue]);

  const handleTextChange = useCallback((text: string) => {
    setTextInputString(text);
  }, []);

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(textInputString);
    if (isNaN(parsed)) {
      setTextInputString(numericValue.toFixed(precision));
    } else {
      updateValue(parsed);
    }
  }, [textInputString, numericValue, precision, updateValue]);

  const glass = useMemo(() => createGlassTheme(theme, isDark), [theme, isDark]);

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : undefined;

  const containerBg =
    variant === "glass" && liquidGlassEnabled
      ? glass.materials.soft.background
      : theme.colors.card;

  const borderColor = hasError
    ? theme.colors.destructive
    : theme.colors.border;

  const displayString = formatValue ? formatValue(numericValue) : textInputString;

  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label && (
        <ThemedText variant="sm" weight="medium" color={hasError ? "destructive" : "foreground"}>
          {label}
        </ThemedText>
      )}

      <View
        style={[
          styles.container,
          {
            backgroundColor: containerBg,
            borderColor,
            borderWidth: 1,
            borderRadius: theme.borderRadius.md,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <TouchableOpacity
          disabled={disabled || numericValue <= min}
          onPress={handleDecrement}
          accessibilityRole="button"
          accessibilityLabel="Diminuer la valeur"
          style={[
            styles.button,
            { borderRightColor: theme.colors.border, borderRightWidth: 1 },
          ]}
        >
          <Ionicons
            name="remove"
            size={18}
            color={
              numericValue <= min || disabled
                ? theme.colors.mutedForeground
                : theme.colors.foreground
            }
          />
        </TouchableOpacity>

        <TextInput
          value={displayString}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          keyboardType="numeric"
          editable={!disabled && !formatValue}
          style={[
            styles.input,
            {
              color: theme.colors.foreground,
              fontSize: theme.typography.base,
            },
          ]}
          accessibilityRole="adjustable"
        />

        <TouchableOpacity
          disabled={disabled || numericValue >= max}
          onPress={handleIncrement}
          accessibilityRole="button"
          accessibilityLabel="Augmenter la valeur"
          style={[
            styles.button,
            { borderLeftColor: theme.colors.border, borderLeftWidth: 1 },
          ]}
        >
          <Ionicons
            name="add"
            size={18}
            color={
              numericValue >= max || disabled
                ? theme.colors.mutedForeground
                : theme.colors.foreground
            }
          />
        </TouchableOpacity>
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
};

export default NumberInput;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    overflow: "hidden",
  },
  button: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    textAlign: "center",
    fontWeight: "600",
    ...(Platform.OS === "web" && {
      outlineStyle: "none" as unknown as TextStyle[keyof TextStyle],
      outlineWidth: 0,
      borderWidth: 0,
    }),
  },
});
