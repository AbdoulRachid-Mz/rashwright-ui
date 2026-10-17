// @/components/templates/finance/components/balance-card.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import type { WalletData } from "../types";

export interface BalanceCardProps {
  wallet: WalletData;
}

export function BalanceCard({ wallet }: BalanceCardProps) {
  const { theme } = useTheme();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <Card variant="glass" style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.colors.mutedForeground }]}>Solde disponible</Text>
        <TouchableOpacity
          onPress={() => setShowBalance(!showBalance)}
          accessibilityLabel={showBalance ? "Masquer le solde" : "Afficher le solde"}
        >
          <Badge variant="outline" style={styles.visibilityBadge}>
            {showBalance ? "👁 Masquer" : "👁 Afficher"}
          </Badge>
        </TouchableOpacity>
      </View>

      <Text style={[styles.balanceText, { color: theme.colors.foreground }]}>
        {showBalance ? wallet.totalBalanceFormatted : "•••••••• €"}
      </Text>

      <View style={[styles.footerRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Revenus ce mois</Text>
          <Text style={[styles.incomeVal, { color: "#10B981" }]}>{wallet.monthlyIncome}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>Dépenses</Text>
          <Text style={[styles.expenseVal, { color: theme.colors.destructive }]}>{wallet.monthlyExpense}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  visibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statCol: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  incomeVal: {
    fontSize: 15,
    fontWeight: "700",
  },
  expenseVal: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default BalanceCard;
