// @/components/widgets/metric/metric-widget.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { MetricWidgetProps } from "./types";

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  description,
  change,
  trend = "neutral",
  trendLabel,
  icon,
  loading = false,
  variant = "glass",
  onPress,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();

  const trendConfig = {
    up: {
      color: "#10B981",
      icon: "trending-up" as const,
      badgeVariant: "success" as const,
      defaultLabel: "Hausse",
    },
    down: {
      color: theme.colors.destructive || "#EF4444",
      icon: "trending-down" as const,
      badgeVariant: "destructive" as const,
      defaultLabel: "Baisse",
    },
    neutral: {
      color: theme.colors.mutedForeground,
      icon: "remove" as const,
      badgeVariant: "secondary" as const,
      defaultLabel: "Stable",
    },
  }[trend];

  const accessibilityValueText = typeof value === "number" ? `${value}` : value;
  const fullA11yLabel = `${title}: ${accessibilityValueText}${change ? `, variation: ${change} (${trendLabel || trendConfig.defaultLabel})` : ""}${description ? `, ${description}` : ""}`;

  if (loading) {
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement de l'indicateur ${title}`}
      >
        <Card.Header style={styles.header}>
          <Skeleton width="50%" height={16} borderRadius={4} />
          {icon && <Skeleton width={24} height={24} borderRadius={12} />}
        </Card.Header>
        <Card.Content style={styles.content}>
          <Skeleton width="75%" height={36} borderRadius={6} style={styles.valueSkeleton} />
          <View style={styles.footerRow}>
            <Skeleton width="30%" height={22} borderRadius={11} />
            <Skeleton width="40%" height={14} borderRadius={4} />
          </View>
        </Card.Content>
      </Card>
    );
  }

  const content = (
    <Card
      variant={variant}
      onPress={onPress}
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole={onPress ? "button" : "summary"}
      accessibilityLabel={fullA11yLabel}
    >
      <Card.Header style={styles.header}>
        <ThemedText variant="sm" color="mutedForeground" weight="medium" numberOfLines={1}>
          {title}
        </ThemedText>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </Card.Header>

      <Card.Content style={styles.content}>
        <ThemedText variant="3xl" weight="bold" color="foreground" numberOfLines={1}>
          {value}
        </ThemedText>

        {(change || description) && (
          <View style={styles.footerRow}>
            {change && (
              <Badge
                variant={trendConfig.badgeVariant}
                size="sm"
                icon={
                  <Ionicons
                    name={trendConfig.icon}
                    size={12}
                    color={trendConfig.color}
                    style={styles.trendIcon}
                  />
                }
              >
                {change}
              </Badge>
            )}

            {description && (
              <ThemedText
                variant="xs"
                color="mutedForeground"
                numberOfLines={1}
                style={styles.descriptionText}
              >
                {description}
              </ThemedText>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return content;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 8,
  },
  valueSkeleton: {
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  trendIcon: {
    marginRight: 2,
  },
  descriptionText: {
    flexShrink: 1,
  },
});

export default MetricWidget;
