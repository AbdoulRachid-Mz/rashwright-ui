/**
 * audit-accessibility.ts
 *
 * Analyseur statique d'accessibilité mobile (a11y) pour composants et écrans TSX React Native.
 * Détecte les absences de labels, les éléments tactiles trop petits et les rôles manquants.
 */

export interface AccessibilityIssue {
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  snippet?: string;
}

export interface AccessibilityAuditResult {
  score: number; // 0 à 100
  passed: boolean;
  totalIssues: number;
  errorsCount: number;
  warningsCount: number;
  issues: AccessibilityIssue[];
}

export function auditAccessibility(sourceCode: string): AccessibilityAuditResult {
  const issues: AccessibilityIssue[] = [];
  const lines = sourceCode.split(/\r?\n/);

  // 1. Détection des Pressables/TouchableOpacity sans accessibilityLabel ni aria-label
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Boutons tactiles sans label
    if (
      (line.includes("<TouchableOpacity") || line.includes("<Pressable") || line.includes("<IconButton")) &&
      !line.includes("accessibilityLabel") &&
      !line.includes("aria-label")
    ) {
      // Regarder si le label est sur les 3 lignes suivantes
      const multiLine = lines.slice(index, Math.min(lines.length, index + 4)).join(" ");
      if (!multiLine.includes("accessibilityLabel") && !multiLine.includes("aria-label")) {
        issues.push({
          rule: "touchable-has-label",
          severity: "warning",
          message: "L'élément interactif doit posséder un 'accessibilityLabel' ou 'aria-label' pour les lecteurs d'écran (TalkBack / VoiceOver).",
          line: lineNum,
          snippet: line.trim(),
        });
      }
    }

    // Images sans accessibilityLabel ni alt
    if (line.includes("<Image") && !line.includes("accessibilityLabel") && !line.includes("alt=")) {
      const multiLine = lines.slice(index, Math.min(lines.length, index + 3)).join(" ");
      if (!multiLine.includes("accessibilityLabel") && !multiLine.includes("alt=")) {
        issues.push({
          rule: "image-has-alt",
          severity: "error",
          message: "Le composant Image ne comporte ni 'accessibilityLabel' ni 'alt'.",
          line: lineNum,
          snippet: line.trim(),
        });
      }
    }

    // Eléments interactifs sans role
    if (
      (line.includes("<TouchableOpacity") || line.includes("<Pressable")) &&
      !line.includes("accessibilityRole") &&
      !line.includes("role=")
    ) {
      const multiLine = lines.slice(index, Math.min(lines.length, index + 4)).join(" ");
      if (!multiLine.includes("accessibilityRole") && !multiLine.includes("role=")) {
        issues.push({
          rule: "interactive-has-role",
          severity: "info",
          message: "Préciser 'accessibilityRole=\"button\"' améliore la navigation vocale sur mobile.",
          line: lineNum,
          snippet: line.trim(),
        });
      }
    }

    // Hauteurs tactiles sous les 44px
    const minHeightMatch = line.match(/height:\s*([0-3][0-9])\b/);
    if (minHeightMatch && (line.includes("btn") || line.includes("button") || line.includes("touchable") || line.includes("pressable"))) {
      issues.push({
        rule: "minimum-touch-target",
        severity: "warning",
        message: `La hauteur tactile de ${minHeightMatch[1]}px est inférieure aux 44px recommandés par les directives Apple & WCAG.`,
        line: lineNum,
        snippet: line.trim(),
      });
    }
  });

  const errorsCount = issues.filter((i) => i.severity === "error").length;
  const warningsCount = issues.filter((i) => i.severity === "warning").length;

  let penalty = errorsCount * 25 + warningsCount * 10;
  if (penalty > 100) penalty = 100;
  const score = Math.max(0, 100 - penalty);

  return {
    score,
    passed: score >= 70 && errorsCount === 0,
    totalIssues: issues.length,
    errorsCount,
    warningsCount,
    issues,
  };
}
