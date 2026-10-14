// @/components/templates/dashboard/components/stats-overview.tsx

import React from "react";
import { StyleSheet, View } from "react-native";
import StatCard from "@/components/ui/stat-card";
import type { DashboardMetric } from "../types";

export interface StatsOverviewProps {
  metrics: DashboardMetric[];
}

export function StatsOverview({ metrics }: StatsOverviewProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.cardCol}>
          <StatCard
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            variant="glass"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardCol: {
    flex: 1,
    minWidth: "46%",
  },
});
