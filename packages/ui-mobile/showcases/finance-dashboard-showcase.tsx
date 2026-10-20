// @/showcases/finance-dashboard-showcase.tsx
import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import ThemedText from "@/components/ui/text";
import RashwrightLogo from "@/components/ui/rashwright-logo";
import { FinanceWidget } from "@/widgets/finance";
import { MetricWidget } from "@/widgets/metric";
import { ChartWidget } from "@/widgets/chart";
import { QuickActionsWidget } from "@/widgets/quick-actions";
import { ActivityFeedWidget } from "@/widgets/activity-feed";
import { ProgressWidget } from "@/widgets/progress";

export interface FinanceDashboardShowcaseProps {
  onBack?: () => void;
}

export const FinanceDashboardShowcase: React.FC<FinanceDashboardShowcaseProps> = () => {
  const { theme } = useTheme();

  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const shortcuts = [
    {
      id: "send",
      label: "Envoyer",
      icon: "paper-plane",
      onPress: () => setActiveNotice("Action déclenchée : Envoyer de l'argent"),
    },
    {
      id: "deposit",
      label: "Recharger",
      icon: "wallet",
      onPress: () => setActiveNotice("Action déclenchée : Recharger le compte"),
    },
    {
      id: "scan",
      label: "Scanner",
      icon: "qr-code",
      onPress: () => setActiveNotice("Action déclenchée : Scanner QR Code"),
    },
    {
      id: "more",
      label: "Services",
      icon: "grid",
      onPress: () => setActiveNotice("Action déclenchée : Tous les services"),
    },
  ];

  const chartData = [
    { label: "Lun", value: 45 },
    { label: "Mar", value: 120 },
    { label: "Mer", value: 85 },
    { label: "Jeu", value: 210 },
    { label: "Ven", value: 160 },
    { label: "Sam", value: 340 },
    { label: "Dim", value: 95 },
  ];

  const feedItems = [
    {
      id: "f-1",
      title: "Supermarché Monoprix",
      description: "Courses alimentaires",
      timestamp: "Aujourd'hui, 13:42",
      icon: "cart",
      amount: "- 58,40 €",
      amountType: "negative" as const,
      status: "completed" as const,
    },
    {
      id: "f-2",
      title: "Salaire Entreprise",
      description: "Virement bancaire SEPA",
      timestamp: "Hier, 08:30",
      icon: "briefcase",
      amount: "+ 3 200,00 €",
      amountType: "positive" as const,
      status: "completed" as const,
    },
    {
      id: "f-3",
      title: "Netflix Streaming",
      description: "Abonnement mensuel",
      timestamp: "18 Octobre",
      icon: "film",
      amount: "- 17,99 €",
      amountType: "negative" as const,
      status: "completed" as const,
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <ThemedText variant="xs" color="mutedForeground" weight="medium">
            TABLEAU DE BORD MODULAIRE
          </ThemedText>
          <ThemedText variant="2xl" weight="bold" color="foreground">
            Finance & Wallet
          </ThemedText>
        </View>
        <RashwrightLogo size={42} />
      </View>

      {activeNotice && (
        <View style={[styles.noticeBox, { backgroundColor: theme.colors.card }]}>
          <ThemedText variant="xs" color="primary" weight="medium">
            {activeNotice}
          </ThemedText>
        </View>
      )}

      {/* 1. Bloc Portefeuille Principal */}
      <FinanceWidget
        title="Compte Courant Principal"
        balance={4820.60}
        currency="€"
        income={5100.00}
        expense={1279.40}
        periodLabel="Octobre 2026"
        allowPrivacyMasking
        shortcuts={shortcuts}
        variant="glass"
      />

      {/* 2. Métriques clés côte à côte */}
      <View style={styles.metricsRow}>
        <MetricWidget
          title="Épargne auto"
          value="450 €"
          change="+15%"
          trend="up"
          variant="glass"
          style={styles.halfCol}
        />
        <MetricWidget
          title="Dépenses card"
          value="1 280 €"
          change="-4%"
          trend="down"
          variant="glass"
          style={styles.halfCol}
        />
      </View>

      {/* 3. Objectif de progression */}
      <ProgressWidget
        title="Objectif Vacances d'Hiver"
        current={1650}
        target={2000}
        unit="€"
        description="Reste 350 € avant clôture"
        icon={<Ionicons name="airplane" size={18} color="#3B82F6" />}
        variant="glass"
      />

      {/* 4. Graphique des dépenses hebdomadaires */}
      <ChartWidget
        title="Dépenses de la semaine"
        subtitle="Moyenne : 150 € / jour"
        data={chartData}
        unit="€"
        type="bar"
        variant="glass"
      />

      {/* 5. Activité récente */}
      <ActivityFeedWidget
        title="Dernières transactions"
        items={feedItems}
        maxItems={3}
        onViewAll={() => setActiveNotice("Action : Afficher l'historique complet")}
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
  noticeBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfCol: {
    flex: 1,
  },
});

export default FinanceDashboardShowcase;
