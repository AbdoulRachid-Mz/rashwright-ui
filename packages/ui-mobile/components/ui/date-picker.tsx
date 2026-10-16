// @/components/ui/date-picker.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import { Calendar } from "./calendar";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  /** @default 'Sélectionner une date' */
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  /** @default 'fr-FR' */
  locale?: string;
  variant?: "default" | "outlined" | "glass";
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

// ─── DatePicker ──────────────────────────────────────────────────────────────

function DatePicker({
  value,
  onChange,
  placeholder = "Sélectionner une date",
  minDate,
  maxDate,
  disabledDates,
  locale = "fr-FR",
  variant = "default",
  disabled = false,
  label,
  style,
}: DatePickerProps) {
  const { theme, isDark } = useTheme();
  const glassTheme = variant === "glass" ? createGlassTheme(theme, isDark) : null;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date | undefined>(value);

  // Sync draft when external value changes
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const formatDate = useCallback(
    (date: Date): string =>
      new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date),
    [locale]
  );

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setOpen(true);
  }, [disabled, value]);

  const handleConfirm = useCallback(() => {
    if (draft) {
      onChange?.(draft);
    }
    setOpen(false);
  }, [draft, onChange]);

  const handleCancel = useCallback(() => {
    setDraft(value);
    setOpen(false);
  }, [value]);

  // ── Trigger button styles ────────────────────────────────────────────────

  const triggerBorderColor =
    variant === "outlined" ? theme.colors.border : "transparent";

  const triggerBg =
    glassTheme
      ? (glassTheme as { backgroundColor?: string }).backgroundColor ?? theme.colors.card
      : variant === "outlined"
      ? "transparent"
      : theme.colors.card;

  const styles = StyleSheet.create({
    wrapper: {
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.foreground,
      opacity: 0.75,
      marginBottom: 2,
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: triggerBg,
      borderRadius: 12,
      borderWidth: variant === "outlined" ? 1.5 : 0,
      borderColor: triggerBorderColor,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
      opacity: disabled ? 0.45 : 1,
    },
    triggerIcon: {
      fontSize: 18,
    },
    triggerText: {
      flex: 1,
      fontSize: 15,
      color: value ? theme.colors.foreground : `${theme.colors.foreground}66`,
    },
    // Modal / bottom-sheet
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === "ios" ? 36 : 20,
    },
    sheetHandle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.colors.foreground,
      textAlign: "center",
      marginBottom: 16,
    },
    actions: {
      marginTop: 20,
      gap: 10,
    },
    confirmBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmBtnText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
    },
    cancelBtn: {
      alignItems: "center",
      paddingVertical: 10,
    },
    cancelBtnText: {
      color: theme.colors.foreground,
      fontSize: 15,
      opacity: 0.6,
    },
  });

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Trigger */}
      <Pressable style={styles.trigger} onPress={handleOpen} disabled={disabled}>
        <Text style={styles.triggerIcon}>📅</Text>
        <Text style={styles.triggerText}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.overlay}>
            {/* Prevent taps inside sheet from closing modal */}
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Drag handle */}
                <View style={styles.sheetHandle} />

                <Text style={styles.sheetTitle}>Choisir une date</Text>

                {/* Embedded Calendar */}
                <Calendar
                  mode="single"
                  selected={draft}
                  onSelect={(val) => {
                    if (val instanceof Date) setDraft(val);
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  disabledDates={disabledDates}
                  locale={locale}
                  variant={variant === "glass" ? "glass" : "default"}
                />

                {/* Action buttons */}
                <View style={styles.actions}>
                  <Pressable
                    style={styles.confirmBtn}
                    onPress={handleConfirm}
                    disabled={!draft}
                  >
                    <Text style={styles.confirmBtnText}>Confirmer</Text>
                  </Pressable>

                  <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.cancelBtnText}>Annuler</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

export { DatePicker };
export default DatePicker;
