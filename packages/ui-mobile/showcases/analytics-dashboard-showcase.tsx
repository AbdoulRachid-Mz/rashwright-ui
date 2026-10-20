// @/showcases/analytics-dashboard-showcase.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "@/components/ui/text";
import RashwrightLogo from "@/components/ui/rashwright-logo";
import { MetricWidget } from "@/widgets/metric";
import { ChartWidget } from "@/widgets/chart";
import { ProgressWidget } from "@/widgets/progress";
import { ActivityFeedWidget } from "@/widgets/activity-feed";

export interface AnalyticsDashboardShowcaseProps {
  onBack?: () => void;
}

export const AnalyticsDashboardShowcase: React.FC<AnalyticsDashboardShowcaseProps> = () => {
  const { theme } = useTheme();

  const analyticsData = [
    { label: "Jan", value: 1200 },
    { label: "Fév", value: 1900 },
    { label: "Mar", value: 1650 },
    { label: "Avr", value: 2400 },
    { label: "Mai", value: 2850 },
    { label: "Juin", value: 3600 },
  ];

  const systemFeed = [
    {
      id: "ev-1",
      title: "Déploiement v1.6.0 terminé",
      description: "Moteur de widgets validé",
      timestamp: "Il y a 2 min",
      icon: "cloud-done",
      status: "completed" as const,
      statusLabel: "Succès",
    },
    {
      id: "ev-2",
      title: "Pic de charge serveur API",
      description: "Trafic +140% absorbé",
      timestamp: "Il y a 45 min",
      icon: "pulse",
      status: "info" as const,
      statusLabel: "Info",
    },
    {
      id: "ev-3",
      title: "Sauvegarde base de données",
      description: "Snapshot automatique cloud",
      timestamp: "Hier, 03:00",
      icon: "server",
      status: "completed" as const,
      statusLabel: "Succès",
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête */}
      <View style={styles.headerRow}>
        <View>
          <ThemedText variant="xs" color="mutedForeground" weight="medium">
            APPLICATION ANALYTICS
          </ThemedText>
          <ThemedText variant="2xl" weight="bold" color="foreground">
            Vue d'ensemble
          </ThemedText>
        </View>
        <RashwrightLogo size={42} />
      </View>

      {/* 1. Ligne de KPI analytiques */}
      <View style={styles.metricsRow}>
        <MetricWidget
          title="Sessions actives"
          value="14 250"
          change="+18.4%"
          trend="up"
          icon={<Ionicons name="flash" size={16} color="#10B981" />}
          variant="glass"
          style={styles.halfCol}
        />
        <MetricWidget
          title="Temps moyen"
          value="4m 32s"
          change="+12s"
          trend="up"
          icon={<Ionicons name="time" size={16} color="#3B82F6" />}
          variant="glass"
          style={styles.halfCol}
        />
      </View>

      {/* 2. Graphique de croissance semestrielle */}
      <ChartWidget
        title="Croissance des utilisateurs"
        subtitle="Premier semestre 2026"
        data={analyticsData}
        unit=" users"
        type="bar"
        variant="glass"
      />

      {/* 3. Objectif de rétention */}
      <ProgressWidget
        title="Objectif Rétention J+30"
        current={68}
        target={80}
        unit="%"
        description="Objectif trimestriel fixé à 80%"
        icon={<Ionicons name="analytics" size={18} color="#8B5CF6" />}
        variant="glass"
      />

      {/* 4. Journal d'événements et alertes */}
      <ActivityFeedWidget
        title="Journal des événements système"
        items={systemFeed}
        maxItems={3}
        variant="glass"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
});

export default AnalyticsDashboardShowcase;
