import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { RashwrightConfig } from "../src/core/config-manager.js";
import { recordLockedComponent } from "../src/core/lock-manager.js";
import {
  deriveAliasPrefixes,
  verifyInstallation,
} from "../src/core/post-install-verifier.js";

describe("Vérification post-installation", () => {
  let root: string;
  let config: RashwrightConfig;
  let configPath: string;

  const writeJson = (path: string, value: unknown): void => {
    writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf-8");
  };

  const writeFile = (relativePath: string, content: string): string => {
    const absolute = join(root, relativePath);
    mkdirSync(join(absolute, ".."), { recursive: true });
    writeFileSync(absolute, content, "utf-8");
    return absolute;
  };

  const verify = (overrides: Partial<Parameters<typeof verifyInstallation>[0]> = {}) =>
    verifyInstallation({
      projectRoot: root,
      config,
      configPath,
      targets: [],
      ...overrides,
    });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "rs-ui-verifier-test-"));
    configPath = join(root, "rashwright-ui.json");

    writeJson(join(root, "package.json"), {
      name: "fixture",
      private: true,
      dependencies: {
        expo: "~54.0.0",
        react: "18.3.1",
        "react-native": "0.76.0",
        zustand: "^5.0.0",
      },
    });
    writeJson(join(root, "tsconfig.json"), {
      compilerOptions: {
        jsx: "react-native",
        strict: true,
        paths: { "@/*": ["./src/*"] },
      },
      include: ["src"],
    });

    config = {
      version: 1,
      componentsPath: "src/components/ui",
      theme: "default",
      glass: false,
      typescript: true,
      packageManager: "npm",
      aliases: {
        components: "@/components",
        lib: "@/lib",
        theme: "@/theme",
      },
      components: {},
    };
    writeJson(configPath, config);
  });

  afterEach(() => {
    if (existsSync(root)) rmSync(root, { recursive: true, force: true });
  });

  it("valide une installation réellement présente sur le disque", () => {
    const button = writeFile(
      "src/components/ui/button.tsx",
      [
        'import React from "react";',
        'import { View } from "react-native";',
        'import { create } from "zustand";',
        'import { ThemedText } from "./text";',
        "export const Button = () => <View />;",
      ].join("\n"),
    );
    writeFile("src/components/ui/text.tsx", "export const ThemedText = () => null;\n");

    recordLockedComponent(
      root,
      "button",
      "1.0.0",
      ["src/components/ui/button.tsx"],
      [],
      ["zustand"],
      false,
    );
    config.components.button = "1.0.0";

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
      expectedPackages: ["zustand"],
      expectedComponents: ["button"],
    });

    expect(report.ok).toBe(true);
    expect(report.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(report.checkedFiles).toBe(1);
    expect(report.checkedImports).toBeGreaterThan(0);
  });

  it("signale un fichier attendu absent", () => {
    const report = verify({
      targets: [
        {
          label: "composant button",
          files: [join(root, "src/components/ui/button.tsx")],
          assets: [],
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("missing-file");
  });

  it("signale un import relatif non résolu", () => {
    const button = writeFile(
      "src/components/ui/button.tsx",
      'import { Missing } from "./missing";\nexport const Button = () => Missing;\n',
    );

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
    });

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("unresolved-import");
  });

  it("signale un alias non résolu", () => {
    const button = writeFile(
      "src/components/ui/button.tsx",
      'import { Missing } from "@/components/ui/missing";\nexport const Button = () => Missing;\n',
    );

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
    });

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("unresolved-alias");
  });

  it("résout les alias tsconfig quand les globs contiennent des séquences de commentaires", () => {
    writeJson(join(root, "tsconfig.json"), {
      compilerOptions: {
        jsx: "react-native",
        paths: { "@/*": ["./src/*", "./*"] },
      },
      include: ["**/*.ts", "**/*.tsx"],
    });
    const button = writeFile(
      "src/components/ui/button.tsx",
      'import { useTheme } from "@/contexts/theme-context"; export const Button = () => useTheme;',
    );
    writeFile(
      "contexts/theme-context.tsx",
      "export const useTheme = () => null;",
    );

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
    });

    expect(report.issues.map((issue) => issue.code)).not.toContain(
      "missing-package",
    );
    expect(report.issues.filter((issue) => issue.severity === "error")).toEqual(
      [],
    );
    expect(report.ok).toBe(true);
  });

  it("signale une tsconfig illisible au lieu de supposer l'absence d'alias", () => {
    writeFile("tsconfig.json", "{ ceci n'est pas du JSON");

    const report = verify();

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain(
      "invalid-tsconfig",
    );
  });

  it("signale un package externe absent de package.json", () => {
    const button = writeFile(
      "src/components/ui/button.tsx",
      'import { motion } from "motion-library";\nexport const Button = () => motion;\n',
    );

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
    });

    expect(report.ok).toBe(false);
    const issue = report.issues.find((item) => item.code === "missing-package");
    expect(issue?.message).toContain("motion-library");
  });

  it("n'exige jamais react ni react-native dans package.json (pairs implicites)", () => {
    const button = writeFile(
      "src/components/ui/button.tsx",
      'import React from "react";\nimport { View } from "react-native";\nexport const Button = () => <View />;\n',
    );

    const report = verify({
      targets: [{ label: "composant button", files: [button], assets: [] }],
    });

    expect(report.ok).toBe(true);
    expect(report.issues).toEqual([]);
  });

  it("signale un lockfile illisible au lieu de le considérer absent", () => {
    writeFile("rashwright-ui.lock", "{ ceci n'est pas du JSON");

    const report = verify();

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("lockfile-invalid");
  });

  it("signale un chemin de hook verrouillé sous componentsPath", () => {
    writeFile(
      "src/components/ui/hooks/use-thing.ts",
      "export const useThing = () => null;\n",
    );
    recordLockedComponent(
      root,
      "thing",
      "1.0.0",
      ["src/components/ui/hooks/use-thing.ts"],
      [],
      [],
      false,
    );

    const report = verify();

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("lockfile-bad-path");
  });

  it("signale un composant déclaré installé mais absent du disque", () => {
    writeFile("src/components/ui/ghost.tsx", "export const Ghost = () => null;\n");
    recordLockedComponent(
      root,
      "ghost",
      "1.0.0",
      ["src/components/ui/ghost.tsx"],
      [],
      [],
      false,
    );
    rmSync(join(root, "src/components/ui/ghost.tsx"), { force: true });
    config.components.ghost = "1.0.0";

    const report = verify();

    expect(report.ok).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("config-file-missing");
  });

  it("traite l'absence de lockfile comme un avertissement, pas un succès silencieux", () => {
    const report = verify({ expectedFoundations: ["theme"] });

    expect(report.ok).toBe(true);
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: "warning", code: "lockfile-without-entry" }),
      ]),
    );
  });

  it("déduit les préfixes d'alias des chemins configurés", () => {
    expect(
      deriveAliasPrefixes({
        components: "@/components",
        lib: "@/lib",
        theme: "@/theme",
      }),
    ).toEqual(["@/"]);

    expect(
      deriveAliasPrefixes({
        components: "~/components",
        lib: "@app/lib",
      }),
    ).toEqual(["@app/", "~/"]);
  });

  it("ignore TypeScript quand node_modules est absent, sans inventer de succès", () => {
    const report = verify({ checkTypeScript: true });

    expect(report.typescript.status).toBe("skipped");
    expect(report.typescript.reason).toContain("node_modules absent");
  });
});
