import { join, dirname } from "node:path";
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { copyComponentFiles } from "./file-manager.js";
import { generateUiIndex } from "./starter-generator.js";
import { TEMPLATES_ROOT } from "./paths.js";
import { getTemplateDefinition } from "./templates-registry.js";

export type TemplateType =
  | "minimal"
  | "showcase"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "commerce"
  | "settings";

export interface TemplateScreenDef {
  route: string;
  file: string;
  componentName: string;
  title?: string;
}

export interface TemplateMetadata {
  id: TemplateType;
  name: string;
  description: string;
  requiredComponents: string[];
  screenFile: string;
  screenComponentName: string;
  screens?: TemplateScreenDef[];
}

export const AVAILABLE_TEMPLATES: Record<TemplateType, TemplateMetadata> = {
  minimal: {
    id: "minimal",
    name: "Minimal Starter",
    description: "Écran minimaliste épuré avec branding, card d'accueil et boutons d'action",
    requiredComponents: ["button", "card", "badge", "rashwright-logo"],
    screenFile: "components/ui/minimal-screen.tsx",
    screenComponentName: "RashwrightMinimalScreen",
  },
  showcase: {
    id: "showcase",
    name: "Showcase Complet",
    description: "Démonstration interactive complète avec presets de thèmes, glass UI et upload media",
    requiredComponents: [
      "button",
      "card",
      "glass-card",
      "badge",
      "text-input",
      "upload-image",
      "upload-video",
      "rashwright-logo",
      "showcase-screen",
    ],
    screenFile: "components/ui/showcase-screen.tsx",
    screenComponentName: "RashwrightShowcaseScreen",
  },
  auth: {
    id: "auth",
    name: "Authentication Suite",
    description: "Écrans d'authentification modernes avec connexion, inscription, saisie OTP et validation",
    requiredComponents: [
      "button",
      "card",
      "text-input",
      "divider",
      "badge",
      "checkbox",
      "otp-input",
      "rashwright-logo",
    ],
    screenFile: "components/ui/auth-screen.tsx",
    screenComponentName: "RashwrightAuthScreen",
    screens: [
      { route: "sign-in", file: "sign-in.tsx", componentName: "SignInScreen", title: "Connexion" },
      { route: "sign-up", file: "sign-up.tsx", componentName: "SignUpScreen", title: "Inscription" },
    ],
  },
  onboarding: {
    id: "onboarding",
    name: "Onboarding Flow",
    description: "Parcours d'accueil et d'introduction avec étapes visuelles, carrousel et call-to-actions",
    requiredComponents: ["button", "card", "badge", "carousel", "rashwright-logo"],
    screenFile: "components/ui/onboarding-screen.tsx",
    screenComponentName: "RashwrightOnboardingScreen",
    screens: [
      { route: "home", file: "onboarding-home-screen.tsx", componentName: "OnboardingHomeScreen", title: "Accueil" },
    ],
  },
  dashboard: {
    id: "dashboard",
    name: "Analytics & Dashboard",
    description: "Tableau de bord de métriques clés avec StatCards, profil avatar, statut et tableau de données",
    requiredComponents: [
      "button",
      "card",
      "stat-card",
      "badge",
      "avatar",
      "data-table",
      "rashwright-logo",
    ],
    screenFile: "components/ui/dashboard-screen.tsx",
    screenComponentName: "RashwrightDashboardScreen",
  },
  commerce: {
    id: "commerce",
    name: "E-Commerce & Store",
    description: "Boutique en ligne avec barre de recherche, filtres par catégorie, cartes produits et avis",
    requiredComponents: [
      "card",
      "button",
      "badge",
      "rating",
      "divider",
      "search-input",
      "text-input",
      "icon-button",
      "icon",
      "rashwright-logo",
    ],
    screenFile: "components/ui/commerce-screen.tsx",
    screenComponentName: "RashwrightCommerceScreen",
    screens: [
      { route: "products", file: "products-screen.tsx", componentName: "ProductsScreen", title: "Catalogue" },
      { route: "product-detail", file: "product-detail-screen.tsx", componentName: "ProductDetailScreen", title: "Détail Produit" },
    ],
  },
  settings: {
    id: "settings",
    name: "User Settings & Preferences",
    description: "Écran de réglages avec profil, toggles d'apparence/notifications et actions de sécurité",
    requiredComponents: [
      "button",
      "card",
      "switch",
      "avatar",
      "badge",
      "divider",
      "rashwright-logo",
    ],
    screenFile: "components/ui/settings-screen.tsx",
    screenComponentName: "RashwrightSettingsScreen",
  },
};

export function listTemplates(): TemplateMetadata[] {
  return Object.values(AVAILABLE_TEMPLATES);
}

