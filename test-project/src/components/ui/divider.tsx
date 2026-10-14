// @/components/ui/divider.tsx
//
// Séparateur horizontal ou vertical avec support des styles glass, subtle et solid
// et support optionnel de label textuel (ex: "ou").

import React, { useMemo } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";

export type DividerVariant = "solid" | "subtle" | "glass";
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  label?: string;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = ({
  variant = "subtle",
  orientation = "horizontal",
  label,
  spacing,
  style,
}) => {
  const { theme, isDark } = useTheme();

  const glass = useMemo(
    () => createGlassTheme(theme, isDark),
    [theme, isDark]
  );

  const dividerColor = useMemo(() => {
    switch (variant) {
      case "solid":
        return theme.colors.border;
      case "glass":
        return glass.border.regular;
      case "subtle":
      default:
        return isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    }
  }, [variant, theme, isDark, glass]);

  const defaultSpacing = spacing ?? (orientation === "horizontal" ? 12 : 8);

  if (orientation === "vertical") {
    return (
      <View
        style={[
          styles.vertical,
          {
            backgroundColor: dividerColor,
            marginHorizontal: defaultSpacing,
          },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View
        style={[
          styles.labelContainer,
          { marginVertical: defaultSpacing },
          style,
        ]}
      >
        <View style={[styles.line, { backgroundColor: dividerColor }]} />
        <ThemedText
          variant="xs"
          weight="medium"
          color="mutedForeground"
          style={styles.labelText}
        >
          {label}
        </ThemedText>
        <View style={[styles.line, { backgroundColor: dividerColor }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontal,
        {
          backgroundColor: dividerColor,
          marginVertical: defaultSpacing,
        },
        style,
      ]}
    />
  );
};

export default Divider;

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    height: "100%",
    alignSelf: "stretch",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
  },
  labelText: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
