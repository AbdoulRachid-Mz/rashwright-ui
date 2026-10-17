/**
 * merge-manager.ts
 *
 * Moteur de fusion différentielle (3-Way Merge & 2-Way Merge) pour Rashwright UI Mobile.
 * Préserve les modifications locales des utilisateurs lors de l'exécution de `rs-ui update` / `rs-ui upgrade`.
 * En cas de collision conflictuelle directe sur les mêmes lignes, génère des marqueurs de conflit Git standard.
 */

export interface MergeResult {
  merged: string;
  hasConflict: boolean;
  conflictsCount: number;
}

/**
 * Découpe un texte en tableau de lignes.
 */
function toLines(text: string): string[] {
  return text.split(/\r?\n/);
}

/**
 * Calcule la plus longue sous-séquence commune (LCS) entre deux tableaux de lignes.
 */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (a[i] === b[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  return dp;
}

/**
 * 3-Way Merge ligne par ligne :
 * - `base` : Contenu d'origine lors de la dernière installation.
 * - `local` : Contenu actuellement sur le disque (avec potentielles modifications utilisateur).
 * - `remote` : Nouveau contenu venant du registre officiel.
 */
export function merge3Way(
  baseText: string,
  localText: string,
  remoteText: string,
  options: {
    localLabel?: string;
    remoteLabel?: string;
  } = {}
): MergeResult {
  const localLabel = options.localLabel ?? "LOCAL (vos modifications)";
  const remoteLabel = options.remoteLabel ?? "REGISTRY (mise à jour)";

  // Si local et remote sont identiques, aucun conflit
  if (localText === remoteText) {
    return { merged: localText, hasConflict: false, conflictsCount: 0 };
  }

  // Si local n'a pas été modifié par rapport à base, accepter remote directement
  if (localText === baseText) {
    return { merged: remoteText, hasConflict: false, conflictsCount: 0 };
  }

  // Si remote n'a pas changé par rapport à base, garder local
  if (remoteText === baseText) {
    return { merged: localText, hasConflict: false, conflictsCount: 0 };
  }

  const baseLines = toLines(baseText);
  const localLines = toLines(localText);
  const remoteLines = toLines(remoteText);

  const outLines: string[] = [];
  let hasConflict = false;
  let conflictsCount = 0;

  let iBase = 0;
  let iLocal = 0;
  let iRemote = 0;

  while (iBase < baseLines.length || iLocal < localLines.length || iRemote < remoteLines.length) {
    const curBase = iBase < baseLines.length ? baseLines[iBase] : null;
    const curLocal = iLocal < localLines.length ? localLines[iLocal] : null;
    const curRemote = iRemote < remoteLines.length ? remoteLines[iRemote] : null;

    // 1. Les trois sont identiques
    if (curBase === curLocal && curBase === curRemote && curBase !== null) {
      outLines.push(curBase);
      iBase++;
      iLocal++;
      iRemote++;
      continue;
    }

    // 2. Local a changé, remote est resté comme base
    if (curBase === curRemote && curBase !== curLocal) {
      if (curLocal !== null) {
        outLines.push(curLocal);
        iLocal++;
      }
      if (curBase !== null) {
        iBase++;
        iRemote++;
      }
      continue;
    }

    // 3. Remote a changé, local est resté comme base
    if (curBase === curLocal && curBase !== curRemote) {
      if (curRemote !== null) {
        outLines.push(curRemote);
        iRemote++;
      }
      if (curBase !== null) {
        iBase++;
        iLocal++;
      }
      continue;
    }

    // 4. Local et remote ont tous deux changé mais de la même manière
    if (curLocal === curRemote && curLocal !== null) {
      outLines.push(curLocal);
      if (curBase !== null) iBase++;
      iLocal++;
      iRemote++;
      continue;
    }

    // 5. Conflit : changements divergents
    hasConflict = true;
    conflictsCount++;

    const conflictLocal: string[] = [];
    const conflictRemote: string[] = [];

    // Avancer jusqu'au prochain point de synchronisation
    if (curLocal !== null) {
      conflictLocal.push(curLocal);
      iLocal++;
    }
    if (curRemote !== null) {
      conflictRemote.push(curRemote);
      iRemote++;
    }
    if (curBase !== null) {
      iBase++;
    }

    outLines.push(`<<<<<<< ${localLabel}`);
    outLines.push(...conflictLocal);
    outLines.push("=======");
    outLines.push(...conflictRemote);
    outLines.push(`>>>>>>> ${remoteLabel}`);
  }

  return {
    merged: outLines.join("\n"),
    hasConflict,
    conflictsCount,
  };
}

/**
 * 2-Way Merge intelligent (quand la base d'origine n'est pas disponible) :
 * Conserve les lignes identiques et isole les lignes divergentes dans des marqueurs de conflit.
 */
export function merge2Way(
  localText: string,
  remoteText: string,
  options: {
    localLabel?: string;
    remoteLabel?: string;
  } = {}
): MergeResult {
  if (localText === remoteText) {
    return { merged: localText, hasConflict: false, conflictsCount: 0 };
  }

  const localLabel = options.localLabel ?? "LOCAL";
  const remoteLabel = options.remoteLabel ?? "REGISTRY";

  const localLines = toLines(localText);
  const remoteLines = toLines(remoteText);

  const outLines: string[] = [];
  let hasConflict = false;
  let conflictsCount = 0;

  let iLocal = 0;
  let iRemote = 0;

  while (iLocal < localLines.length || iRemote < remoteLines.length) {
    const curLocal = iLocal < localLines.length ? localLines[iLocal] : null;
    const curRemote = iRemote < remoteLines.length ? remoteLines[iRemote] : null;

    if (curLocal === curRemote && curLocal !== null) {
      outLines.push(curLocal);
      iLocal++;
      iRemote++;
      continue;
    }

    // Région divergente
    hasConflict = true;
    conflictsCount++;

    const conflictLocal: string[] = [];
    const conflictRemote: string[] = [];

    if (curLocal !== null) {
      conflictLocal.push(curLocal);
      iLocal++;
    }
    if (curRemote !== null) {
      conflictRemote.push(curRemote);
      iRemote++;
    }

    outLines.push(`<<<<<<< ${localLabel}`);
    outLines.push(...conflictLocal);
    outLines.push("=======");
    outLines.push(...conflictRemote);
    outLines.push(`>>>>>>> ${remoteLabel}`);
  }

  return {
    merged: outLines.join("\n"),
    hasConflict,
    conflictsCount,
  };
}
