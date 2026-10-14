// @/components/templates/onboarding/onboarding-template.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Button from "@/components/ui/button";
import { OnboardingSlide } from "./components/onboarding-slide";
import type { OnboardingStep, OnboardingTemplateProps } from "./types";

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: "step-1",
    badge: "Écosystème UI",
    title: "Composants React Native Universels",
    description: "61 composants ultra-rapides, typés à 100% en TypeScript strict et prêts pour vos applications mobiles.",
    highlightLabel: "Composants Disponibles",
    highlightValue: "61+",
  },
  {
    id: "step-2",
    badge: "Liquid Glass",
    title: "Design Visuel Avancé",
    description: "Sublimez vos écrans avec les reflets physiques, flous dynamiques et effets tactiles du moteur Liquid Glass.",
    highlightLabel: "Effet d'immersion",
    highlightValue: "Natif iOS & Android",
  },
  {
    id: "step-3",
    badge: "Productivité",
    title: "Contrôle Total du Code",
    description: "Inspiré de shadcn : aucun node_modules opaque. Chaque composant vous appartient dans votre projet.",
    highlightLabel: "Prise en main",
    highlightValue: "Immédiate",
  },
];

export function OnboardingTemplate({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip,
}: OnboardingTemplateProps) {
  const { theme, isDark } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const activeStep = steps[currentStepIndex] || steps[0];
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (onComplete) onComplete();
      else console.log("Onboarding completed");
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    else if (onComplete) onComplete();
    else console.log("Onboarding skipped");
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.topNav}>
        <RashwrightLogo size={50} showText={false} isDark={isDark} primaryColor={theme.colors.primary} />
        {!isLast && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: theme.colors.mutedForeground }]}>
              Passer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <OnboardingSlide step={activeStep} />

        <View style={styles.paginationRow}>
          {steps.map((s, index) => {
            const isActive = index === currentStepIndex;
            return (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.muted,
                    width: isActive ? 24 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.actions}>
          <Button
            variant="default"
            size="lg"
            onPress={handleNext}
          >
            {isLast ? "Commencer maintenant" : "Étape suivante"}
          </Button>

          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              size="md"
              onPress={handleBack}
            >
              Précédent
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipText: { fontSize: 14, fontWeight: "600" },
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
    flexGrow: 1,
  },
  paginationRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 24,
    alignItems: "center",
  },
  dot: { height: 8, borderRadius: 4 },
  actions: { width: "100%", gap: 12, marginTop: "auto" },
});

export default OnboardingTemplate;
