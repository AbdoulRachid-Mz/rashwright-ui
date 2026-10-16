// @/components/ui/calendar.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CalendarMode = "single" | "multiple" | "range";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface CalendarProps {
  mode?: CalendarMode;
  selected?: Date | Date[] | DateRange;
  onSelect?: (value: Date | Date[] | DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  /** @default 'fr-FR' */
  locale?: string;
  variant?: "default" | "glass";
  style?: StyleProp<ViewStyle>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(d: Date, from: Date, to: Date): boolean {
  const time = d.getTime();
  const f = from.getTime();
  const t = to.getTime();
  return f < t ? time > f && time < t : time > t && time < f;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ─── Calendar ────────────────────────────────────────────────────────────────

const WEEK_DAYS_SHORT = ["L", "Ma", "Me", "J", "V", "S", "D"] as const;

function Calendar({
  mode = "single",
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDates = [],
  locale = "fr-FR",
  variant = "default",
  style,
}: CalendarProps) {
  const { theme, isDark } = useTheme();
  const glassTheme = variant === "glass" ? createGlassTheme(theme, isDark) : null;

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Seed with the first selected date when available
    if (selected instanceof Date) return new Date(selected.getFullYear(), selected.getMonth(), 1);
    if (Array.isArray(selected) && selected.length > 0)
      return new Date(selected[0].getFullYear(), selected[0].getMonth(), 1);
    if (selected && !Array.isArray(selected) && !(selected instanceof Date)) {
      const range = selected as DateRange;
      if (range.from) return new Date(range.from.getFullYear(), range.from.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  // ── Navigation ──────────────────────────────────────────────────────────

  const goToPrev = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  // ── Grid computation ────────────────────────────────────────────────────

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // getDay(): 0=Sun … 6=Sat → we want Mon=0 … Sun=6
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDayOffset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build a flat list of { date, isCurrentMonth }
  interface DayCell {
    date: Date;
    isCurrentMonth: boolean;
  }

  const cells: DayCell[] = [];

  // Trailing days from previous month
  for (let i = firstDayOffset - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
  }

  // Leading days from next month
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const fill = 7 - remainder;
    for (let d = 1; d <= fill; d++) {
      cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
  }

  // ── Disability check ────────────────────────────────────────────────────

  function isDisabled(date: Date): boolean {
    const d = startOfDay(date);
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return disabledDates.some((dd) => isSameDay(dd, date));
  }

  // ── Selection state checks ──────────────────────────────────────────────

  function isSelected(date: Date): boolean {
    if (!selected) return false;
    if (mode === "single" && selected instanceof Date) {
      return isSameDay(selected, date);
    }
    if (mode === "multiple" && Array.isArray(selected)) {
      return selected.some((s) => isSameDay(s, date));
    }
    if (mode === "range" && !Array.isArray(selected) && !(selected instanceof Date)) {
      const range = selected as DateRange;
      if (range.from && isSameDay(range.from, date)) return true;
      if (range.to && isSameDay(range.to, date)) return true;
    }
    return false;
  }

  function isBetween(date: Date): boolean {
    if (mode !== "range") return false;
    if (!selected || Array.isArray(selected) || selected instanceof Date) return false;
    const range = selected as DateRange;
    if (!range.from || !range.to) return false;
    return isInRange(date, range.from, range.to);
  }

  // ── Press handler ───────────────────────────────────────────────────────

  function handleDayPress(date: Date) {
    if (isDisabled(date)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === "single") {
      onSelect?.(date);
      return;
    }

    if (mode === "multiple") {
      const arr = Array.isArray(selected) ? (selected as Date[]) : [];
      const idx = arr.findIndex((s) => isSameDay(s, date));
      if (idx === -1) {
        onSelect?.([...arr, date]);
      } else {
        const next = [...arr];
        next.splice(idx, 1);
        onSelect?.(next.length === 0 ? undefined : next);
      }
      return;
    }

    if (mode === "range") {
      const range =
        !selected || Array.isArray(selected) || selected instanceof Date
          ? ({} as DateRange)
          : (selected as DateRange);

      if (!range.from || (range.from && range.to)) {
        // Start new range
        onSelect?.({ from: date, to: undefined });
      } else {
        // Set 'to', ensure order
        if (date < range.from) {
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      }
    }
  }

  // ── Localized header ────────────────────────────────────────────────────

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  // ── Styles ──────────────────────────────────────────────────────────────

  const containerBg =
    glassTheme
      ? (glassTheme as { backgroundColor?: string }).backgroundColor ?? theme.colors.card
      : theme.colors.card;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: containerBg,
      borderRadius: 16,
      padding: 16,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    navBtn: {
      padding: 8,
    },
    navBtnText: {
      fontSize: 22,
      color: theme.colors.foreground,
      lineHeight: 24,
    },
    monthLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.foreground,
      textTransform: "capitalize",
    },
    weekRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    weekDayLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.foreground,
      opacity: 0.6,
      paddingVertical: 4,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: `${100 / 7}%` as `${number}%`,
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dayInner: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      fontSize: 14,
      color: theme.colors.foreground,
    },
  });

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={goToPrev} hitSlop={8}>
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable style={styles.navBtn} onPress={goToNext} hitSlop={8}>
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
      </View>

      {/* Week day headers */}
      <View style={styles.weekRow}>
        {WEEK_DAYS_SHORT.map((d) => (
          <Text key={d} style={styles.weekDayLabel}>
            {d}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          const disabled = isDisabled(cell.date);
          const selected_ = isSelected(cell.date);
          const between = isBetween(cell.date);

          const opacity = !cell.isCurrentMonth
            ? 0.3
            : disabled
            ? 0.25
            : 1;

          const innerBg = selected_
            ? theme.colors.primary
            : between
            ? `${theme.colors.primary}33` // ~20% opacity
            : "transparent";

          const textColor = selected_ ? "#ffffff" : theme.colors.foreground;

          return (
            <Pressable
              key={idx}
              style={[styles.dayCell, { opacity }]}
              onPress={() => cell.isCurrentMonth && handleDayPress(cell.date)}
              disabled={disabled || !cell.isCurrentMonth}
            >
              <View style={[styles.dayInner, { backgroundColor: innerBg }]}>
                <Text style={[styles.dayText, { color: textColor }]}>
                  {cell.date.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { Calendar };
export default Calendar;
