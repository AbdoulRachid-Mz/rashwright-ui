// @/components/templates/onboarding/components/onboarding-slide.tsx

import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/contexts/theme-context";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import StatCard from "@/components/ui/stat-card";
import type { OnboardingStep } from "../types";

export interface OnboardingSlideProps {
  step: OnboardingStep;
}

export function OnboardingSlide({ step }: OnboardingSlideProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Badge variant="default" style={styles.badge}>
        {step.badge}
      </Badge>

      <Text style={[styles.title, { color: theme.colors.foreground }]}>
        {step.title}
      </Text>

      <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
        {step.description}
      </Text>

      {step.highlightLabel && step.highlightValue && (
        <Card style={styles.card}>
          <StatCard
            label={step.highlightLabel}
            value={step.highlightValue}
            trend={{ value: 100, isPositive: true }}
            variant="glass"
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 16, width: "100%", paddingHorizontal: 12 },
  badge: { marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", lineHeight: 32 },
  description: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  card: { width: "100%", marginTop: 12, padding: 8, borderRadius: 18 },
});
