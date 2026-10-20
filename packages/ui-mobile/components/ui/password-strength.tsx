// @/components/ui/password-strength.tsx
import React, { useMemo, useEffect } from "react";
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/theme-context";
import { createGlassTheme } from "@/constants/glass-theme";
import ThemedText from "./text";

export type PasswordStrengthLevel = "very-weak" | "weak" | "medium" | "strong" | "very-strong";

export interface PasswordRequirementRule {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 à 4
  level: PasswordStrengthLevel;
  levelLabel: string;
  requirements: PasswordRequirementRule[];
  isValid: boolean;
}

export interface PasswordStrengthProps {
  /** Valeur du mot de passe évalué (calcul local, sans log ni envoi réseau) */
  password?: string;
  /** Longueur minimale requise (défaut : 8) */
  minLength?: number;
  /** Exige au moins une majuscule (défaut : true) */
  requireUppercase?: boolean;
  /** Exige au moins une minuscule (défaut : true) */
  requireLowercase?: boolean;
  /** Exige au moins un chiffre (défaut : true) */
  requireNumber?: boolean;
  /** Exige au moins un caractère spécial (défaut : true) */
  requireSpecialChar?: boolean;
  /** Règles personnalisées additionnelles */
  customRules?: Array<{
    id: string;
    label: string;
    validator: (password: string) => boolean;
  }>;
  /** Affiche la liste des exigences (défaut : true) */
  showRequirements?: boolean;
  /** Affiche le libellé textuel du niveau (défaut : true) */
  showLevelLabel?: boolean;
  /** Libellés personnalisés pour les 5 niveaux */
  levelLabels?: {
    "very-weak"?: string;
    weak?: string;
    medium?: string;
    strong?: string;
    "very-strong"?: string;
  };
  /** Callback déclenché à chaque mise à jour du score */
  onScoreChange?: (result: PasswordStrengthResult) => void;
  /** Style du conteneur */
  style?: StyleProp<ViewStyle>;
  /** Classe NativeWind optionnelle */
  className?: string;
}

const COMMON_PATTERNS = [
  /^[a-zA-Z]+$/, // lettres seules
  /^[0-9]+$/, // chiffres seuls
  /(.)\1{2,}/, // répétition de 3 caractères identiques consécutifs (ex: aaa)
  /1234|2345|3456|4567|5678|6789|0123/, // suites numériques simples
  /azerty|qwerty|password|motdepasse|admin|123456/i, // mots de passe courants
];

