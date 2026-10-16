// @/components/templates/onboarding/onboarding-template.tsx

import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { RashwrightLogo } from "@/components/ui/rashwright-logo";
import Button from "@/components/ui/button";
import { OnboardingSlide } from "./components/onboarding-slide";
import { OnboardingHomeScreen } from "./onboarding-home-screen";
import type { OnboardingStep, OnboardingTemplateProps } from "./types";

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: "step-1",
    badge: "Écosystème UI",
    title: "Composants React Native Universels",
    description: "61 composants ultra-rapides, typés à 100% en TypeScript strict et prêts pour vos applications mobiles.",
    highlightLabel: "Composants Disponibles",
    highlightValue: "61+",
    icon: "⚡",
  },
  {
    id: "step-2",
    badge: "Liquid Glass",
    title: "Design Visuel Avancé",
    description: "Sublimez vos écrans avec les reflets physiques, flous dynamiques et effets tactiles du moteur Liquid Glass.",
    highlightLabel: "Effet d'immersion",
    highlightValue: "Natif iOS & Android",
    icon: "💎",
  },
  {
    id: "step-3",
    badge: "Productivité",
    title: "Contrôle Total du Code",
    description: "Inspiré de shadcn : aucun node_modules opaque. Chaque composant vous appartient dans votre projet.",
    highlightLabel: "Prise en main",
    highlightValue: "Immédiate",
    icon: "🚀",
  },
];

export function OnboardingTemplate({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip,
  redirectToHomeOnComplete = true,
}: OnboardingTemplateProps) {
  const { theme, isDark } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeStep = steps[currentStepIndex] || steps[0];
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (redirectToHomeOnComplete) {
        setIsCompleted(true);
      }
      onComplete?.();
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
    if (redirectToHomeOnComplete) {
      setIsCompleted(true);
    }
    onSkip?.();
    onComplete?.();
  };

  // Si l'utilisateur a terminé ou passé l'onboarding, on affiche le HomeScreen premium
  if (isCompleted) {
    return (
      <OnboardingHomeScreen
        onRestartOnboarding={() => {
          setIsCompleted(false);
          setCurrentStepIndex(0);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Bar : Logo & Passer */}
      <View style={styles.topBar}>
        <RashwrightLogo size={36} />
        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.colors.mutedForeground }]}>
            Passer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Slide Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.slideWrapper}>
          <OnboardingSlide step={activeStep} />
        </View>
      </ScrollView>

      {/* Bottom Controls : Pagination & Navigation Buttons */}
      <View style={styles.bottomBar}>
        {/* Indicateurs de pagination animés */}
        <View style={styles.dotsRow}>
          {steps.map((s, index) => {
            const isActive = index === currentStepIndex;
            return (
              <View
                key={s.id}
                style={[
                  styles.dot,
                  {
                    backgroundColor: isActive
                      ? theme.colors.primary
                      : isDark
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.15)",
                    width: isActive ? 28 : 8,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Boutons Suivant / Précédent */}
        <View style={styles.actionsRow}>
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              size="lg"
              onPress={handleBack}
              style={styles.backBtn}
            >
              Retour
            </Button>
          )}

          <Button
            variant="default"
            size="lg"
            onPress={handleNext}
            style={styles.nextBtn}
          >
            {isLast ? "Commencer l'expérience" : "Continuer"}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  slideWrapper: {
    width: "100%",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

export default OnboardingTemplate;
