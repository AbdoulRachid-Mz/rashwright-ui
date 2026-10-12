# PLAN DE DÉVELOPPEMENT — Rashwright UI Mobile (Roadmap v0.7.0)

> **Document de référence stratégique et technique.**
>
> Statut : **v0.7.0 Validée & Prête pour Release (143 tests Vitest réussis, 31 suites de tests)**  
> Moteur de Templates Autonomes, Commande `rs-ui add --template`, `rs-ui list --templates`, Registry Modulaire & Lockfile SHA-256.

---

## 0. BILAN DE LA V0.6.0 & OBJECTIF MAJEUR DE LA V0.7.0

La version **v0.6.0** a introduit :
- Le système de Hooks CLI (`pre-add`, `post-add`, `pre-update`, `post-update`).
- Le support des registres multiples et scopés (`rs-ui registry add/list/remove` et `@scope/component`).
- Le pipeline d'initialisation propre sans double installation (`blank-typescript@<SDK> --no-install --no-agents-md`, banner, résolution SDK 54-57).
- Le catalogue initial de 7 templates starters (`minimal`, `showcase`, `auth`, `onboarding`, `dashboard`, `commerce`, `settings`).

### Le problème adressé par la v0.7.0
Dans la v0.6.0, les écrans de templates étaient stockés sous forme de **grandes chaînes de caractères brutes** générées dynamiquement dans `templates-manager.ts` (`generateTemplateScreenCode()`). Les templates étaient confinés à un fichier d'écran plat et ne pouvaient pas être installés ultérieurement dans un projet existant.

### La vision de la v0.7.0
1. **Chaque template devient un véritable composant React Native autonome** doté de ses propres sous-composants, types, hooks et structure de dossier modulaire dans `packages/ui-mobile/templates/<id>/`.
2. **Installation modulaire via le CLI** : `rs-ui add --template <nom>` (ou `-t <nom>`) installe le template dans `src/components/templates/<nom>/` (accessible via `@/components/templates/<nom>`).
3. **Résolution automatique des dépendances** : Le CLI résout automatiquement tous les composants `rs-ui` requis par le template, calcule leurs dépendances transitives et installe les modules Expo/NPM manquants sans réinstallation superflue.
4. **Conservation de l'autonomie et de la modifiabilité** : Le code du template appartient à 100% au développeur dans son projet utilisateur.
5. **Traçabilité stricte** : Enregistrement dans `rashwright-ui.json` et empreintes SHA-256 dans `rashwright-ui.lock`.
6. **Suppression définitive des chaînes de caractères monolithiques** dans le générateur.

---

## 1. PILIER 1 : MODULES DE TEMPLATES AUTONOMES (`packages/ui-mobile/templates/`)

Chaque template est structuré comme un module complet :
```text
packages/ui-mobile/templates/
├── minimal/
│   ├── template.json
│   ├── minimal-template.tsx
│   └── index.ts
├── auth/
│   ├── template.json
│   ├── auth-template.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── otp-step.tsx
│   └── index.ts
├── onboarding/
│   ├── template.json
│   ├── onboarding-template.tsx
│   ├── types.ts
│   ├── components/
│   │   └── onboarding-slide.tsx
│   └── index.ts
├── dashboard/
│   ├── template.json
│   ├── dashboard-template.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── stats-overview.tsx
│   │   └── activity-feed.tsx
│   └── index.ts
├── commerce/
│   ├── template.json
│   ├── commerce-template.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── product-card.tsx
│   │   └── category-filter.tsx
│   └── index.ts
├── settings/
│   ├── template.json
│   ├── settings-template.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── profile-section.tsx
│   │   └── preferences-section.tsx
│   └── index.ts
└── showcase/
    ├── template.json
    ├── showcase-template.tsx
    └── index.ts
```

### Contrat de `template.json`
Chaque template déclare son manifeste :
```json
{
  "id": "auth",
  "name": "Authentication Suite",
  "description": "Écrans modulaires de connexion, inscription et validation OTP",
  "version": "1.0.0",
  "componentName": "AuthTemplate",
  "entrypoint": "auth-template.tsx",
  "files": [
    "auth-template.tsx",
    "index.ts",
    "types.ts",
    "components/login-form.tsx",
    "components/register-form.tsx",
    "components/otp-step.tsx"
  ],
  "requiredComponents": [
    "button",
    "card",
    "text-input",
    "checkbox",
    "otp-input",
    "divider"
  ],
  "dependencies": [],
  "expoDependencies": [
    "expo-haptics"
  ],
  "supportsGlass": true
}
```

