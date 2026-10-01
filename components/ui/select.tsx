// @/components/ui/select.tsx
//
// Sélecteur de menu déroulant / modal avec déclencheur Liquid Glass et options animées.

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "./text";
import LiquidPressable from "./liquid/liquid-pressable";
import LiquidSurface from "./liquid/liquid-surface";
import ThemedModal from "./modal";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps<T extends string = string> {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Select<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Sélectionner...",
  label,
  disabled = false,
  style,
}: SelectProps<T>) {
  const { theme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<T | undefined>(
    value ?? defaultValue
  );

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (val: T) => {
    if (onValueChange) {
      onValueChange(val);
    } else {
      setInternalValue(val);
    }
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <ThemedText variant="sm" weight="medium">
          {label}
        </ThemedText>
      )}

      {/* Trigger Button */}
      <LiquidPressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        viscosity="soft"
        style={styles.pressableWrapper}
      >
        <LiquidSurface
          material="soft"
          borderRadius={theme.borderRadius.md}
          style={styles.triggerSurface}
        >
          <View style={styles.triggerContent}>
            {selectedOption?.icon && (
              <View style={styles.iconContainer}>{selectedOption.icon}</View>
            )}
            <ThemedText
              variant="base"
              color={selectedOption ? "foreground" : "mutedForeground"}
              style={styles.triggerText}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </ThemedText>
            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.colors.mutedForeground}
            />
          </View>
        </LiquidSurface>
      </LiquidPressable>

      {/* Options Modal */}
      <ThemedModal
        visible={open}
        onClose={() => setOpen(false)}
        style={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <ThemedText variant="lg" weight="bold">
            {label || placeholder}
          </ThemedText>
          <LiquidPressable
            onPress={() => setOpen(false)}
            style={styles.closeBtn}
            viscosity="soft"
          >
            <Ionicons
              name="close"
              size={20}
              color={theme.colors.mutedForeground}
            />
          </LiquidPressable>
        </View>

        <ScrollView style={styles.optionsList}>
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <LiquidPressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                viscosity="soft"
                style={[
                  styles.optionItem,
                  isSelected && {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                ]}
              >
                {opt.icon && <View style={styles.iconContainer}>{opt.icon}</View>}
                <ThemedText
                  variant="base"
                  weight={isSelected ? "semibold" : "normal"}
                  color={isSelected ? "primary" : "foreground"}
                  style={styles.optionLabel}
                >
                  {opt.label}
                </ThemedText>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </LiquidPressable>
            );
          })}
        </ScrollView>
      </ThemedModal>
    </View>
  );
}

export default Select;

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
    width: "100%",
  },
  pressableWrapper: {
    width: "100%",
  },
  triggerSurface: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
  },
  triggerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  triggerText: {
    flex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.15)",
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  optionLabel: {
    flex: 1,
  },
});
