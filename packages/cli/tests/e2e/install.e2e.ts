/**
 * install.e2e.ts — Scénarios d'installation réels de la Phase 0.
 *
 * Ces tests sont volontairement ROUGES avant les corrections. Ils ne sont pas
 * exécutés par `bun run test` ; utiliser :
 *
 *   bun run test:install-e2e
 *
 * Chaque scénario exécute le vrai CLI dans une fixture temporaire et vérifie
 * le résultat sur disque, indépendamment du lockfile.
 */

import { afterAll, describe, expect, it } from "vitest";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, normalize, relative } from "node:path";

import {
  analyzeImports,
  checkTypeScript,
  cleanupFixtures,
  createFixture,
  diffSnapshots,
  findFixtureFile,
  fixtureExists,
  formatSnapshotDiff,
  formatUnresolvedImports,
  readFixtureJson,
  readPackageManagerCommands,
  runCli,
  runCliAsync,
  snapshotTree,
  UI_MOBILE_ROOT,
  type CliResult,
  type Fixture,
  type ImportAnalysis,
} from "./install-harness.js";

afterAll(() => {
  cleanupFixtures();
});

function report(label: string, fixture: Fixture, result: CliResult, analysis: ImportAnalysis): void {
  const tail = result.output.trim().split(/\r?\n/).slice(-14).join("\n");
  const typecheck = checkTypeScript(fixture.root);
  console.log(`\n[e2e] ${label}`);
  console.log(`[e2e]   cwd: ${fixture.root}`);
  console.log(`[e2e]   args: ${result.args.join(" ")}`);
  console.log(`[e2e]   exit: ${result.status}`);
  console.log(`[e2e]   fichiers analysés: ${analysis.filesChecked}`);
  console.log(`[e2e]   imports non résolus: ${analysis.unresolved.length}`);
  console.log(
    `[e2e]   typescript: ${typecheck.status}${typecheck.reason ? ` (${typecheck.reason})` : ""}`,
  );
  if (typecheck.status === "failed" && typecheck.output) {
    console.log(
      typecheck.output
        .split("\n")
        .slice(0, 20)
        .map((line) => `[e2e]     ${line}`)
        .join("\n"),
    );
  }
  if (analysis.unresolved.length > 0) {
    console.log(
      formatUnresolvedImports(analysis)
        .split("\n")
        .map((line) => `[e2e]   ${line}`)
        .join("\n"),
    );
  }
  if (tail) {
    console.log("[e2e]   sortie CLI (fin):");
    console.log(
      tail
        .split("\n")
        .map((line) => `[e2e]     ${line}`)
        .join("\n"),
    );
  }
}

function expectNoUnresolvedImports(analysis: ImportAnalysis, label: string): void {
  const details = formatUnresolvedImports(analysis);
  expect(details, `${label} — imports non résolus:\n${details}`).toBe("aucun import non résolu");
}

function expectFile(fixture: Fixture, relativePath: string): void {
  expect(
    fixtureExists(fixture, relativePath),
    `Fichier attendu absent: ${relativePath}\n${fixture.root}`,
  ).toBe(true);
}

function packageJson(fixture: Fixture): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } {
  return readFixtureJson(fixture, "package.json");
}

function sha256(content: string): string {
  return `sha256:${createHash("sha256").update(content.replace(/\r\n/g, "\n")).digest("hex")}`;
}