---

## 2. PILIER 2 : REGISTRY & DÉCOUVERTE DES TEMPLATES (`packages/cli/src/core/templates-registry.ts`)

- Module centralisant la lecture des `template.json` depuis le root de `@rashwright/ui-mobile`.
- Fonctions d'API publique :
  - `loadTemplatesRegistry(sourceRoot?: string): TemplateDefinition[]`
  - `getTemplateDefinition(templateId: string, sourceRoot?: string): TemplateDefinition | null`
  - `validateTemplateDefinition(def: unknown): boolean`
  - `resolveTemplateRequiredComponents(templateId: string, sourceRoot?: string): string[]`
- Commande `rs-ui list --templates` :
  - Affiche un tableau détaillé des templates disponibles, leur description, composants `rs-ui` requis et commande d'installation suggérée.

---

## 3. PILIER 3 : COMMANDE `rs-ui add --template <nom>` (ou `-t <nom>`)

Intégration transparente dans la commande existante `add` sans casser `rs-ui add <component...>` :
- Options :
  - `-t, --template <name>` : Installer un template complet.
  - `--overwrite` : Écraser les fichiers existants sans confirmation.
  - `--no-skills` : Ne pas installer les skills associés.
  - `--dry-run` : Simuler l'installation sans écriture ni installation de dépendances.

### Workflow d'exécution :
1. Vérification du projet cible et détection de `rashwright-ui.json`.
2. Résolution du template via `templates-registry`.
3. Calcul des composants manquants via `resolveDependencies()`.
4. Installation des composants UI requis dans `src/components/ui/` (avec préservation des fichiers modifiés).
5. Copie de l'arborescence du template dans `src/components/templates/<nom>/`.
6. Collecte et installation des dépendances Expo et NPM manquantes (en une seule passe).
7. Enregistrement dans `rashwright-ui.json` (`templates: { [id]: version }`).
8. Enregistrement dans `rashwright-ui.lock` avec empreintes SHA-256 de chaque fichier.
9. Déclenchement du hook `post-add` s'il est configuré.
10. Affichage des exemples d'import dans l'écran de l'application utilisateur.

---

## 4. PILIER 4 : INTÉGRATION AVEC `rs-ui init` & LOCKFILE MULTI-RÉPERTOIRES

- Réutilisation du même registry modulaire pour `rs-ui init --template <type>`.
- Copie des vrais fichiers du template plutôt que génération à base de chaînes multiline string.
- Suppression de l'ancienne fonction monolithique `generateTemplateScreenCode()`.
- Mise à jour du lockfile pour supporter la section `templates` :
  ```json
  {
    "lockfileVersion": 1,
    "components": { ... },
    "templates": {
      "auth": {
        "version": "1.0.0",
        "installedAt": "2026-10-09T...",
        "files": [
          { "path": "src/components/templates/auth/auth-template.tsx", "hash": "sha256:..." }
        ],
        "requiredComponents": ["button", "card", "text-input", "otp-input"]
      }
    }
  }
  ```

---

## 5. PILIER 5 : TESTS VITEST, QUALITY GATE & RELEASE V0.7.0

- Tests unitaires et d'intégration :
  - Validation du manifest de chaque template (`template.json`).
  - Résolution des composants et dépendances transitives.
  - Installation avec copie de sous-dossiers (`components/`).
  - Détection de conflits et fichiers modifiés par l'utilisateur.
  - Respect scrupuleux de `--dry-run`.
  - Intégration CLI `rs-ui add --template` et `rs-ui list --templates`.
- Quality Gate 100% vert : `validate-registry`, `check-types`, `test`, `build`, `smoke:all`.
- Documentation mise à jour (`README.md`, `packages/cli/README.md`, `packages/ui-mobile/README.md`, `ANALYSIS.md`).
- Préparation commit & release tag `v0.7.0`.
