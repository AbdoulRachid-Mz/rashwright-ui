/**
 * diff.ts — Générateur de diff ligne à ligne sans dépendance externe.
 * Calcule les différences textuelles entre le composant local et la version du registre.
 */

import chalk from "chalk";

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  line: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Calcule le diff ligne par ligne entre deux chaînes de texte via l'algorithme LCS (Plus longue sous-séquence commune).
 */
export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);

  const m = oldLines.length;
  const n = newLines.length;

  // Matrice LCS (optimisée pour les tailles standard de composants UI < 1000 lignes)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Reconstruction arrière du diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        type: "unchanged",
        line: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({
        type: "added",
        line: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.push({
        type: "removed",
        line: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Formate un diff coloré en console, avec regroupement par contexte (style git diff).
 */
export function formatDiffOutput(diff: DiffLine[], contextLines = 3): string {
  const lines: string[] = [];
  const hasChanges = diff.some((d) => d.type !== "unchanged");

  if (!hasChanges) {
    return chalk.dim("  Aucune différence constatée.");
  }

  // Filtrer pour n'afficher que les lignes modifiées et le contexte proche
  const changeIndices = diff
    .map((d, idx) => (d.type !== "unchanged" ? idx : -1))
    .filter((idx) => idx !== -1);

  const keepIndices = new Set<number>();
  for (const idx of changeIndices) {
    for (let c = Math.max(0, idx - contextLines); c <= Math.min(diff.length - 1, idx + contextLines); c++) {
      keepIndices.add(c);
    }
  }

  let inOmission = false;

  for (let idx = 0; idx < diff.length; idx++) {
    if (!keepIndices.has(idx)) {
      if (!inOmission) {
        lines.push(chalk.dim("  ..."));
        inOmission = true;
      }
      continue;
    }

    inOmission = false;
    const item = diff[idx];

    if (item.type === "added") {
      lines.push(chalk.green(`+ ${item.line}`));
    } else if (item.type === "removed") {
      lines.push(chalk.red(`- ${item.line}`));
    } else {
      lines.push(chalk.dim(`  ${item.line}`));
    }
  }

  return lines.join("\n");
}
