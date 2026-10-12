// @/components/templates/onboarding/types.ts

export interface OnboardingStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlightLabel?: string;
  highlightValue?: string;
}

export interface OnboardingTemplateProps {
  steps?: OnboardingStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}
