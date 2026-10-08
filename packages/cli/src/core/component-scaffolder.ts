import { join } from "node:path";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";

export interface ComponentScaffoldOptions {
  name: string; // ex: "product-card"
  category?: string;
  supportsGlass?: boolean;
  description?: string;
}

/**
 * Convertit un slug kebab-case en PascalCase (ex: product-card -> ProductCard)
 */
export function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Génère le code source TSX pour un nouveau composant projet
 */
export function generateComponentTemplate(options: ComponentScaffoldOptions): string {
  const { name, supportsGlass = false, description } = options;
  const componentName = toPascalCase(name);

  return `// @/components/ui/${name}.tsx
import React from "react";
import { StyleSheet, View, Text, type StyleProp, type ViewStyle } from "react-native";
import { useTheme } from "@/contexts/theme-context";
${supportsGlass ? `import { LiquidGlassView } from "@/components/ui/liquid/liquid-glass-view";\n` : ""}
export interface ${componentName}Props {
  children?: React.ReactNode;
  variant?: "default" | "bordered"${supportsGlass ? ` | "glass"` : ""};
  style?: StyleProp<ViewStyle>;
}

/**
 * ${description || `Composant ${componentName} propre au projet.`}
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  variant = "default",
  style,
}) => {
  const { theme } = useTheme();

  const containerStyle = [
    styles.base,
    {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
    },
    variant === "bordered" && styles.bordered,
    style,
  ];

${supportsGlass ? `  if (variant === "glass") {
    return (
      <LiquidGlassView style={[styles.base, style]}>
        {children}
      </LiquidGlassView>
    );
  }\n\n` : ""}  return (
    <View style={containerStyle}>
      {children || <Text style={{ color: theme.colors.foreground }}>${componentName}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: 16,
  },
  bordered: {
    borderWidth: 1,
  },
});

export default ${componentName};
`;
}

/**
 * Génère la documentation IA standardisée (SKILL.md) pour le nouveau composant
 */
export function generateSkillTemplate(options: ComponentScaffoldOptions): string {
  const { name, category = "Project", supportsGlass = false, description } = options;
  const componentName = toPascalCase(name);
  const desc = description || `Composant ${componentName} propre au projet.`;

  return `---
name: "${name}"
description: "${desc}"
version: "1.0.0"
componentVersion: "1.0.0"
category: "${category}"
dependencies: []
expoDependencies: []
requiresComponents: []
supportsGlass: ${supportsGlass}
---

# Skill : ${componentName} (\`@/components/ui/${name}.tsx\`)

${desc}

## Purpose
Composant personnalisé conçu directement au sein de votre projet, respectant les tokens de design Rashwright UI.

## Installation / Emplacement
- Fichier source : \`components/ui/${name}.tsx\`
- Import alias : \`import { ${componentName} } from "@/components/ui/${name}";\`

## Usage
\`\`\`tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ${componentName} } from '@/components/ui/${name}';

export function Example() {
  return (
    <${componentName} variant="default">
      <Text>Contenu de ${componentName}</Text>
    </${componentName}>
  );
}
\`\`\`

## Props API
| Prop | Type | Default | Description |
|---|---|---|---|
| \`variant\` | \`"default" | "bordered"${supportsGlass ? ` | "glass"` : ""}\` | \`"default"\` | Style visuel du composant |
| \`children\` | \`React.ReactNode\` | \`undefined\` | Contenu interne |
| \`style\` | \`StyleProp<ViewStyle>\` | \`undefined\` | Surcharges de styles React Native |
`;
}

/**
 * Scaffolde le composant physique et son Skill IA
 */
export function scaffoldProjectComponent(
  projectRoot: string,
  componentsPathRel: string,
  options: ComponentScaffoldOptions,
  dryRun = false
): { componentFile: string; skillFile: string } {
  const { name } = options;
  const compDir = join(projectRoot, componentsPathRel);
  const skillDir = join(projectRoot, "skills", "rs-ui", name);

  const componentFile = join(compDir, `${name}.tsx`);
  const skillFile = join(skillDir, "SKILL.md");

  if (!dryRun) {
    mkdirSync(compDir, { recursive: true });
    mkdirSync(skillDir, { recursive: true });

    writeFileSync(componentFile, generateComponentTemplate(options), "utf-8");
    writeFileSync(skillFile, generateSkillTemplate(options), "utf-8");
  }

  return { componentFile, skillFile };
}
