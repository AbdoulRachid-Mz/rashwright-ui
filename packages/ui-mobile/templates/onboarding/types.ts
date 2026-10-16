// @/components/templates/onboarding/types.ts

export interface OnboardingStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlightLabel?: string;
  highlightValue?: string;
  icon?: string;
}

export interface OnboardingHomeScreenProps {
  onRestartOnboarding?: () => void;
  onExploreComponents?: () => void;
  onOpenSettings?: () => void;
}

export interface OnboardingTemplateProps {
  steps?: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  redirectToHomeOnComplete?: boolean;
}
