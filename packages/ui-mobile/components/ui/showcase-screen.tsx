import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from "react-native";
import { RashwrightLogo } from "./rashwright-logo";
import { useTheme } from "@/contexts/theme-context";
import Button from "./button";
import Card from "./card";
import GlassCard from "./glass-card";
import Badge from "./badge";
import TextInput from "./text-input";

/**
 * Rashwright UI Mobile — Starter Showcase Screen
 * Écran d"accueil interactif démontrant le fonctionnement du système UI.
 */
export function RashwrightShowcaseScreen() {
  const { theme, mode, setMode, themePreset, setThemePreset, isDark, liquidGlassEnabled, setLiquidGlassEnabled } = useTheme();
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "components" | "glass">("overview");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <RashwrightLogo size={90} showText={true} />
          
          <View style={styles.badgeRow}>
            <Badge variant="outline">React Native</Badge>
            <Badge variant="default">Expo SDK 56+</Badge>
            <Badge variant={liquidGlassEnabled ? "success" : "secondary"}>
              {liquidGlassEnabled ? "Glass Active" : "Default Mode"}
            </Badge>
          </View>

          <Text style={[styles.tagline, { color: theme.colors.mutedForeground }]}>
            Système universel de composants React Native distribuables & Liquid Glass.
          </Text>
        </View>

        {/* Mode & Theme Toggles */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            Apparence & Système
          </Text>
          
          <View style={styles.toggleRow}>
            <Button
              size="sm"
              variant={mode === "light" ? "default" : "outline"}
              onPress={() => setMode("light")}
            >
              Light
            </Button>
            <Button
              size="sm"
              variant={mode === "dark" ? "default" : "outline"}
              onPress={() => setMode("dark")}
            >
              Dark
            </Button>
            <Button
              size="sm"
              variant={mode === "system" ? "default" : "outline"}
              onPress={() => setMode("system")}
            >
              System
            </Button>
          </View>

          {/* 6 Theme Presets Selector */}
          <Text style={[styles.subSectionTitle, { color: theme.colors.mutedForeground, marginTop: 12, marginBottom: 8 }]}>
            Presets de couleurs :
          </Text>
          <View style={styles.themeGrid}>
            {(["default", "emerald", "violet", "amber", "rose", "slate"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={themePreset === t ? "default" : "outline"}
                onPress={() => setThemePreset(t)}
                style={{ flex: 1, minWidth: "30%" }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </View>

          <View style={{ marginTop: 12 }}>
            <Button
              size="sm"
              variant={liquidGlassEnabled ? "glass" : "secondary"}
              onPress={() => setLiquidGlassEnabled(!liquidGlassEnabled)}
            >
              {liquidGlassEnabled ? "✨ Glass UI activé" : "Activer Glass UI"}
            </Button>
          </View>
        </Card>

        {/* Glass Card Preview */}
        <View style={{ marginVertical: 8 }}>
          <GlassCard style={styles.glassDemoCard}>
            <Text style={[styles.glassCardTitle, { color: theme.colors.foreground }]}>
              Liquid Glass Material
            </Text>
            <Text style={[styles.glassCardText, { color: theme.colors.mutedForeground }]}>
              Effets de flou dynamique (expo-blur), gradients subtils (expo-linear-gradient) et ombres physiques adaptatives.
            </Text>
            <View style={{ marginTop: 12 }}>
              <Button variant="glass" size="md">
                Bouton Glass
              </Button>
            </View>
          </GlassCard>
        </View>

        {/* Interactive Controls Demo */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>
            Composants UI
          </Text>

          <TextInput
            placeholder="Ex: Rechercher ou saisir du texte..."
            value={inputText}
            onChangeText={setInputText}
            style={{ marginBottom: 12 }}
          />

          <View style={styles.buttonStack}>
            <Button variant="default">Bouton Primaire</Button>
            <Button variant="secondary">Bouton Secondaire</Button>
            <Button variant="destructive">Action Destructive</Button>
          </View>
        </Card>

        {/* Footer info */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
            Initialisé avec <Text style={{ fontWeight: "700", color: theme.colors.primary }}>rs-ui</Text> • Rashwright UI Mobile
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tagline: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
    maxWidth: 320,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  glassDemoCard: {
    padding: 20,
    borderRadius: 20,
  },
  glassCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  glassCardText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonStack: {
    gap: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});

export default RashwrightShowcaseScreen;
