// @/components/templates/dashboard/dashboard-template.tsx

import React from "react";
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
} from "./types";

// ── Demo data (used when no props are provided) ──────────────────────────────

const DEMO_METRICS: DashboardMetric[] = [
  {
    id: "revenue",
    label: "Revenus",
    value: "12 450 €",
    trend: { value: 8.2, isPositive: true },
  },
  {
    id: "users",
    label: "Utilisateurs",
    value: "1 284",
    trend: { value: 3.1, isPositive: true },
  },
  {
    id: "orders",
    label: "Commandes",
    value: "342",
    trend: { value: 1.4, isPositive: false },
  },
  {
    id: "conversion",
    label: "Conversion",
    value: "4.7 %",
    trend: { value: 0.6, isPositive: true },
  },
];

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

// ── Component ─────────────────────────────────────────────────────────────────

export interface DashboardTemplatePropsWithStyle extends DashboardTemplateProps {
  style?: StyleProp<ViewStyle>;
}

export function DashboardTemplate({
  userName = "Admin",
  userRole = "Administrateur",
  metrics = DEMO_METRICS,
  activities = DEMO_ACTIVITIES,
  onRefresh,
  onViewAllActivities,
  style,
}: DashboardTemplatePropsWithStyle) {
  const { theme } = useTheme();

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
            style={styles.avatar}
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

      {/* Section statistiques */}
      <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
        Vue d'ensemble
      </Text>
      <StatsOverview metrics={metrics} />

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
  avatar: {
    // extra margin if needed
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
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
