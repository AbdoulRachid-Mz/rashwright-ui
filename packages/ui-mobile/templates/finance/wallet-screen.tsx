// @/components/templates/finance/wallet-screen.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { BalanceCard } from "./components/balance-card";
import { TransactionItem } from "./components/transaction-item";
import type { FinanceTemplateProps, WalletData, Transaction } from "./types";

const DEMO_WALLET: WalletData = {
  totalBalance: 14850.75,
  totalBalanceFormatted: "14 850,75 €",
  currency: "EUR",
  accountNumber: "FR76 •••• •••• 4821",
  monthlyIncome: "+ 3 200,00 €",
  monthlyExpense: "- 1 140,25 €",
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    title: "Virement Salaire Tech Corp",
    category: "Revenus",
    amount: 3200,
    amountFormatted: "+ 3 200,00 €",
    date: "Aujourd'hui, 09:30",
    icon: "💼",
    type: "income",
  },
  {
    id: "tx-2",
    title: "Abonnement Claude Pro",
    category: "Services",
    amount: -21.6,
    amountFormatted: "- 21,60 €",
    date: "Hier, 14:15",
    icon: "🤖",
    type: "expense",
  },
  {
    id: "tx-3",
    title: "Supermarché Bio Nature",
    category: "Alimentation",
    amount: -78.4,
    amountFormatted: "- 78,40 €",
    date: "14 Octobre",
    icon: "🛒",
    type: "expense",
  },
];

export function WalletScreen({
  wallet = DEMO_WALLET,
  transactions = DEMO_TRANSACTIONS,
  onSendMoney,
  onRequestMoney,
  onTopUp,
  onViewAllTransactions,
  onSelectTransaction,
}: FinanceTemplateProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={[styles.headerSub, { color: theme.colors.mutedForeground }]}>{wallet.accountNumber}</Text>
          <Text style={[styles.headerTitle, { color: theme.colors.foreground }]}>Mon Portefeuille</Text>
        </View>

        {/* Carte de Solde */}
        <BalanceCard wallet={wallet} />

        {/* Raccourcis d'actions rapides */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
            onPress={onSendMoney}
            accessibilityRole="button"
            accessibilityLabel="Envoyer de l'argent"
          >
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>Envoyer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
            onPress={onRequestMoney}
            accessibilityRole="button"
            accessibilityLabel="Demander de l'argent"
          >
            <Text style={styles.actionIcon}>↙</Text>
            <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>Demander</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.card }]}
            onPress={onTopUp}
            accessibilityRole="button"
            accessibilityLabel="Recharger le compte"
          >
            <Text style={styles.actionIcon}>+</Text>
            <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>Recharger</Text>
          </TouchableOpacity>
        </View>

        {/* Dernières transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>Dernières opérations</Text>
          {onViewAllTransactions && (
            <TouchableOpacity onPress={onViewAllTransactions} accessibilityLabel="Voir toutes les transactions">
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} onPress={onSelectTransaction} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionsList: {
    gap: 2,
  },
});

export default WalletScreen;