export function getTemplate(type: string): TemplateMetadata | null {
  const normalized = type.toLowerCase() as TemplateType;
  return AVAILABLE_TEMPLATES[normalized] || null;
}

export function getTemplateComponents(type: TemplateType): string[] {
  const t = AVAILABLE_TEMPLATES[type];
  return t ? [...t.requiredComponents] : [];
}

/**
 * Génère un écran proxy TSX léger pour un template donné,
 * qui importe et rend le template autonome correspondant.
 * (Conserve la compatibilité avec l'ancienne API).
 */
export function generateTemplateScreenCode(type: TemplateType): string {
  const meta = AVAILABLE_TEMPLATES[type];
  if (!meta) return "";
  const tplDef = getTemplateDefinition(type, TEMPLATES_ROOT);
  const componentName = tplDef?.componentName || meta.screenComponentName;

  return `import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/theme-context";
import { ${componentName} } from "@/components/templates/${type}";

export function ${meta.screenComponentName}() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <${componentName} />
    </SafeAreaView>
  );
}

export default ${meta.screenComponentName};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
`;
}

/**
 * Configure et installe un template starter dans le projet cible.
 */
export function setupStarterTemplate(
  sourceRoot: string,
  targetProjectRoot: string,
  templateType: TemplateType = "showcase",
  options: {
    componentsPath?: string;
    themePreset?: string;
    dryRun?: boolean;
  } = {}
): {
  installedComponents: string[];
  entryScreenRelPath: string;
  templateTargetRel?: string;
} {
  const { componentsPath = "src/components/ui", themePreset = "default", dryRun = false } = options;
  const meta = AVAILABLE_TEMPLATES[templateType] || AVAILABLE_TEMPLATES.showcase;

  const targetComponentsDir = join(targetProjectRoot, componentsPath);
  if (!existsSync(targetComponentsDir) && !dryRun) {
    mkdirSync(targetComponentsDir, { recursive: true });
  }

  // 1. Déterminer les fichiers composants à copier depuis sourceRoot
  const componentFilesToCopy: string[] = [];
  for (const compName of meta.requiredComponents) {
    if (compName === "showcase-screen") {
      componentFilesToCopy.push("components/ui/showcase-screen.tsx");
    } else {
      componentFilesToCopy.push(`components/ui/${compName}.tsx`);
    }
  }

  // Copie des composants
  copyComponentFiles(componentFilesToCopy, sourceRoot, targetComponentsDir, {
    overwrite: true,
    dryRun,
  });

  // 2. Installer les fichiers du module autonome dans components/templates/<id>/
  const tplDef = getTemplateDefinition(templateType, TEMPLATES_ROOT);
  let templateTargetRel: string | undefined;

  if (tplDef) {
    const baseNorm = componentsPath.replace(/\\/g, "/");
    const templatesBaseRel = baseNorm.endsWith("/ui")
      ? baseNorm.slice(0, -3) + "/templates"
      : baseNorm + "/templates";
    templateTargetRel = `${templatesBaseRel}/${templateType}`;
    const targetTemplatesDir = join(targetProjectRoot, templateTargetRel);
    const sourceTemplatesDir = join(TEMPLATES_ROOT, templateType);

    if (!dryRun && existsSync(sourceTemplatesDir)) {
      if (!existsSync(targetTemplatesDir)) {
        mkdirSync(targetTemplatesDir, { recursive: true });
      }
      for (const relFile of tplDef.files) {
        const srcF = join(sourceTemplatesDir, relFile);
        const dstF = join(targetTemplatesDir, relFile);
        if (existsSync(srcF)) {
          const parentDir = dirname(dstF);
          if (!existsSync(parentDir)) {
            mkdirSync(parentDir, { recursive: true });
          }
          copyFileSync(srcF, dstF);
        }
      }
    }
  }

  // 3. Écran wrapper dans components/ui/ pour compatibilité descendante
  const screenFileName = meta.screenFile.replace(/^components\/ui\//, "");
  if (templateType !== "showcase" && !dryRun) {
    const code = generateTemplateScreenCode(templateType);
    if (code) {
      writeFileSync(join(targetComponentsDir, screenFileName), code, "utf-8");
    }
  }

  const installedComps = [...meta.requiredComponents];
  if (templateType !== "showcase") {
    installedComps.push(screenFileName.replace(/\.tsx$/, ""));
  }

  // 4. Mise à jour de components/ui/index.ts
  generateUiIndex(targetComponentsDir, installedComps, dryRun);

  return {
    installedComponents: installedComps,
    entryScreenRelPath: screenFileName.replace(/\.tsx$/, ""),
    templateTargetRel,
  };
}
