/**
 * installation-transaction.ts — Transaction locale d'installation.
 *
 * Le CLI écrit dans plusieurs familles de fichiers : composants, fondations,
 * assets, skills, routes, `rashwright-ui.json`, `rashwright-ui.lock` et
 * `tsconfig.json`. Une erreur au milieu de ces écritures ne doit jamais laisser
 * le projet dans un état « à moitié installé » présenté comme un succès.
 *
 * Cette transaction :
 *   - prend un instantané de chaque destination AVANT la première écriture ;
 *   - restaure les fichiers préexistants et supprime les fichiers créés en cas
 *     d'échec (`rollback`) ;
 *   - ne prétend pas annuler les opérations npm/Expo : elles sont enregistrées
 *     et listées explicitement dans le rapport de rollback.
 *
 * Limite assumée : `node_modules`, `package.json` et les lockfiles du package
 * manager sont modifiés par npm/Expo. Le rollback ne les restaure pas, car un
 * `package.json` restauré sans `node_modules` cohérent produirait un état
 * encore plus trompeur. Ces opérations sont signalées comme non annulées.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

export type ExternalOperationKind = "npm" | "expo";

export interface ExternalOperation {
  kind: ExternalOperationKind;
  packages: string[];
}

export interface RollbackEntry {
  path: string;
  action: "restored" | "removed" | "failed";
  reason?: string;
}

export interface RollbackReport {
  success: boolean;
  entries: RollbackEntry[];
  /** Opérations externes réellement effectuées et non annulées. */
  externalOperations: ExternalOperation[];
}

interface Snapshot {
  existed: boolean;
  content?: Buffer;
}

export class InstallationTransaction {
  private readonly snapshots = new Map<string, Snapshot>();
  private readonly externals: ExternalOperation[] = [];

  /** Nombre de destinations suivies (utile pour les diagnostics). */
  get trackedCount(): number {
    return this.snapshots.size;
  }

  get externalOperations(): readonly ExternalOperation[] {
    return this.externals;
  }

  /**
   * Enregistre l'état actuel d'un fichier avant toute écriture.
   *
   * Idempotent : le premier instantané gagne, les appels suivants sont ignorés.
   * Un dossier existant à la place d'un fichier est une anomalie explicite.
   */
  track(path: string): void {
    const absolute = resolve(path);
    if (this.snapshots.has(absolute)) return;

    if (!existsSync(absolute)) {
      this.snapshots.set(absolute, { existed: false });
      return;
    }

    const stat = statSync(absolute);
    if (!stat.isFile()) {
      throw new Error(
        `Transaction d'installation : '${absolute}' existe mais n'est pas un fichier.`,
      );
    }

    this.snapshots.set(absolute, {
      existed: true,
      content: readFileSync(absolute),
    });
  }

  trackAll(paths: Iterable<string>): void {
    for (const path of paths) this.track(path);
  }

  /** Enregistre une opération externe non réversible. */
  recordExternal(operation: ExternalOperation): void {
    const packages = [...operation.packages];
    if (packages.length === 0) return;
    const existing = this.externals.find(
      (item) =>
        item.kind === operation.kind &&
        item.packages.length === packages.length &&
        item.packages.every((pkg, index) => pkg === packages[index]),
    );
    if (!existing) this.externals.push({ kind: operation.kind, packages });
  }

  /**
   * Restaure toutes les destinations suivies, dans l'ordre inverse.
   *
   * Ne lève jamais : chaque anomalie est rapportée. Un échec de rollback reste
   * visible et doit empêcher l'affichage d'un succès.
   */
  rollback(): RollbackReport {
    const entries: RollbackEntry[] = [];
    const snapshots = [...this.snapshots.entries()].reverse();

    for (const [path, snapshot] of snapshots) {
      try {
        if (snapshot.existed) {
          if (snapshot.content === undefined) {
            throw new Error("instantané sans contenu");
          }
          const unchanged =
            existsSync(path) && readFileSync(path).equals(snapshot.content);
          if (unchanged) continue;

          mkdirSync(dirname(path), { recursive: true });
          writeFileSync(path, snapshot.content);
          entries.push({ path, action: "restored" });
        } else {
          if (!existsSync(path)) continue;
          rmSync(path, { force: true });
          entries.push({ path, action: "removed" });
        }
      } catch (error) {
        entries.push({
          path,
          action: "failed",
          reason: (error as Error).message,
        });
      }
    }

    return {
      success: entries.every((entry) => entry.action !== "failed"),
      entries,
      externalOperations: [...this.externals],
    };
  }
}
