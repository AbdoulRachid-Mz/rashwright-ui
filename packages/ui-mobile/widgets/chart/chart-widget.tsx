// @/components/widgets/chart/chart-widget.tsx
import React, { useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { ChartWidgetProps, ChartDataPoint } from "./types";

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  subtitle,
  data,
  type = "bar",
  height = 160,
  unit = "",
  color,
  secondaryColor,
  emptyText = "Aucune donnée disponible",
  loading = false,
  variant = "glass",
  onSelectPoint,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const primaryBarColor = color || theme.colors.primary;
  const secondaryBarColor = secondaryColor || (isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.20)");

  const { maxValue, hasSecondary } = useMemo(() => {
    let max = 0;
    let sec = false;
    for (const d of data) {
      if (d.value > max) max = d.value;
      if (d.secondaryValue !== undefined) {
        sec = true;
        if (d.secondaryValue > max) max = d.secondaryValue;
      }
    }
    return { maxValue: max > 0 ? max : 1, hasSecondary: sec };
  }, [data]);

  const handleBarPress = async (point: ChartDataPoint, index: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }
    setSelectedIndex((prev) => (prev === index ? null : index));
    if (onSelectPoint) {
      onSelectPoint(point, index);
    }
  };

  const selectedPoint = selectedIndex !== null && data[selectedIndex] ? data[selectedIndex] : null;

  if (loading) {
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement du graphique ${title}`}
      >
        <Card.Header style={styles.header}>
          <View>
            <Skeleton width={120} height={18} borderRadius={4} />
            <Skeleton width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </Card.Header>
        <Card.Content>
          <View style={[styles.chartContainer, { height }]}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <View key={idx} style={styles.skeletonBarWrapper}>
                <Skeleton
                  width={24}
                  height={Math.max(30, (idx + 1) * 22)}
                  borderRadius={6}
                />
                <Skeleton width={20} height={10} borderRadius={3} style={{ marginTop: 6 }} />
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card variant={variant} style={[styles.card, style]} testID={testID}>
        <Card.Header style={styles.header}>
          <ThemedText variant="base" weight="semibold" color="foreground">
            {title}
          </ThemedText>
        </Card.Header>
        <Card.Content style={[styles.emptyContainer, { height }]}>
          <ThemedText variant="sm" color="mutedForeground">
            {emptyText}
          </ThemedText>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ""}`}
    >
      <Card.Header style={styles.header}>
        <View style={styles.titleCol}>
          <ThemedText variant="base" weight="bold" color="foreground">
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText variant="xs" color="mutedForeground">
              {subtitle}
            </ThemedText>
          )}
        </View>

        {selectedPoint && (
          <Badge variant="primary" size="sm">
            {`${selectedPoint.label}: ${selectedPoint.value}${unit ? ` ${unit}` : ""}`}
          </Badge>
        )}
      </Card.Header>

      <Card.Content>
        {type === "bar" ? (
          <View style={[styles.chartContainer, { height }]}>
            {data.map((point, index) => {
              const isSelected = selectedIndex === index;
              const barHeightPct = Math.max(6, Math.round((point.value / maxValue) * 100));
              const pointColor = point.color || primaryBarColor;

              return (
                <TouchableOpacity
                  key={`${point.label}-${index}`}
                  onPress={() => handleBarPress(point, index)}
                  activeOpacity={0.8}
                  style={styles.barColumn}
                  accessibilityRole="button"
                  accessibilityLabel={`${point.label}: ${point.value}${unit}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: pointColor,
                          opacity: selectedIndex === null || isSelected ? 1 : 0.45,
                        },
                        isSelected && {
                          borderWidth: 2,
                          borderColor: theme.colors.foreground,
                        },
                      ]}
                    />

                    {hasSecondary && point.secondaryValue !== undefined && (
                      <View
                        style={[
                          styles.barFill,
                          styles.secondaryBarFill,
                          {
                            height: `${Math.max(6, Math.round((point.secondaryValue / maxValue) * 100))}%`,
                            backgroundColor: secondaryBarColor,
                          },
                        ]}
                      />
                    )}
                  </View>

                  <ThemedText
                    variant="xs"
                    weight={isSelected ? "bold" : "normal"}
                    color={isSelected ? "foreground" : "mutedForeground"}
                    numberOfLines={1}
                    style={styles.xLabel}
                  >
                    {point.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.horizontalList}>
            {data.map((point, index) => {
              const isSelected = selectedIndex === index;
              const barWidthPct = Math.max(5, Math.round((point.value / maxValue) * 100));
              const pointColor = point.color || primaryBarColor;

              return (
                <TouchableOpacity
                  key={`${point.label}-${index}`}
                  onPress={() => handleBarPress(point, index)}
                  activeOpacity={0.8}
                  style={styles.horizontalRow}
                >
                  <ThemedText variant="xs" color="mutedForeground" style={styles.horizontalLabel}>
                    {point.label}
                  </ThemedText>
                  <View style={styles.horizontalTrack}>
                    <View
                      style={[
                        styles.horizontalFill,
                        {
                          width: `${barWidthPct}%`,
                          backgroundColor: pointColor,
                          opacity: selectedIndex === null || isSelected ? 1 : 0.45,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText variant="xs" weight="medium" color="foreground" style={styles.horizontalValue}>
                    {`${point.value}${unit}`}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleCol: {
    flexShrink: 1,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    gap: 3,
  },
  barFill: {
    width: 14,
    minHeight: 8,
    borderRadius: 6,
  },
  secondaryBarFill: {
    width: 10,
  },
  xLabel: {
    marginTop: 8,
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonBarWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  horizontalList: {
    gap: 10,
  },
  horizontalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  horizontalLabel: {
    width: 50,
  },
  horizontalTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  horizontalFill: {
    height: "100%",
    borderRadius: 6,
  },
  horizontalValue: {
    width: 45,
    textAlign: "right",
  },
});

export default ChartWidget;
