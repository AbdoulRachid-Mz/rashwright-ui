import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const uiMobileDir = join(rootDir, "packages", "ui-mobile");
const registryComponentsDir = join(uiMobileDir, "registry", "components");
const skillsDir = join(uiMobileDir, "skills");

interface ComponentRegistry {
  name: string;
  version: string;
  description: string;
  category: string;
  files: string[];
  dependencies: string[];
  expoDependencies: string[];
  optionalExpoDependencies?: string[];
  requiresComponents: string[];
  providers?: string[];
  supportsGlass: boolean;
  platforms?: string[];
  nativeRebuildRequired?: boolean;
  props?: Record<string, unknown>;
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function formatProps(propsObj?: Record<string, unknown>): string {
  if (!propsObj || Object.keys(propsObj).length === 0) {
    return "| Prop | Type | Description |\n|---|---|---|\n| `style` | `StyleProp<ViewStyle>` | Styles personnalisés additionnels |\n| `children` | `React.ReactNode` | Contenu enfant |\n";
  }

  let table = "| Prop | Type | Description |\n|---|---|---|\n";
  for (const [propName, propType] of Object.entries(propsObj)) {
    let typeStr = "";
    if (Array.isArray(propType)) {
      typeStr = propType.map((v) => `'${v}'`).join(" \\| ");
    } else if (typeof propType === "object" && propType !== null) {
      typeStr = JSON.stringify(propType);
    } else {
      typeStr = String(propType);
    }
    table += `| \`${propName}\` | \`${typeStr}\` | Propriété \`${propName}\` du composant |\n`;
  }
  return table;
}

function generateSkillMarkdown(comp: ComponentRegistry): string {
  const pascalName = toPascalCase(comp.name);
  const depsList = comp.dependencies.length > 0 ? comp.dependencies.map((d) => `  - ${d}`).join("\n") : "  - none";
  const expoDepsList = comp.expoDependencies.length > 0 ? comp.expoDependencies.map((d) => `  - ${d}`).join("\n") : "  - none";
  const reqCompsList = comp.requiresComponents.length > 0 ? comp.requiresComponents.map((d) => `  - ${d}`).join("\n") : "  - none";

  const nativeWarning = comp.nativeRebuildRequired
    ? `> ⚠️ **Rebuild natif requis** : Ce composant utilise des modules natifs. Exécutez \`npx expo run:ios\` ou \`npx expo run:android\` si vous utilisez un development build.\n`
    : `> ℹ️ Ce composant fonctionne directement avec Expo Go ou un development build standard.\n`;

  const glassSection = comp.supportsGlass
    ? `\n### Support Liquid Glass\nCe composant supporte le variant \`glass\` ou le style translucide Liquid Glass avec réfraction et bordure spéculaire.\n`
    : "";

  return `---
name: rs-ui/${comp.name}
description: ${comp.description}
version: 0.3.0
componentVersion: 0.3.0
category: ${comp.category}
dependencies:
${depsList}
expoDependencies:
${expoDepsList}
requiresComponents:
${reqCompsList}
supportsGlass: ${comp.supportsGlass}
---

# ${pascalName} — Rashwright UI Mobile

${comp.description}

## Installation

\`\`\`bash
rs-ui add ${comp.name}
\`\`\`

${nativeWarning}

## Usage

\`\`\`tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ${pascalName} } from '@/components/ui/${comp.name}';
import { useTheme } from '@/contexts/theme-context';

export function Example${pascalName}() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <${pascalName} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
\`\`\`

## Props API

${formatProps(comp.props)}
${glassSection}
## Dépendances & Prérequis

- **Dépendances npm** : ${comp.dependencies.length > 0 ? comp.dependencies.join(", ") : "Aucune"}
- **Dépendances Expo** : ${comp.expoDependencies.length > 0 ? comp.expoDependencies.join(", ") : "Aucune"}
- **Composants requis** : ${comp.requiresComponents.length > 0 ? comp.requiresComponents.join(", ") : "Aucun"}
- **Providers requis** : ${comp.providers ? comp.providers.join(", ") : "ThemeProvider"}

## Bonnes Pratiques & Erreurs Fréquentes

1. **Typage strict** : Ne pas caster les props vers \`any\`. Utilisez les interfaces exportées par le composant.
2. **Cohérence des thèmes** : Ne pas surcharger les couleurs avec des valeurs fixes ; appuyez-vous sur les tokens \`theme.colors\` injectés par le \`ThemeProvider\`.
3. **Import alias** : Toujours importer depuis \`@/components/ui/${comp.name}\` ou \`@/components/ui\`.
`;
}

const files = readdirSync(registryComponentsDir).filter((f) => f.endsWith(".json"));
console.log(`Traitement de ${files.length} composants du registre...`);

let generatedCount = 0;
for (const file of files) {
  const compName = file.replace(".json", "");
  const jsonPath = join(registryComponentsDir, file);
  const data = JSON.parse(readFileSync(jsonPath, "utf-8")) as ComponentRegistry;

  const targetDir = join(skillsDir, compName);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = join(targetDir, "SKILL.md");
  // If a manual skill exists and already has rich custom sections (like drawer, bottom-sheet), we preserve or update frontmatter
  if (existsSync(targetFile)) {
    const existingContent = readFileSync(targetFile, "utf-8");
    if (existingContent.length > 1000 && !existingContent.includes("Example" + toPascalCase(compName))) {
      // Keep rich existing content but ensure standard frontmatter with version 0.3.0
      const frontmatter = `---
name: rs-ui/${data.name}
description: ${data.description}
version: 0.3.0
componentVersion: 0.3.0
category: ${data.category}
dependencies:
${data.dependencies.length > 0 ? data.dependencies.map((d) => `  - ${d}`).join("\n") : "  - none"}
expoDependencies:
${data.expoDependencies.length > 0 ? data.expoDependencies.map((d) => `  - ${d}`).join("\n") : "  - none"}
requiresComponents:
${data.requiresComponents.length > 0 ? data.requiresComponents.map((d) => `  - ${d}`).join("\n") : "  - none"}
supportsGlass: ${data.supportsGlass}
---`;
      const body = existingContent.replace(/^---[\s\S]*?---\n*/, "");
      writeFileSync(targetFile, `${frontmatter}\n\n${body}`, "utf-8");
      generatedCount++;
      continue;
    }
  }

  const content = generateSkillMarkdown(data);
  writeFileSync(targetFile, content, "utf-8");
  generatedCount++;
}

console.log(`Terminé ! ${generatedCount} SKILL.md créés ou synchronisés dans ${skillsDir}`);
