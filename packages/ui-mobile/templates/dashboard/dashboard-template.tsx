// @/components/templates/dashboard/dashboard-template.tsx

import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Divider from "@/components/ui/divider";
import RashwrightLogo from "@/components/ui/rashwright-logo";
import { useTheme } from "@/contexts/theme-context";
import { StatsOverview } from "./components/stats-overview";
import { ActivityFeed } from "./components/activity-feed";
import type {
  DashboardTemplateProps,
  DashboardMetric,
  ActivityItem,
  DashboardPeriod,
} from "./types";

// ── Demo data (used when no props are provided) ──────────────────────────────

const DEMO_METRICS: Record<DashboardPeriod, DashboardMetric[]> = {
  "7d": [
    {
      id: "revenue",
      label: "Revenus (7j)",
      value: "3 840 €",
      trend: { value: 12.4, isPositive: true },
    },
    {
      id: "users",
      label: "Nouveaux inscrits",
      value: "318",
      trend: { value: 5.2, isPositive: true },
    },
    {
      id: "orders",
      label: "Commandes",
      value: "94",
      trend: { value: 2.1, isPositive: true },
    },
    {
      id: "conversion",
      label: "Conversion",
      value: "5.1 %",
      trend: { value: 0.8, isPositive: true },
    },
  ],
  "30d": [
    {
      id: "revenue",
      label: "Revenus (30j)",
      value: "14 850 €",
      trend: { value: 8.2, isPositive: true },
    },
    {
      id: "users",
      label: "Utilisateurs actifs",
      value: "1 482",
      trend: { value: 4.1, isPositive: true },
    },
    {
      id: "orders",
      label: "Commandes",
      value: "412",
      trend: { value: 1.4, isPositive: false },
    },
    {
      id: "conversion",
      label: "Conversion",
      value: "4.7 %",
      trend: { value: 0.6, isPositive: true },
    },
  ],
  "90d": [
    {
      id: "revenue",
      label: "Revenus (90j)",
      value: "42 900 €",
      trend: { value: 18.5, isPositive: true },
    },
    {
      id: "users",
      label: "Utilisateurs",
      value: "3 890",
      trend: { value: 9.3, isPositive: true },
    },
    {
      id: "orders",
      label: "Commandes",
      value: "1 250",
      trend: { value: 7.2, isPositive: true },
    },
    {
      id: "conversion",
      label: "Conversion",
      value: "4.9 %",
      trend: { value: 1.1, isPositive: true },
    },
  ],
  "1y": [
    {
      id: "revenue",
      label: "Revenus (1 an)",
      value: "168 400 €",
      trend: { value: 24.8, isPositive: true },
    },
    {
      id: "users",
      label: "Total Utilisateurs",
      value: "12 400",
      trend: { value: 15.6, isPositive: true },
    },
    {
      id: "orders",
      label: "Total Commandes",
      value: "5 120",
      trend: { value: 11.2, isPositive: true },
    },
    {
      id: "conversion",
      label: "Conversion moy.",
      value: "4.8 %",
      trend: { value: 1.4, isPositive: true },
    },
  ],
};

const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    title: "Nouveau paiement reçu",
    subtitle: "Commande #4821 — 89 €",
    time: "Il y a 5 min",
    status: "success",
  },
  {
    id: "a2",
    title: "Stock faible détecté",
    subtitle: "Produit: Casque BT Pro",
    time: "Il y a 18 min",
    status: "warning",
  },
  {
    id: "a3",
    title: "Nouvel utilisateur inscrit",
    subtitle: "alice@exemple.com",
    time: "Il y a 1 h",
    status: "default",
  },
  {
    id: "a4",
    title: "Rapport mensuel généré",
    subtitle: "Septembre 2025 — PDF",
    time: "Il y a 3 h",
    status: "success",
  },
];

const PERIOD_LABELS: { id: DashboardPeriod; label: string }[] = [
  { id: "7d", label: "7 jours" },
  { id: "30d", label: "30 jours" },
  { id: "90d", label: "3 mois" },
  { id: "1y", label: "1 an" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export interface DashboardTemplatePropsWithStyle extends DashboardTemplateProps {
  style?: StyleProp<ViewStyle>;
}

export function DashboardTemplate({
  userName = "Admin",
  userRole = "Administrateur",
  metrics,
  activities = DEMO_ACTIVITIES,
  selectedPeriod: controlledPeriod,
  onPeriodChange,
  onRefresh,
  onViewAllActivities,
  onQuickAction,
  style,
}: DashboardTemplatePropsWithStyle) {
  const { theme } = useTheme();
  const [internalPeriod, setInternalPeriod] = useState<DashboardPeriod>("30d");

  const activePeriod = controlledPeriod ?? internalPeriod;
  const displayedMetrics = metrics ?? DEMO_METRICS[activePeriod];

  const handlePeriodSelect = (period: DashboardPeriod) => {
    setInternalPeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            name={userName}
            size="md"
          />
          <View>
            <Text style={[styles.userName, { color: theme.colors.foreground }]}>
              {userName}
            </Text>
            <Text
              style={[styles.userRole, { color: theme.colors.mutedForeground }]}
            >
              {userRole}
            </Text>
          </View>
        </View>
        <RashwrightLogo size={28} />
      </View>

      <Divider style={styles.divider} />

      {/* Quick Action Chips */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          onPress={() => onQuickAction?.("new-report")}
          style={[styles.quickActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickActionText, { color: theme.colors.foreground }]}>
            📊 Nouveau rapport
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onQuickAction?.("invite-user")}
          style={[styles.quickActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickActionText, { color: theme.colors.foreground }]}>
            👤 Inviter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onQuickAction?.("export-data")}
          style={[styles.quickActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.quickActionText, { color: theme.colors.foreground }]}>
            📥 Exporter
          </Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector Tabs */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
          Vue d'ensemble
        </Text>
        <View style={styles.periodTabs}>
          {PERIOD_LABELS.map((p) => {
            const isSelected = p.id === activePeriod;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => handlePeriodSelect(p.id)}
                activeOpacity={0.7}
              >
                <Badge
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                >
                  {p.label}
                </Badge>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section statistiques */}
      <StatsOverview metrics={displayedMetrics} />

      {/* Section activités */}
      <View style={styles.activitiesHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
          Activité récente
        </Text>
        {onViewAllActivities && (
          <TouchableOpacity onPress={onViewAllActivities} activeOpacity={0.7}>
            <Text
              style={[styles.viewAllLink, { color: theme.colors.primary }]}
            >
              Voir tout
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ActivityFeed activities={activities} />

      {/* Refresh */}
      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onPress={onRefresh}
          style={styles.refreshBtn}
        >
          Actualiser
        </Button>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

export default DashboardTemplate;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  userRole: {
    fontSize: 13,
  },
  divider: {
    marginVertical: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  quickActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 8,
  },
  periodTabs: {
    flexDirection: "row",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  activitiesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: "600",
  },
  refreshBtn: {
    alignSelf: "center",
    marginTop: 8,
  },
  bottomSpacer: {
    height: 16,
  },
});
