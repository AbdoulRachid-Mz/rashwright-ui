// @/components/widgets/finance/finance-widget.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ThemedText from "@/components/ui/text";
import type { FinanceWidgetProps, FinanceActionShortcut } from "./types";

export const FinanceWidget: React.FC<FinanceWidgetProps> = ({
  title = "Solde disponible",
  balance,
  currency = "€",
  income,
  expense,
  periodLabel = "Ce mois",
  allowPrivacyMasking = true,
  defaultMasked = false,
  shortcuts = [],
  loading = false,
  variant = "glass",
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const [isMasked, setIsMasked] = useState(defaultMasked);

  const toggleMask = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }
    setIsMasked((prev) => !prev);
  };

  const handleShortcutPress = async (action: FinanceActionShortcut) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }
    action.onPress();
  };

  const formattedBalance = typeof balance === "number"
    ? `${balance.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
    : `${balance} ${currency}`.trim();

  const displayedBalance = isMasked ? `•••••••• ${currency}` : formattedBalance;

  if (loading) {
    return (
      <Card
        variant={variant}
        style={[styles.card, style]}
        testID={testID ? `${testID}-loading` : undefined}
        accessibilityRole="progressbar"
        accessibilityLabel={`Chargement du portefeuille financier`}
      >
        <Card.Header style={styles.header}>
          <Skeleton width={120} height={16} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={10} />
        </Card.Header>
        <Card.Content style={styles.content}>
          <Skeleton width="65%" height={38} borderRadius={6} style={styles.skeletonSpacing} />
          <View style={styles.incomeExpenseRow}>
            <Skeleton width="48%" height={48} borderRadius={12} />
            <Skeleton width="48%" height={48} borderRadius={12} />
          </View>
          {shortcuts.length > 0 && (
            <View style={styles.shortcutsRow}>
              {shortcuts.map((_, idx) => (
                <Skeleton key={idx} width="30%" height={36} borderRadius={18} />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  }

  const bgSubBox = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)";
  const bgShortcut = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)";

  return (
    <Card
      variant={variant}
      style={[styles.card, style]}
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={`${title}: ${isMasked ? "Solde masqué" : formattedBalance}`}
    >
      <Card.Header style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ThemedText variant="sm" color="mutedForeground" weight="medium">
            {title}
          </ThemedText>
          {allowPrivacyMasking && (
            <TouchableOpacity
              onPress={toggleMask}
              activeOpacity={0.6}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={isMasked ? "Afficher le solde" : "Masquer le solde"}
            >
              <Ionicons
                name={isMasked ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={theme.colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>

        {periodLabel && (
          <Badge variant="secondary" size="sm">
            {periodLabel}
          </Badge>
        )}
      </Card.Header>

      <Card.Content style={styles.content}>
        <ThemedText variant="4xl" weight="bold" color="foreground" numberOfLines={1}>
          {displayedBalance}
        </ThemedText>

        {(income !== undefined || expense !== undefined) && (
          <View style={styles.incomeExpenseRow}>
            {income !== undefined && (
              <View style={[styles.subCard, { backgroundColor: bgSubBox }]}>
                <View style={styles.subCardIconText}>
                  <Ionicons name="arrow-down-circle" size={16} color="#10B981" />
                  <ThemedText variant="xs" color="mutedForeground">
                    Revenus
                  </ThemedText>
                </View>
                <ThemedText variant="sm" weight="bold" style={{ color: "#10B981" }} numberOfLines={1}>
                  {isMasked ? `••••` : typeof income === "number" ? `+ ${income.toLocaleString("fr-FR")} ${currency}` : `${income}`}
                </ThemedText>
              </View>
            )}

            {expense !== undefined && (
              <View style={[styles.subCard, { backgroundColor: bgSubBox }]}>
                <View style={styles.subCardIconText}>
                  <Ionicons name="arrow-up-circle" size={16} color={theme.colors.destructive || "#EF4444"} />
                  <ThemedText variant="xs" color="mutedForeground">
                    Dépenses
                  </ThemedText>
                </View>
                <ThemedText
                  variant="sm"
                  weight="bold"
                  style={{ color: theme.colors.destructive || "#EF4444" }}
                  numberOfLines={1}
                >
                  {isMasked ? `••••` : typeof expense === "number" ? `- ${expense.toLocaleString("fr-FR")} ${currency}` : `${expense}`}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {shortcuts.length > 0 && (
          <View style={styles.shortcutsRow}>
            {shortcuts.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleShortcutPress(action)}
                activeOpacity={0.7}
                style={[styles.shortcutButton, { backgroundColor: bgShortcut }]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Ionicons
                  name={action.icon as keyof typeof Ionicons.glyphMap}
                  size={15}
                  color={theme.colors.primary}
                />
                <ThemedText variant="xs" weight="semibold" color="foreground">
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eyeButton: {
    padding: 4,
  },
  content: {
    gap: 12,
  },
  skeletonSpacing: {
    marginBottom: 8,
  },
  incomeExpenseRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  subCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  subCardIconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  shortcutsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 6,
  },
  shortcutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
});

export default FinanceWidget;
