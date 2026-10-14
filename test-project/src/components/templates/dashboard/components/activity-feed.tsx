// @/components/templates/dashboard/components/activity-feed.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { useTheme } from "@/contexts/theme-context";
import type { ActivityItem } from "../types";

export interface ActivityFeedProps {
  activities: ActivityItem[];
}

const STATUS_VARIANT: Record<
  ActivityItem["status"],
  "success" | "warning" | "default"
> = {
  success: "success",
  warning: "warning",
  default: "default",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const { theme } = useTheme();

  if (activities.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: theme.colors.mutedForeground }]}>
          Aucune activité récente
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activities.map((item, index) => (
        <Card
          key={item.id}
          variant="glass"
          style={[styles.item, index < activities.length - 1 && styles.itemGap]}
        >
          <View style={styles.row}>
            <View style={styles.info}>
              <Text
                style={[styles.title, { color: theme.colors.foreground }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.colors.mutedForeground }]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            </View>
            <View style={styles.meta}>
              <Badge variant={STATUS_VARIANT[item.status]} size="sm">
                {item.status === "success"
                  ? "Succès"
                  : item.status === "warning"
                    ? "Attention"
                    : "Info"}
              </Badge>
              <Text
                style={[styles.time, { color: theme.colors.mutedForeground }]}
              >
                {item.time}
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemGap: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
  },
  meta: {
    alignItems: "flex-end",
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