export const evaluatePasswordStrength = (
  password = "",
  options: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    customRules?: Array<{
      id: string;
      label: string;
      validator: (password: string) => boolean;
    }>;
  }
): PasswordStrengthResult => {
  const reqs: PasswordRequirementRule[] = [];

  // Exigence : Longueur minimale
  const lengthMet = password.length >= options.minLength;
  reqs.push({
    id: "min-length",
    label: `Au moins ${options.minLength} caractères`,
    met: lengthMet,
  });

  // Exigence : Majuscule
  if (options.requireUppercase) {
    reqs.push({
      id: "uppercase",
      label: "Au moins une lettre majuscule (A-Z)",
      met: /[A-Z]/.test(password),
    });
  }

  // Exigence : Minuscule
  if (options.requireLowercase) {
    reqs.push({
      id: "lowercase",
      label: "Au moins une lettre minuscule (a-z)",
      met: /[a-z]/.test(password),
    });
  }

  // Exigence : Chiffre
  if (options.requireNumber) {
    reqs.push({
      id: "number",
      label: "Au moins un chiffre (0-9)",
      met: /[0-9]/.test(password),
    });
  }

  // Exigence : Symbole
  if (options.requireSpecialChar) {
    reqs.push({
      id: "special-char",
      label: "Au moins un symbole (!@#$%...)",
      met: /[^A-Za-z0-9]/.test(password),
    });
  }

  // Règles personnalisées
  if (options.customRules) {
    for (const rule of options.customRules) {
      reqs.push({
        id: rule.id,
        label: rule.label,
        met: rule.validator(password),
      });
    }
  }

  // Calcul du score basé sur la complexité et l'entropie
  if (!password) {
    return {
      score: 0,
      level: "very-weak",
      levelLabel: "Très faible",
      requirements: reqs,
      isValid: false,
    };
  }

  let complexityPoints = 0;
  if (password.length >= options.minLength) complexityPoints += 1;
  if (password.length >= options.minLength + 4) complexityPoints += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) complexityPoints += 1;
  if (/[0-9]/.test(password)) complexityPoints += 1;
  if (/[^A-Za-z0-9]/.test(password)) complexityPoints += 1;

  // Pénalités de motifs répétitifs ou triviaux
  let penalties = 0;
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(password)) {
      penalties += 1;
      break;
    }
  }

  const rawScore = Math.max(0, complexityPoints - penalties);
  let score = 0;
  if (rawScore <= 1) score = 1;
  else if (rawScore === 2) score = 2;
  else if (rawScore === 3 || rawScore === 4) score = 3;
  else if (rawScore >= 5) score = 4;

  if (password.length < 4) score = 0;

  const levels: PasswordStrengthLevel[] = [
    "very-weak",
    "weak",
    "medium",
    "strong",
    "very-strong",
  ];
  const level = levels[score] ?? "very-weak";

  const allMet = reqs.every((r) => r.met);

  return {
    score,
    level,
    levelLabel:
      score === 4
        ? "Très fort"
        : score === 3
        ? "Fort"
        : score === 2
        ? "Moyen"
        : score === 1
        ? "Faible"
        : "Très faible",
    requirements: reqs,
    isValid: allMet,
  };
};

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password = "",
  minLength = 8,
  requireUppercase = true,
  requireLowercase = true,
  requireNumber = true,
  requireSpecialChar = true,
  customRules,
  showRequirements = true,
  showLevelLabel = true,
  levelLabels,
  onScoreChange,
  style,
  className,
}) => {
  const { theme, isDark } = useTheme();

  const result = useMemo(() => {
    return evaluatePasswordStrength(password, {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumber,
      requireSpecialChar,
      customRules,
    });
  }, [
    password,
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumber,
    requireSpecialChar,
    customRules,
  ]);

  useEffect(() => {
    onScoreChange?.(result);
  }, [result, onScoreChange]);

  const levelColor = useMemo(() => {
    switch (result.level) {
      case "very-strong":
        return "#10B981"; // Emerald / Green
      case "strong":
        return theme.colors.primary; // Bleu / Teinte thématique
      case "medium":
        return "#F59E0B"; // Amber
      case "weak":
        return "#F97316"; // Orange
      case "very-weak":
      default:
        return theme.colors.destructive; // Rouge
    }
  }, [result.level, theme]);

  const resolvedLabel = levelLabels?.[result.level] ?? result.levelLabel;

  return (
    <View className={className} style={[styles.container, style]}>
      {/* Barre de progression segmentée (4 crans) */}
      <View
        style={styles.meterRow}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 4, now: result.score }}
        accessibilityLabel={`Robustesse du mot de passe : ${resolvedLabel}`}
      >
        {[1, 2, 3, 4].map((step) => {
          const isFilled = result.score >= step;
          return (
            <View
              key={step}
              style={[
                styles.segment,
                {
                  backgroundColor: isFilled
                    ? levelColor
                    : isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)",
                },
              ]}
            />
          );
        })}
      </View>

      {/* Label du niveau */}
      {showLevelLabel && (
        <View style={styles.headerRow}>
          <Text style={[styles.levelText, { color: levelColor }]}>
            {resolvedLabel}
          </Text>
        </View>
      )}

      {/* Liste des exigences */}
      {showRequirements && (
        <View style={styles.requirementsList}>
          {result.requirements.map((req) => (
            <View key={req.id} style={styles.requirementRow}>
              <Ionicons
                name={req.met ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={req.met ? "#10B981" : theme.colors.mutedForeground}
              />
              <Text
                style={[
                  styles.requirementLabel,
                  {
                    color: req.met
                      ? theme.colors.foreground
                      : theme.colors.mutedForeground,
                  },
                ]}
              >
                {req.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PasswordStrength;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  meterRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelText: {
    fontSize: 13,
    fontWeight: "600",
  },
  requirementsList: {
    gap: 6,
    marginTop: 4,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementLabel: {
    fontSize: 12,
  },
});
