# PLAN DE DÉVELOPPEMENT — Rashwright UI Mobile (Roadmap v0.5.0)

> **Document de référence stratégique et technique.**
>
> Statut : **v0.4.0 Complètement validée et prête pour release**  
> Prochaine étape en développement : **v0.5.0 — Migrations Engine, Project Extensibility & Multi-Registry**

---

## 0. BILAN V0.4.0 & VISION DE LA V0.5.0

L'étape charnière du **Project State & Reliability Engine** a été franchie avec succès en **v0.4.0** :
- Lockfile réel avec signatures SHA-256 (`rashwright-ui.lock`)
- Moteur de sauvegardes et restauration (`rs-ui backup` / `rs-ui restore`)
- Smart Update chirurgical (`rs-ui update --check`, `-i`, `--diff`) avec protection des modifications locales
- Inspecteur 360° et graphe de dépendances (`rs-ui info`, `rs-ui deps`, `rs-ui why`)

La **v0.5.0** concrétise les besoins avancés identifiés dans `errors.md` :
1. **Moteur de Migrations Système (`rs-ui migrate`)** : Gérer les ruptures de structure et de versions (v0.3 → v0.4 → v0.5) sans casser le code projet.
2. **Support des Composants Personnalisés du Projet (`rs-ui create component <nom>`)** : Permettre au projet de déclarer ses propres composants et générer automatiquement son `SKILL.md`.
3. **Registry Multi-Versions (`rs-ui add <composant>@<version>`)** : Possibilité d'épingler une version spécifique d'un composant.
4. **Skills Management Distribué (`rs-ui skill update / list`)** : Mettre à jour l'intelligence IA indépendamment du code source copié.
5. **Monorepo & Workspace Awareness** : Détection fine des racines de workspaces Expo / Bun pour cibler les bons paquets.

---

## 1. PILIER 1 : MOTEUR DE MIGRATIONS SYSTÈME (`rs-ui migrate`)

### 1.1 Contexte & Enjeu
Lorsqu'une mise à jour implique des changements de structure globale (déplacement de répertoires, nouvelles options requises dans `rashwright-ui.json`, renommage de primitives ou tokens dans le thème, mise à jour des signatures de lockfile), un simple remplacement de fichier est insuffisant.

### 1.2 Architecture
```text
packages/cli/src/migrations/
├── migration-runner.ts       ← Détecte la version actuelle du projet et orchestre la chaîne de migration
└── registry/
    ├── 0.3.0-to-0.4.0.ts     ← Migration des projets v0.3 (création lockfile initial, ajout starter flags)
    └── 0.4.0-to-0.5.0.ts     ← Migration v0.4 vers v0.5 (support project components, schema update)
```

### 1.3 Commandes & Comportement
- `rs-ui migrate [--check] [--dry-run]` : Analyse les migrations en attente et les exécute séquentiellement.
- Intégration transparente : `rs-ui update` propose automatiquement d'exécuter `rs-ui migrate` si un changement de structure majeure est détecté.
- Sauvegarde de précaution automatique avant chaque lot de migrations via `createBackup(cwd, { trigger: "auto-migration" })`.

---

## 2. PILIER 2 : COMPOSANTS PROJET & CRÉATEUR DE COMPOSANTS (`rs-ui create`)

### 2.1 Contexte & Enjeu
Dans les architectures d'entreprise ou d'applications complètes (Immo360, Kokowa, etc.), les projets créent leurs propres composants qui doivent suivre les conventions Rashwright UI (tokens de thème, primitives Glass, et documentation IA pour les agents de code).

### 2.2 Commandes
```bash
# Crée un nouveau composant projet aux normes Rashwright UI avec son Skill IA associé
rs-ui create component product-card --category "Commerce" --glass

# Génère :
#  • components/ui/product-card.tsx
#  • skills/rs-ui/product-card/SKILL.md
#  • Enregistre le composant sous "projectComponents" dans rashwright-ui.json
```

---

## 3. PILIER 3 : REGISTRY MULTI-VERSIONS (`rs-ui add <name>@<version>`)

### 3.1 Contexte & Enjeu
Permettre à un projet figé sur un SDK Expo spécifique d'installer une version antérieure compatible d'un composant, ou d'installer des tags (`latest`, `next`, `0.3.0`).

### 3.2 Commandes & Fonctionnalités
- `rs-ui add button@0.3.0` : Télécharge et installe la signature exacte de la version 0.3.0.
- `rs-ui list --versions button` : Affiche l'historique des versions publiées du composant.

---

## 4. PILIER 4 : GESTION DES SKILLS IA DÉCORRÉLÉE (`rs-ui skill`)

### 4.1 Contexte & Enjeu
Les instructions pour les agents IA évoluent plus rapidement que le code natif. Les développeurs doivent pouvoir actualiser la documentation d'un composant sans toucher à leur code fonctionnel modifié.

### 4.2 Commandes
- `rs-ui skill list` : Liste l'ensemble des Skills IA installés et leurs versions respectives.
- `rs-ui skill update [nom] [--all]` : Met à jour uniquement les fichiers `SKILL.md` sans modifier le code source des composants.
- `rs-ui skill doctor` : Vérifie la parité entre composants installés et compétences IA présentes dans le projet.

---

## 5. PILIER 5 : MONOREPO & WORKSPACE AWARENESS

### 5.1 Contexte & Enjeu
Éviter d'installer les composants à la racine d'un monorepo Bun / Turborepo. Détecter si l'application Expo se trouve dans `apps/mobile/` et pointer automatiquement les alias TypeScript et le lockfile dans le package adéquat.
