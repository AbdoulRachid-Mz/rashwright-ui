// @/components/ui/data-table.tsx
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Pressable,
  ListRenderItemInfo,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import LiquidPressable from "./liquid/liquid-pressable";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  width?: number;
  flex?: number;
  sortable?: boolean;
  renderCell?: (item: T, value: T[keyof T]) => React.ReactNode;
}

export type DataTableVariant = "default" | "bordered" | "glass";

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowPress?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  striped?: boolean;
  compact?: boolean;
  variant?: DataTableVariant;
  style?: StyleProp<ViewStyle>;
  keyExtractor?: (item: T, index: number) => string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

// ─── Search Input (inline, no dep) ───────────────────────────────────────────

interface InlineSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
  borderRadius: number;
}

const InlineSearch: React.FC<InlineSearchProps> = ({
  value,
  onChange,
  placeholder,
  borderColor,
  backgroundColor,
  textColor,
  placeholderColor,
  borderRadius,
}) => {
  const { TextInput } = require("react-native") as typeof import("react-native");
  return (
    <View
      style={[
        styles.searchContainer,
        { borderColor, backgroundColor, borderRadius },
      ]}
    >
      <Text style={[styles.searchIcon, { color: placeholderColor }]}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: textColor }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Search table"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange("")}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={[styles.clearIcon, { color: placeholderColor }]}>✕</Text>
        </Pressable>
      )}
    </View>
  );
};

// ─── DataTable ────────────────────────────────────────────────────────────────

function DataTableInner<T extends Record<string, unknown>>(
  props: DataTableProps<T>
): React.ReactElement {
  const {
    data,
    columns,
    onRowPress,
    searchable = false,
    searchPlaceholder = "Rechercher…",
    emptyText = "Aucune donnée",
    striped = false,
    compact = false,
    variant = "default",
    style,
    keyExtractor,
  } = props;

  const { theme, isDark, liquidGlassEnabled } = useTheme();
  const glassTheme = liquidGlassEnabled ? createGlassTheme(theme, isDark) : null;

  const [sortState, setSortState] = useState<SortState>({
    key: "",
    direction: null,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ── Sort handler ────────────────────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    setSortState((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: "", direction: null };
    });
  }, []);

  // ── Filtered + sorted data ──────────────────────────────────────────────────
  const processedData = useMemo<T[]>(() => {
    let result = [...data];

    // Filter
    if (searchable && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = row[col.key];
          return typeof val === "string" && val.toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortState.direction && sortState.key) {
      const k = sortState.key as keyof T;
      result = [...result].sort((a, b) => {
        const av = a[k];
        const bv = b[k];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        let cmp = 0;
        if (typeof av === "number" && typeof bv === "number") {
          cmp = av - bv;
        } else {
          cmp = String(av).localeCompare(String(bv));
        }
        return sortState.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, searchable, columns, sortState]);

  // ── Style resolution ────────────────────────────────────────────────────────
  const isGlass = variant === "glass" && liquidGlassEnabled && glassTheme;
  const isBordered = variant === "bordered";

  const containerBg = isGlass
    ? glassTheme!.materials.soft.background
    : theme.colors.card ?? theme.colors.background;
  const borderColor: string = isGlass
    ? glassTheme!.border.subtle
    : theme.colors.border ?? "#E5E7EB";
  const textColor = theme.colors.foreground ?? "#111827";
  const mutedColor = theme.colors.mutedForeground ?? "#6B7280";
  const headerBg = isGlass
    ? glassTheme!.materials.soft.background
    : theme.colors.muted ?? "#F3F4F6";
  const stripedColor = theme.colors.muted ?? "#F9FAFB";
  const rowBorderColor = borderColor;
  const radius = theme.borderRadius?.md ?? 8;
  const cellPaddingV = compact ? 6 : 12;
  const cellPaddingH = compact ? 8 : 12;

  // ── Header ──────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: headerBg,
          borderBottomColor: borderColor,
          paddingVertical: cellPaddingV,
          paddingHorizontal: cellPaddingH,
        },
      ]}
    >
      {columns.map((col) => {
        const isSorted = sortState.key === String(col.key);
        const colStyle: ViewStyle = {
          flex: col.flex ?? 1,
          width: col.width,
        };
        const icon =
          isSorted && sortState.direction === "asc"
            ? " ↑"
            : isSorted && sortState.direction === "desc"
            ? " ↓"
            : col.sortable
            ? " ↕"
            : "";

        return (
          <View key={String(col.key)} style={colStyle}>
            {col.sortable ? (
              <Pressable
                onPress={() => handleSort(String(col.key))}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${col.header}`}
              >
                <Text
                  style={[
                    styles.headerText,
                    { color: isSorted ? textColor : mutedColor },
                  ]}
                  numberOfLines={1}
                >
                  {col.header}
                  <Text style={{ color: theme.colors.primary ?? "#6366F1" }}>
                    {icon}
                  </Text>
                </Text>
              </Pressable>
            ) : (
              <Text
                style={[styles.headerText, { color: mutedColor }]}
                numberOfLines={1}
              >
                {col.header}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  // ── Row ─────────────────────────────────────────────────────────────────────
  const renderRow = ({ item, index }: ListRenderItemInfo<T>) => {
    const isStriped = striped && index % 2 === 1;
    const rowBg = isStriped ? stripedColor : "transparent";

    const rowContent = (
      <View
        style={[
          styles.row,
          {
            backgroundColor: rowBg,
            borderBottomColor: rowBorderColor,
            paddingVertical: cellPaddingV,
            paddingHorizontal: cellPaddingH,
          },
        ]}
      >
        {columns.map((col) => {
          const value = item[col.key];
          return (
            <View
              key={String(col.key)}
              style={{ flex: col.flex ?? 1, width: col.width }}
            >
              {col.renderCell ? (
                col.renderCell(item, value)
              ) : (
                <Text
                  style={[styles.cellText, { color: textColor }]}
                  numberOfLines={2}
                >
                  {value === null || value === undefined
                    ? "—"
                    : String(value)}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );

    if (onRowPress) {
      return (
        <LiquidPressable
          onPress={() => onRowPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`Row ${index + 1}`}
        >
          {rowContent}
        </LiquidPressable>
      );
    }

    return rowContent;
  };

  // ── Empty ───────────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: mutedColor }]}>{emptyText}</Text>
    </View>
  );

  // ── Key extractor ───────────────────────────────────────────────────────────
  const defaultKeyExtractor = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) return keyExtractor(item, index);
      const id = (item as Record<string, unknown>)["id"];
      return id !== undefined ? String(id) : String(index);
    },
    [keyExtractor]
  );

  // ── Container border style ──────────────────────────────────────────────────
  const containerBorderStyle: ViewStyle =
    isBordered || isGlass
      ? { borderWidth: 1, borderColor: borderColor as string, borderRadius: radius }
      : {};

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: containerBg },
        containerBorderStyle,
        style,
      ]}
    >
      {searchable && (
        <View style={{ padding: 8 }}>
          <InlineSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            borderColor={borderColor}
            backgroundColor={theme.colors.background}
            textColor={textColor}
            placeholderColor={mutedColor}
            borderRadius={radius}
          />
        </View>
      )}
      <FlatList
        data={processedData}
        keyExtractor={defaultKeyExtractor}
        ListHeaderComponent={renderHeader}
        renderItem={renderRow}
        ListEmptyComponent={renderEmpty}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      />
    </View>
  );
}

// Wrap with React.memo (generic workaround)
export const DataTable = React.memo(DataTableInner) as typeof DataTableInner;

export default DataTable;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cellText: {
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
