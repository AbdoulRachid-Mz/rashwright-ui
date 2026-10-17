/**
 * validate-maestro-flows.ts
 *
 * Valide la structure et la syntaxe des flux de tests end-to-end Maestro (.yaml).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MAESTRO_DIR = join(import.meta.dirname, "..", "e2e", "maestro");

const REQUIRED_FLOWS = [
  "app-launch.yaml",
  "auth-flow.yaml",
  "commerce-flow.yaml",
  "theme-switch.yaml",
  "chat-flow.yaml",
  "finance-flow.yaml",
];

function main() {
  console.log("Valideur Maestro E2E — Rashwright UI Mobile");
  console.log(`Répertoire cible : ${MAESTRO_DIR}\n`);

  if (!existsSync(MAESTRO_DIR)) {
    console.error(`❌ Erreur : Répertoire Maestro introuvable à ${MAESTRO_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(MAESTRO_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  let errorsCount = 0;

  for (const required of REQUIRED_FLOWS) {
    if (!files.includes(required)) {
      console.error(`❌ Flow manquant : ${required}`);
      errorsCount++;
    }
  }

  for (const file of files) {
    const fullPath = join(MAESTRO_DIR, file);
    const content = readFileSync(fullPath, "utf-8");

    if (!content.includes("appId:")) {
      console.error(`❌ ${file} : Champ 'appId' manquant.`);
      errorsCount++;
    }

    if (!content.includes("launchApp")) {
      console.warn(`⚠ ${file} : Avertissement - 'launchApp' non spécifié.`);
    }

    console.log(`✔ ${file} validé (${content.split(/\r?\n/).length} lignes)`);
  }

  if (errorsCount > 0) {
    console.error(`\n❌ Échec : ${errorsCount} anomalie(s) détectée(s) dans les tests Maestro.`);
    process.exit(1);
  }

  console.log(`\n✅ Tous les ${files.length} flows Maestro sont valides et prêts pour exécution !`);
}

main();
