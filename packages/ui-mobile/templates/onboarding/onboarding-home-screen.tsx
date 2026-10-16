// @/components/templates/onboarding/onboarding-home-screen.tsx
/**
 * OnboardingHomeScreen — Écran d'accueil premium d'arrivée après la fin de l'onboarding.
 * Comprend dashboard d'accueil, actions rapides, widgets et raccourcis.
 */

import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";

export interface OnboardingHomeScreenProps {
  onRestartOnboarding?: () => void;
  onExploreComponents?: () => void;
  onOpenSettings?: () => void;
}

export function OnboardingHomeScreen({
  onRestartOnboarding,
  onExploreComponents,
  onOpenSettings,
}: OnboardingHomeScreenProps) {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Badge variant="default" size="sm">
                Connecté
              </Badge>
              <Text style={[styles.greetingSub, { color: theme.colors.mutedForeground }]}>
                Prêt pour le développement
              </Text>
            </View>
            <Text style={[styles.greetingTitle, { color: theme.colors.foreground }]}>
              Bienvenue sur le Hub 👋
            </Text>
          </View>
          <RashwrightLogo size={42} />
        </View>

        {/* Hero Card de statut */}
        <Card variant="glass" style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroIconBox}>
              <Text style={styles.heroEmoji}>✨</Text>
            </View>
            <View style={styles.heroTextBox}>
              <Text style={[styles.heroCardTitle, { color: theme.colors.foreground }]}>
                Onboarding Complété avec Succès
              </Text>
              <Text style={[styles.heroCardDesc, { color: theme.colors.mutedForeground }]}>
                Votre environnement Expo et vos composants Rashwright sont prêts à l'emploi.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section Actions Rapides */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            Actions Rapides
          </Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onExploreComponents}
            style={styles.actionCol}
          >
            <Card variant="glass" style={styles.actionCard}>
              <Text style={styles.actionIcon}>🧩</Text>
              <Text style={[styles.actionCardTitle, { color: theme.colors.foreground }]}>
                Composants UI
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.colors.mutedForeground }]}>
                61 composants prêts
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSettings}
            style={styles.actionCol}
          >
            <Card variant="glass" style={styles.actionCard}>
              <Text style={styles.actionIcon}>🎨</Text>
              <Text style={[styles.actionCardTitle, { color: theme.colors.foreground }]}>
                Thèmes & Styles
              </Text>
              <Text style={[styles.actionCardSub, { color: theme.colors.mutedForeground }]}>
                Liquid Glass & Couleurs
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Section Astuces & Guide */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            Recommandations
          </Text>
        </View>

        <Card variant="outline" style={styles.tipCard}>
          <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
            💡 Astuce CLI
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.foreground }]}>
            Ajoutez de nouveaux composants conditionnels avec{" "}
            <Text style={{ fontWeight: "700" }}>rs-ui add &lt;nom&gt;</Text>. Le ComponentDetector
            installera automatiquement tous les hooks et dépendances requis.
          </Text>
        </Card>

        {/* Bouton pour revoir l'onboarding */}
        {onRestartOnboarding && (
          <View style={styles.restartWrapper}>
            <Button
              variant="outline"
              size="md"
              onPress={onRestartOnboarding}
              style={styles.restartBtn}
            >
              🔄 Rejouer l'onboarding
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 12,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 24,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroEmoji: {
    fontSize: 24,
  },
  heroTextBox: {
    flex: 1,
  },
  heroCardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  heroCardDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCol: {
    flex: 1,
  },
  actionCard: {
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  actionCardSub: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  tipCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  restartWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  restartBtn: {
    minWidth: 200,
  },
});

export default OnboardingHomeScreen;
