// @/components/templates/finance/transactions-screen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { TransactionItem } from "./components/transaction-item";
import type { FinanceTemplateProps, Transaction } from "./types";

const ALL_TRANSACTIONS: Transaction[] = [
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
  {
    id: "tx-4",
    title: "Remboursement Mutuelle Santé",
    category: "Santé",
    amount: 45,
    amountFormatted: "+ 45,00 €",
    date: "12 Octobre",
    icon: "🏥",
    type: "income",
  },
  {
    id: "tx-5",
    title: "Restaurant Le Bistrot",
    category: "Loisirs",
    amount: -34.5,
    amountFormatted: "- 34,50 €",
    date: "11 Octobre",
    icon: "🍽",
    type: "expense",
  },
];

export function TransactionsScreen({ transactions = ALL_TRANSACTIONS, onSelectTransaction, onBack }: FinanceTemplateProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* En-tête */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        {onBack && (
          <Button variant="ghost" size="sm" onPress={onBack} accessibilityLabel="Retour">
            ‹
          </Button>
        )}
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Historique des Opérations</Text>
      </View>

      {/* Filtres de catégorie */}
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setFilter("all")}>
          <Badge variant={filter === "all" ? "default" : "outline"}>Toutes</Badge>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("income")}>
          <Badge variant={filter === "income" ? "default" : "outline"}>Revenus</Badge>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter("expense")}>
          <Badge variant={filter === "expense" ? "default" : "outline"}>Dépenses</Badge>
        </TouchableOpacity>
      </View>

      {/* Liste des transactions */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onPress={onSelectTransaction} />
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

export default TransactionsScreen;
