// @/components/templates/minimal/minimal-template.tsx

import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

export interface MinimalTemplateProps {
  title?: string;
  description?: string;
  onExplore?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function MinimalTemplate({
  title = "Bienvenue dans votre application",
  description = "Ce starter minimaliste fournit la structure essentielle configurée avec les composants universels Rashwright UI.",
  onExplore,
  style,
}: MinimalTemplateProps) {
  const { theme, isDark, mode, setMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }, style]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <RashwrightLogo size={80} showText={true} isDark={isDark} primaryColor={theme.colors.primary} />
          <View style={styles.badgeRow}>
            <Badge variant="outline">Minimal Starter</Badge>
            <Badge variant="default">Expo SDK</Badge>
            <Badge variant="success">Prêt</Badge>
          </View>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
            {description}
          </Text>

          <View style={styles.actions}>
            <Button
              variant="default"
              onPress={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              Basculer Thème ({mode})
            </Button>
            <Button
              variant="outline"
              onPress={onExplore || (() => console.log("Explore"))}
            >
              Explorer les composants
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 24, alignItems: "center", justifyContent: "center", minHeight: "100%" },
  hero: { alignItems: "center", marginBottom: 32, gap: 16 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  card: { width: "100%", padding: 24, borderRadius: 20, gap: 16 },
  title: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  description: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  actions: { gap: 12, marginTop: 8 },
});

export default MinimalTemplate;
