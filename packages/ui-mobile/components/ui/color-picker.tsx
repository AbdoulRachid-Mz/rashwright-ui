// @/components/ui/color-picker.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import * as Haptics from "expo-haptics";

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  showInput?: boolean;
  label?: string;
  variant?: "default" | "glass";
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_PRESETS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#64748B", // Slate
  "#1E293B", // Dark
  "#FFFFFF", // White
];

export function ColorPicker({
  value: controlledValue,
  onChange,
  presets = DEFAULT_PRESETS,
  showInput = true,
  label = "Couleur",
  variant = "default",
  style,
}: ColorPickerProps) {
  const { theme, isDark } = useTheme();
  const [internalValue, setInternalValue] = useState(controlledValue || DEFAULT_PRESETS[5]);
  const isControlled = controlledValue !== undefined;
  const activeColor = isControlled ? controlledValue : internalValue;

  const [hexInput, setHexInput] = useState(activeColor);

  const handleSelectColor = (color: string) => {
    if (!isControlled) {
      setInternalValue(color);
    }
    setHexInput(color);
    onChange?.(color);
    try {
      Haptics.selectionAsync();
    } catch {
      // optional
    }
  };

  const handleHexSubmit = () => {
    let clean = hexInput.trim();
    if (!clean.startsWith("#")) {
      clean = "#" + clean;
    }
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
      handleSelectColor(clean.toUpperCase());
    } else {
      setHexInput(activeColor);
    }
  };

  const isGlass = variant === "glass";
  const glass = isGlass ? createGlassTheme(theme, isDark) : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isGlass && glass ? glass.materials.regular.background : theme.colors.card,
          borderColor: isGlass && glass ? glass.border.subtle : theme.colors.border,
        },
        style,
      ]}
    >
      {/* Header : Libellé + Aperçu actif */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.label, { color: theme.colors.foreground }]}>{label}</Text>
          <Text style={[styles.sublabel, { color: theme.colors.mutedForeground }]}>
            {activeColor}
          </Text>
        </View>

        <View
          style={[
            styles.previewSwatch,
            {
              backgroundColor: activeColor,
              borderColor: theme.colors.border,
            },
          ]}
        />
      </View>

      {/* Nuancier de palettes rapides */}
      <View style={styles.presetsGrid}>
        {presets.map((color) => {
          const isSelected = activeColor.toLowerCase() === color.toLowerCase();
          return (
            <TouchableOpacity
              key={color}
              onPress={() => handleSelectColor(color)}
              accessibilityRole="button"
              accessibilityLabel={`Sélectionner la couleur ${color}`}
              style={[
                styles.swatch,
                { backgroundColor: color },
                isSelected && [
                  styles.swatchSelected,
                  { borderColor: theme.colors.foreground },
                ],
              ]}
              activeOpacity={0.8}
            >
              {isSelected && (
                <View
                  style={[
                    styles.checkDot,
                    {
                      backgroundColor:
                        color.toUpperCase() === "#FFFFFF" ? "#000000" : "#FFFFFF",
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Saisie textuelle Hexadécimale */}
      {showInput && (
        <View style={[styles.inputRow, { borderColor: theme.colors.border }]}>
          <Text style={[styles.hashSymbol, { color: theme.colors.mutedForeground }]}>HEX</Text>
          <TextInput
            value={hexInput}
            onChangeText={setHexInput}
            onBlur={handleHexSubmit}
            onSubmitEditing={handleHexSubmit}
            maxLength={7}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, { color: theme.colors.foreground }]}
            placeholder="#000000"
            placeholderTextColor={theme.colors.mutedForeground}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "monospace",
  },
  previewSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.08 }],
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  hashSymbol: {
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace",
    padding: 0,
    margin: 0,
  },
});

export default ColorPicker;
