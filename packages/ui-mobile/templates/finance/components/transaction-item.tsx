// @/components/templates/finance/components/transaction-item.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import type { Transaction } from "../types";

export interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (id: string) => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const { theme } = useTheme();
  const isIncome = transaction.type === "income";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(transaction.id)}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.title}, montant ${transaction.amountFormatted}`}
    >
      <Card variant="default" style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: isIncome ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)" }]}>
          <Text style={styles.icon}>{transaction.icon || (isIncome ? "↓" : "↑")}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>{transaction.title}</Text>
          <Text style={[styles.category, { color: theme.colors.mutedForeground }]}>
            {transaction.category} • {transaction.date}
          </Text>
        </View>

        <Text
          style={[
            styles.amount,
            { color: isIncome ? "#10B981" : theme.colors.foreground },
          ]}
        >
          {transaction.amountFormatted}
        </Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginVertical: 4,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  category: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default TransactionItem;