describe("Phase 0 — installations réelles", () => {
  it("add button installe les fondations et ne laisse aucun import non résolu", () => {
    const fixture = createFixture({ name: "button-no-foundations" });
    const result = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    const analysis = analyzeImports(fixture.root);
    report("add button (projet avec src/, sans fondations)", fixture, result, analysis);

    expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
    expectFile(fixture, "src/components/ui/button.tsx");
    expectFile(fixture, "src/contexts/theme-context.tsx");
    expectFile(fixture, "src/constants/theme.ts");
    expectFile(fixture, "src/components/ui/text.tsx");
    expectFile(fixture, "src/components/ui/liquid/liquid-pressable.tsx");

    // Le lockfile doit refléter les destinations réelles : un hook ne doit
    // jamais être verrouillé sous components/ui/hooks.
    const lock = readFixtureJson<{
      foundations?: Record<string, { files: Array<{ path: string }> }>;
    }>(fixture, "rashwright-ui.lock");
    const hookPaths =
      lock.foundations?.responsive?.files.map((file) => file.path) ?? [];
    expect(hookPaths).toContain("src/hooks/use-responsive.ts");
    expect(hookPaths.some((path) => path.includes("components/ui/hooks/"))).toBe(false);

    expectNoUnresolvedImports(analysis, "add button");
  });

  it("add button fonctionne dans un projet existant sans src/", () => {
    const fixture = createFixture({
      name: "button-existing-no-src",
      withSrc: false,
      componentsPath: "components/ui",
      tsconfigPaths: { "@/*": ["*"] },
    });
    const result = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    const analysis = analyzeImports(fixture.root);
    report("add button (projet existant sans src/)", fixture, result, analysis);

    expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
    expectFile(fixture, "components/ui/button.tsx");
    expectFile(fixture, "contexts/theme-context.tsx");
    expectFile(fixture, "constants/theme.ts");
    expectNoUnresolvedImports(analysis, "add button sans src/");
  });

  it("add button respecte des aliases personnalisés (~/*)", () => {
    const fixture = createFixture({
      name: "button-custom-alias",
      componentsPath: "src/components/ui",
      aliases: { components: "~/components", lib: "~/lib", theme: "~/theme" },
      tsconfigPaths: { "~/*": ["src/*"] },
    });
    const result = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    const analysis = analyzeImports(fixture.root);
    report("add button (aliases personnalisés ~/*)", fixture, result, analysis);

    expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
    expectFile(fixture, "src/components/ui/button.tsx");
    expectNoUnresolvedImports(analysis, "add button avec alias ~/*");
  });

  it("add -t minimal installe le template, ses composants, les fondations et safe-area-context", () => {
    const fixture = createFixture({ name: "template-minimal" });
    const result = runCli(fixture, [
      "add",
      "-t",
      "minimal",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysis = analyzeImports(fixture.root);
    report("add -t minimal", fixture, result, analysis);

    expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
    const templatePath = findFixtureFile(fixture, "minimal-template.tsx");
    expect(templatePath, "Le fichier minimal-template.tsx doit être installé").not.toBeNull();
    expectFile(fixture, "src/components/ui/button.tsx");
    expectFile(fixture, "src/components/ui/card.tsx");
    expectFile(fixture, "src/components/ui/badge.tsx");
    expectFile(fixture, "src/components/ui/rashwright-logo.tsx");
    expect(packageJson(fixture).dependencies).toHaveProperty("react-native-safe-area-context");
    expectNoUnresolvedImports(analysis, "add -t minimal");
  });

  it("add -w metric installe le widget, ses composants, les fondations et ses dépendances Expo", () => {
    const fixture = createFixture({ name: "widget-metric" });
    const result = runCli(fixture, [
      "add",
      "-w",
      "metric",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysis = analyzeImports(fixture.root);
    report("add -w metric", fixture, result, analysis);

    expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
    const widgetPath = findFixtureFile(fixture, "metric-widget.tsx");
    expect(widgetPath, "Le fichier metric-widget.tsx doit être installé").not.toBeNull();
    expectFile(fixture, "src/components/ui/card.tsx");
    expectFile(fixture, "src/components/ui/badge.tsx");
    expectFile(fixture, "src/components/ui/skeleton.tsx");
    expect(packageJson(fixture).dependencies).toHaveProperty("@expo/vector-icons");
    expectNoUnresolvedImports(analysis, "add -w metric");

    const commands = readPackageManagerCommands(fixture);
    expect(commands.some((command) => command.commandLine.includes("@expo/vector-icons"))).toBe(true);
  });

  it("add --dry-run ne modifie aucun fichier et n'installe rien", () => {
    const fixture = createFixture({ name: "add-dry-run" });
    const before = snapshotTree(fixture.root);

    const result = runCli(fixture, [
      "add",
      "button",
      "--dry-run",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysis = analyzeImports(fixture.root);
    report("add button --dry-run", fixture, result, analysis);

    const after = snapshotTree(fixture.root);
    const diff = diffSnapshots(before, after);

    expect(result.status, `add --dry-run doit réussir.\n${result.output}`).toBe(0);
    expect(diff.isEmpty, `add --dry-run ne doit rien écrire: ${formatSnapshotDiff(diff)}`).toBe(true);
    expect(result.output).toContain("Simulation terminée (dry-run)");
    expect(result.output).not.toContain("Installation terminée");
    expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);
    expect(fixtureExists(fixture, "src/constants/theme.ts")).toBe(false);
  });

  it("un fichier demandé modifié n'est écrasé qu'avec --force", () => {
    const fixture = createFixture({ name: "component-conflict" });
    const first = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(first.status, `Première installation attendue.\n${first.output}`).toBe(0);

    const buttonPath = join(fixture.root, "src/components/ui/button.tsx");
    const original = readFileSync(buttonPath, "utf-8");
    const marker = "// MODIFICATION LOCALE — ne pas écraser sans --force\n";
    writeFileSync(buttonPath, marker + original, "utf-8");

    // Simule une désynchronisation config/fichier : le composant est demandé
    // mais n'est plus déclaré comme installé.
    const configPath = join(fixture.root, "rashwright-ui.json");
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    delete config.components.button;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");

    const withoutForce = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    const analysisWithoutForce = analyzeImports(fixture.root);
    report("add button (conflit sans --force)", fixture, withoutForce, analysisWithoutForce);

    expect(
      withoutForce.status,
      `Un conflit demandé doit échouer explicitement.\n${withoutForce.output}`,
    ).not.toBe(0);
    expect(readFileSync(buttonPath, "utf-8")).toBe(marker + original);

    const withForce = runCli(fixture, [
      "add",
      "button",
      "--force",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysisWithForce = analyzeImports(fixture.root);
    report("add button (conflit avec --force)", fixture, withForce, analysisWithForce);

    expect(withForce.status, `--force doit réussir.\n${withForce.output}`).toBe(0);
    const restored = readFileSync(buttonPath, "utf-8");
    expect(restored.startsWith(marker)).toBe(false);
    expect(restored).toContain("export type ButtonVariant");
    expectNoUnresolvedImports(analysisWithForce, "add button --force");
  });

  it("une fondation modifiée requiert --repair pour être restaurée", () => {
    const fixture = createFixture({ name: "foundation-repair" });
    const first = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(first.status, `Première installation attendue.\n${first.output}`).toBe(0);

    const textPath = join(fixture.root, "src/components/ui/text.tsx");
    const marker = "// MODIFICATION LOCALE DE FONDATION\n";
    writeFileSync(textPath, marker + readFileSync(textPath, "utf-8"), "utf-8");

    const withoutRepair = runCli(fixture, [
      "add",
      "card",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysisWithoutRepair = analyzeImports(fixture.root);
    report("add card (fondation modifiée, sans --repair)", fixture, withoutRepair, analysisWithoutRepair);

    expect(withoutRepair.status, `Sans --repair, la commande ne doit pas échouer.\n${withoutRepair.output}`).toBe(0);
    expect(withoutRepair.output).toContain("--repair");
    expect(readFileSync(textPath, "utf-8").startsWith(marker)).toBe(true);

    const withRepair = runCli(fixture, [
      "add",
      "card",
      "--repair",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    const analysisWithRepair = analyzeImports(fixture.root);
    report("add card (fondation modifiée, avec --repair)", fixture, withRepair, analysisWithRepair);

    expect(withRepair.status, `--repair doit réussir.\n${withRepair.output}`).toBe(0);
    expect(readFileSync(textPath, "utf-8").startsWith(marker)).toBe(false);
    expectNoUnresolvedImports(analysisWithRepair, "add card --repair");
  });

  it("doctor détecte une installation déclarée mais absente et retourne un code non nul", () => {
    const fixture = createFixture({
      name: "config-desync-missing",
      writeConfig: true,
      config: {
        components: {
          button: { version: "1.0.0", installedAt: new Date().toISOString() },
        },
      },
    });

    const missingFile = "src/components/ui/button.tsx";
    const lockfile = {
      lockfileVersion: 1,
      generatedAt: new Date().toISOString(),
      components: {
        button: {
          version: "1.0.0",
          files: [{ path: missingFile, hash: sha256("export default function Button() { return null; }") }],
          dependencies: [],
          expoDependencies: [],
          installedAt: new Date().toISOString(),
        },
      },
      templates: {},
    };
    writeFileSync(join(fixture.root, "rashwright-ui.lock"), JSON.stringify(lockfile, null, 2) + "\n", "utf-8");

    const result = runCli(fixture, ["doctor", "--json"]);
    const analysis = analyzeImports(fixture.root);
    report("doctor sur composant manquant", fixture, result, analysis);

    expect(result.status, `doctor doit échouer sur un composant manquant.\n${result.output}`).not.toBe(0);

    const jsonStart = result.output.indexOf("[");
    const jsonEnd = result.output.lastIndexOf("]");
    expect(jsonStart, `Sortie JSON attendue.\n${result.output}`).toBeGreaterThanOrEqual(0);
    const checks = JSON.parse(result.output.slice(jsonStart, jsonEnd + 1)) as Array<{
      label: string;
      status: string;
      detail?: string;
    }>;
    const integrity = checks.find((check) => check.label.toLowerCase().includes("intégrité"));
    expect(integrity, `Contrôle d'intégrité attendu.\n${JSON.stringify(checks, null, 2)}`).toBeDefined();
    expect(integrity?.status, "Un fichier manquant doit être une erreur, pas un simple warning").toBe("error");
    expect(integrity?.detail ?? "").toContain("button");
  });

  it("init --dry-run ne modifie aucun fichier", () => {
    const fixture = createFixture({
      name: "init-dry-run",
      writeConfig: false,
      dependencies: {
        "expo-router": "~4.0.0",
        "react-native-safe-area-context": "~4.12.0",
      },
    });

    const before = snapshotTree(fixture.root);
    const result = runCli(fixture, [
      "init",
      "--dry-run",
      "--yes",
      "--pm",
      "npm",
      "--template",
      "minimal",
      "--no-skills",
      "--no-nativewind",
      "--no-showcase",
      "--no-reset",
    ]);
    const after = snapshotTree(fixture.root);
    const diff = diffSnapshots(before, after);
    const analysis = analyzeImports(fixture.root);
    report("init --dry-run", fixture, result, analysis);
    console.log(`[e2e]   modifications: ${formatSnapshotDiff(diff)}`);

    expect(result.status, `init --dry-run doit réussir.\n${result.output}`).toBe(0);
    expect(diff.isEmpty, `init --dry-run ne doit rien écrire: ${formatSnapshotDiff(diff)}`).toBe(true);
    expect(
      diff.addedDirs,
      `init --dry-run ne doit créer aucun dossier (même vide): ${formatSnapshotDiff(diff)}`,
    ).toEqual([]);
    expect(fixtureExists(fixture, "rashwright-ui.json")).toBe(false);
    expect(fixtureExists(fixture, "components/ui")).toBe(false);
  });

  it("registre distant index-only : add button télécharge le manifeste et les fichiers avant résolution", async () => {
    const fixture = createFixture({ name: "remote-index-only" });
    const server = createRemoteRegistryServer();
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const registryUrl = `http://127.0.0.1:${address.port}`;

    try {
      const result = await runCliAsync(fixture, [
        "add",
        "button",
        "--registry",
        registryUrl,
        "--fresh",
        "--yes",
        "--no-skills",
        "--no-interactive",
      ]);
      const analysis = analyzeImports(fixture.root);
      report("add button (registre distant index-only)", fixture, result, analysis);

      expect(result.status, `Le CLI doit réussir.\n${result.output}`).toBe(0);
      expectFile(fixture, "src/components/ui/button.tsx");
      expectFile(fixture, "src/contexts/theme-context.tsx");
      expectNoUnresolvedImports(analysis, "add button via registre distant");
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
  it("registre distant : un fichier déclaré manquant échoue explicitement sans rien installer", async () => {
    const fixture = createFixture({ name: "remote-missing-file" });
    const server = createRemoteRegistryServer({
      missingFiles: ["components/ui/button.tsx"],
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const registryUrl = `http://127.0.0.1:${address.port}`;

    try {
      const result = await runCliAsync(fixture, [
        "add",
        "button",
        "--registry",
        registryUrl,
        "--fresh",
        "--yes",
        "--no-skills",
        "--no-interactive",
      ]);
      report("add button (fichier distant manquant)", fixture, result, analyzeImports(fixture.root));

      expect(result.status, `Un téléchargement incomplet doit échouer.\n${result.output}`).not.toBe(0);
      expect(result.output).toContain("Téléchargement distant incomplet");
      expect(result.output).toContain("components/ui/button.tsx");
      expect(result.output).not.toContain("Installation terminée");
      expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it("registre distant : une matrice SDK absente bloque les dépendances natives critiques", async () => {
    const fixture = createFixture({ name: "remote-missing-matrix" });
    const server = createRemoteRegistryServer({ omitMatrixForSdk: 54 });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const registryUrl = `http://127.0.0.1:${address.port}`;

    try {
      const result = await runCliAsync(fixture, [
        "add",
        "button",
        "--registry",
        registryUrl,
        "--fresh",
        "--yes",
        "--no-skills",
        "--no-interactive",
      ]);
      report("add button (matrice SDK absente)", fixture, result, analyzeImports(fixture.root));

      expect(result.status, `Une matrice absente avec deps natives doit bloquer.\n${result.output}`).not.toBe(0);
      expect(result.output).toContain("Matrice Expo SDK 54 indisponible");
      expect(result.output).toContain("Dépendances natives critiques");
      expect(result.output).not.toContain("Installation terminée");
      expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  it("une vérification post-installation en échec déclenche un rollback local et aucun succès", async () => {
    const fixture = createFixture({ name: "rollback-broken-import" });
    const manifest = {
      name: "broken-import",
      type: "registry:ui",
      version: "1.0.0",
      registryVersion: "1.6.0",
      description: "Composant volontairement cassé pour le test de rollback",
      category: "Test",
      files: ["components/ui/broken-import.tsx"],
      dependencies: [],
      expoDependencies: [],
      optionalExpoDependencies: [],
      requiresComponents: [],
      requiresFoundations: [],
      providers: [],
      supportsGlass: false,
      platforms: ["ios", "android"],
      nativeRebuildRequired: false,
    };

    const server = createRemoteRegistryServer({
      overrides: {
        "registry/components/broken-import.json": JSON.stringify(manifest, null, 2),
        "components/ui/broken-import.tsx": [
          'import { Missing } from "./does-not-exist";',
          "export const BrokenImport = () => Missing;",
          "",
        ].join("\n"),
      },
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const registryUrl = `http://127.0.0.1:${address.port}`;

    const before = snapshotTree(fixture.root);

    try {
      const result = await runCliAsync(fixture, [
        "add",
        "broken-import",
        "--registry",
        registryUrl,
        "--fresh",
        "--yes",
        "--no-skills",
        "--no-interactive",
      ]);
      report("add broken-import (vérification en échec)", fixture, result, analyzeImports(fixture.root));

      expect(
        result.status,
        `Une installation non vérifiable doit échouer.\n${result.output}`,
      ).not.toBe(0);
      expect(result.output).toContain("Vérification post-installation échouée");
      expect(result.output).toContain("Rollback de l'installation locale");
      expect(result.output).toContain("does-not-exist");
      expect(result.output).not.toContain("✔ Installation terminée");

      // Le rollback doit rendre le projet à son état initial : ni fichier
      // cassé, ni lockfile, ni composant marqué installé.
      expect(fixtureExists(fixture, "src/components/ui/broken-import.tsx")).toBe(false);
      expect(fixtureExists(fixture, "rashwright-ui.lock")).toBe(false);

      const config = readFixtureJson<{ components?: Record<string, unknown> }>(
        fixture,
        "rashwright-ui.json",
      );
      expect(config.components ?? {}).not.toHaveProperty("broken-import");

      const after = snapshotTree(fixture.root);
      const diff = diffSnapshots(before, after);
      expect(diff.isEmpty, `Le rollback doit restaurer l'état initial: ${formatSnapshotDiff(diff)}`).toBe(true);
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

  // ── Phase 7 — cycle de vie des artefacts ──────────────────────────────

  it("remove retire un composant, son fichier, son lock et sa config", () => {
    const fixture = createFixture({ name: "remove-component" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const remove = runCli(fixture, ["remove", "button", "--yes"]);
    const analysis = analyzeImports(fixture.root);
    report("remove button", fixture, remove, analysis);

    expect(remove.status, `remove doit réussir.\n${remove.output}`).toBe(0);
    expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);

    const lock = readFixtureJson<{ components?: Record<string, unknown> }>(
      fixture,
      "rashwright-ui.lock",
    );
    expect(lock.components ?? {}).not.toHaveProperty("button");

    const config = readFixtureJson<{ components?: Record<string, unknown> }>(
      fixture,
      "rashwright-ui.json",
    );
    expect(config.components ?? {}).not.toHaveProperty("button");
  });

  it("remove refuse un composant requis par un template, sauf avec --force", () => {
    const fixture = createFixture({ name: "remove-dependent" });
    const add = runCli(fixture, [
      "add",
      "-t",
      "minimal",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    expect(add.status, `Installation du template attendue.\n${add.output}`).toBe(0);
    expectFile(fixture, "src/components/ui/card.tsx");

    const refused = runCli(fixture, ["remove", "card", "--yes"]);
    const refusedAnalysis = analyzeImports(fixture.root);
    report("remove card (dépendant installé)", fixture, refused, refusedAnalysis);

    expect(
      refused.status,
      `remove doit refuser un composant encore requis.\n${refused.output}`,
    ).not.toBe(0);
    expect(refused.output).toContain("requis par");
    expect(fixtureExists(fixture, "src/components/ui/card.tsx")).toBe(true);

    const forced = runCli(fixture, ["remove", "card", "--yes", "--force"]);
    const forcedAnalysis = analyzeImports(fixture.root);
    report("remove card --force", fixture, forced, forcedAnalysis);

    expect(forced.status, `--force doit permettre la suppression.\n${forced.output}`).toBe(0);
    expect(fixtureExists(fixture, "src/components/ui/card.tsx")).toBe(false);
  });

  it("remove refuse un fichier modifié localement, sauf avec --force", () => {
    const fixture = createFixture({ name: "remove-modified" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const buttonPath = join(fixture.root, "src/components/ui/button.tsx");
    const marker = "// MODIFICATION LOCALE\n";
    writeFileSync(buttonPath, marker + readFileSync(buttonPath, "utf-8"), "utf-8");

    const refused = runCli(fixture, ["remove", "button", "--yes"]);
    const refusedAnalysis = analyzeImports(fixture.root);
    report("remove button (modifié)", fixture, refused, refusedAnalysis);

    expect(
      refused.status,
      `remove doit refuser un fichier modifié.\n${refused.output}`,
    ).not.toBe(0);
    expect(refused.output).toContain("--force");
    expect(readFileSync(buttonPath, "utf-8").startsWith(marker)).toBe(true);

    const forced = runCli(fixture, ["remove", "button", "--yes", "--force"]);
    const forcedAnalysis = analyzeImports(fixture.root);
    report("remove button --force (modifié)", fixture, forced, forcedAnalysis);

    expect(forced.status, `--force doit supprimer malgré les modifications.\n${forced.output}`).toBe(0);
    expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);
  });

  it("update --check détecte une version de registre désynchronisée puis la corrige", () => {
    const fixture = createFixture({ name: "update-registry-version" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const lockPath = join(fixture.root, "rashwright-ui.lock");
    const lock = JSON.parse(readFileSync(lockPath, "utf-8"));
    expect(lock.components?.button?.registryVersion).toBe("1.6.0");
    lock.components.button.registryVersion = "1.5.0";
    writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf-8");

    const check = runCli(fixture, ["update", "button", "--check"]);
    const checkAnalysis = analyzeImports(fixture.root);
    report("update button --check (registre désynchronisé)", fixture, check, checkAnalysis);

    expect(check.status, `update --check doit réussir.\n${check.output}`).toBe(0);
    expect(check.output).toContain("registre 1.5.0");
    expect(check.output).toContain("1.6.0");

    const applied = runCli(fixture, ["update", "button", "--yes"]);
    const appliedAnalysis = analyzeImports(fixture.root);
    report("update button --yes", fixture, applied, appliedAnalysis);

    expect(applied.status, `update doit réussir.\n${applied.output}`).toBe(0);

    const after = JSON.parse(readFileSync(lockPath, "utf-8"));
    expect(after.components.button.registryVersion).toBe("1.6.0");

    const config = readFixtureJson<{
      components?: Record<string, { version: string; registryVersion?: string }>;
    }>(fixture, "rashwright-ui.json");
    expect(config.components?.button?.registryVersion).toBe("1.6.0");
  });

  it("info expose l'état 360° d'un template avec intégrité et imports vérifiés", () => {
    const fixture = createFixture({ name: "info-template" });
    const add = runCli(fixture, [
      "add",
      "-t",
      "minimal",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    expect(add.status, `Installation du template attendue.\n${add.output}`).toBe(0);

    const info = runCli(fixture, ["info", "template:minimal", "--json"]);
    const analysis = analyzeImports(fixture.root);
    report("info template:minimal --json", fixture, info, analysis);

    expect(info.status, `info doit réussir.\n${info.output}`).toBe(0);
    const start = info.output.indexOf("{");
    const end = info.output.lastIndexOf("}");
    expect(start, `Sortie JSON attendue.\n${info.output}`).toBeGreaterThanOrEqual(0);
    const payload = JSON.parse(info.output.slice(start, end + 1)) as {
      manifest: { type: string; id: string; registryVersion?: string };
      local: {
        isInstalled: boolean;
        integrityStatus: string;
        verification?: { issues: Array<{ message: string }> };
      };
    };

    expect(payload.manifest.type).toBe("template");
    expect(payload.manifest.registryVersion).toBe("1.6.0");
    expect(payload.local.isInstalled).toBe(true);
    expect(payload.local.integrityStatus).toBe("clean");
    expect(payload.local.verification?.issues ?? []).toEqual([]);
  });

  it("why explique les dépendances inverses directes et transitives", () => {
    const fixture = createFixture({ name: "why-graph" });
    const add = runCli(fixture, [
      "add",
      "-t",
      "minimal",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    expect(add.status, `Installation du template attendue.\n${add.output}`).toBe(0);

    const whyCard = runCli(fixture, ["why", "card"]);
    const cardAnalysis = analyzeImports(fixture.root);
    report("why card", fixture, whyCard, cardAnalysis);
    expect(whyCard.status, `why card doit réussir.\n${whyCard.output}`).toBe(0);
    expect(whyCard.output).toContain("template:minimal");
    expect(whyCard.output).toContain("installé");

    const whyText = runCli(fixture, ["why", "text"]);
    const textAnalysis = analyzeImports(fixture.root);
    report("why text", fixture, whyText, textAnalysis);
    expect(whyText.status, `why text doit réussir.\n${whyText.output}`).toBe(0);
    expect(whyText.output).toContain("est requis directement par");
    expect(whyText.output).toContain("Requis transitivement par");
    expect(whyText.output).toContain("template:minimal");

    const whyExpo = runCli(fixture, ["why", "expo-blur"]);
    const expoAnalysis = analyzeImports(fixture.root);
    report("why expo-blur", fixture, whyExpo, expoAnalysis);
    expect(whyExpo.status, `why expo-blur doit réussir.\n${whyExpo.output}`).toBe(0);
    expect(whyExpo.output).toContain("paquet Expo");
    expect(whyExpo.output).toContain("button");
  });

  it("doctor échoue sur un projet dont un import installé est cassé", () => {
    const fixture = createFixture({ name: "doctor-broken-import" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const buttonPath = join(fixture.root, "src/components/ui/button.tsx");
    const original = readFileSync(buttonPath, "utf-8");
    writeFileSync(
      buttonPath,
      `import { Missing } from "./does-not-exist";\n${original}`,
      "utf-8",
    );

    const result = runCli(fixture, ["doctor", "--json"]);
    report("doctor sur import cassé", fixture, result, analyzeImports(fixture.root));

    expect(
      result.status,
      `doctor doit échouer sur un import cassé.\n${result.output}`,
    ).not.toBe(0);

    const jsonStart = result.output.indexOf("[");
    const jsonEnd = result.output.lastIndexOf("]");
    expect(jsonStart, `Sortie JSON attendue.\n${result.output}`).toBeGreaterThanOrEqual(0);
    const checks = JSON.parse(result.output.slice(jsonStart, jsonEnd + 1)) as Array<{
      label: string;
      status: string;
      detail?: string;
    }>;
    const imports = checks.find((check) => check.label.startsWith("Imports:"));
    expect(imports, `Contrôle des imports attendu.\n${JSON.stringify(checks, null, 2)}`).toBeDefined();
    expect(imports?.status).toBe("error");
    expect(imports?.detail ?? "").toContain("does-not-exist");
  });

  it("info n'affiche pas « Intact » quand un import installé est cassé", () => {
    const fixture = createFixture({ name: "info-broken-import" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const buttonPath = join(fixture.root, "src/components/ui/button.tsx");
    const original = readFileSync(buttonPath, "utf-8");
    const modified = `import { Missing } from "./does-not-exist";\n${original}`;
    writeFileSync(buttonPath, modified, "utf-8");

    // Le hash du lockfile est aligné sur le fichier modifié : l'intégrité est
    // « clean » alors que l'import est cassé. C'est exactement le cas que
    // `info` ne doit plus présenter comme « Intact ».
    const lockPath = join(fixture.root, "rashwright-ui.lock");
    const lock = JSON.parse(readFileSync(lockPath, "utf-8"));
    const entry = lock.components.button.files.find(
      (file: { path: string }) => file.path.endsWith("button.tsx"),
    );
    entry.hash = sha256(modified);
    writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`, "utf-8");

    const result = runCli(fixture, ["info", "button"]);
    report("info button (import cassé)", fixture, result, analyzeImports(fixture.root));

    expect(result.status, `info doit réussir.\n${result.output}`).toBe(0);
    expect(result.output).not.toContain("✔ Intact");
    expect(result.output).toContain("import(s) non résolu(s)");
    expect(result.output).toContain("does-not-exist");
  });

  it("remove text refuse car minimal-template en dépend", () => {
    const fixture = createFixture({ name: "remove-text-dependent" });
    const add = runCli(fixture, [
      "add",
      "-t",
      "minimal",
      "--yes",
      "--no-skills",
      "--no-interactive",
    ]);
    expect(add.status, `Installation du template attendue.\n${add.output}`).toBe(0);
    expectFile(fixture, "src/components/ui/text.tsx");

    const result = runCli(fixture, ["remove", "text", "--yes"]);
    report("remove text (dépendant)", fixture, result, analyzeImports(fixture.root));

    expect(
      result.status,
      `remove text doit être refusé tant que le template en dépend.\n${result.output}`,
    ).not.toBe(0);
    expect(result.output).toContain("requis par");
    expect(result.output).toContain("template:minimal");
    expect(fixtureExists(fixture, "src/components/ui/text.tsx")).toBe(true);
  });

  it("suppression puis réinstallation restitue le même état", () => {
    const fixture = createFixture({ name: "roundtrip-remove-add" });
    const add = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    expect(add.status, `Installation initiale attendue.\n${add.output}`).toBe(0);

    const buttonPath = join(fixture.root, "src/components/ui/button.tsx");
    const originalContent = readFileSync(buttonPath, "utf-8");
    const originalLock = readFixtureJson<{
      components: Record<
        string,
        { version: string; registryVersion?: string; files: Array<{ path: string; hash: string }> }
      >;
    }>(fixture, "rashwright-ui.lock");
    const originalConfig = readFixtureJson<{
      components: Record<string, { version: string; registryVersion?: string }>;
    }>(fixture, "rashwright-ui.json");

    const remove = runCli(fixture, ["remove", "button", "--yes"]);
    expect(remove.status, `remove doit réussir.\n${remove.output}`).toBe(0);
    expect(fixtureExists(fixture, "src/components/ui/button.tsx")).toBe(false);

    const readd = runCli(fixture, ["add", "button", "--yes", "--no-skills", "--no-interactive"]);
    report("add button après remove", fixture, readd, analyzeImports(fixture.root));
    expect(readd.status, `Réinstallation attendue.\n${readd.output}`).toBe(0);

    expect(readFileSync(buttonPath, "utf-8")).toBe(originalContent);

    const afterLock = readFixtureJson<typeof originalLock>(fixture, "rashwright-ui.lock");
    const normalize = (
      entry: { files: Array<{ path: string; hash: string }> },
    ): Array<{ path: string; hash: string }> => entry.files.map((file) => ({
      path: file.path,
      hash: file.hash,
    }));
    expect(normalize(afterLock.components.button)).toEqual(
      normalize(originalLock.components.button),
    );
    expect(afterLock.components.button.version).toBe(originalLock.components.button.version);
    expect(afterLock.components.button.registryVersion).toBe(
      originalLock.components.button.registryVersion,
    );

    const afterConfig = readFixtureJson<typeof originalConfig>(fixture, "rashwright-ui.json");
    expect(afterConfig.components.button.version).toBe(
      originalConfig.components.button.version,
    );
    expect(afterConfig.components.button.registryVersion).toBe(
      originalConfig.components.button.registryVersion,
    );
  });
});

// ── Serveur de registre distant minimal, adossé aux fichiers réels du dépôt ──

function createRemoteRegistryServer(options: {
  missingFiles?: string[];
  omitMatrixForSdk?: number;
  overrides?: Record<string, string>;
} = {}) {
  const missingFiles = new Set(options.missingFiles ?? []);
  const overrides = new Map(
    Object.entries(options.overrides ?? {}).map(([key, value]) => [
      normalize(key).replace(/\\/g, "/"),
      value,
    ]),
  );

  return createServer((request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const requested = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const normalized = normalize(requested).replace(/\\/g, "/");

    if (normalized.includes("..")) {
      response.writeHead(400).end("bad request");
      return;
    }

    if (
      options.omitMatrixForSdk !== undefined &&
      normalized === `registry/versions/expo-${options.omitMatrixForSdk}.json`
    ) {
      response.writeHead(404).end(`matrix omitted: ${normalized}`);
      return;
    }

    if (missingFiles.has(normalized)) {
      response.writeHead(404).end(`missing file: ${normalized}`);
      return;
    }

    const override = overrides.get(normalized);
    if (override !== undefined) {
      response
        .writeHead(200, { "content-type": contentType(normalized) })
        .end(override);
      return;
    }

    const candidates = [
      join(UI_MOBILE_ROOT, normalized),
      join(UI_MOBILE_ROOT, "registry", normalized.replace(/^registry\//, "")),
    ];

    for (const candidate of candidates) {
      try {
        const content = readFileSync(candidate);
        response.writeHead(200, { "content-type": contentType(candidate) }).end(content);
        return;
      } catch {
        /* candidat suivant */
      }
    }

    // Si l'index complet n'est pas demandé, servir un index minimal.
    if (normalized === "registry/index.json") {
      response
        .writeHead(200, { "content-type": "application/json" })
        .end(
          JSON.stringify(
            {
              version: "1.6.0",
              minimumExpoSdk: 54,
              components: ["button"],
              categories: { Basic: ["button"] },
              themes: ["default"],
            },
            null,
            2,
          ),
        );
      return;
    }

    response.writeHead(404).end(`not found: ${normalized} (${relative(UI_MOBILE_ROOT, join(UI_MOBILE_ROOT, normalized))})`);
  });
}

function contentType(path: string): string {
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "text/plain; charset=utf-8";
  return "application/octet-stream";
}
