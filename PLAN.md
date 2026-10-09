# PLAN DE DÉVELOPPEMENT — Rashwright UI Mobile (Roadmap v0.6.0)

> **Document de référence stratégique et technique.**
>
> Statut : **v0.5.0 Validée & Prête pour Release (107 tests Vitest réussis)**  
> Prochaine étape en développement : **v0.6.0 — Ecosystem Extensibility, CLI Hooks & Multi-Templates Engine**

---

## 0. BILAN DES VERSIONS PRÉCÉDENTES & CAP SUR LA V0.6.0

- **v0.3.0** : Themes élargis, Moteur Custom, 61 Skills IA, `rs-ui reset`.
- **v0.4.0** : Project State & Reliability Engine (Lockfile SHA-256, Backup/Restore, Smart Update, Inspecteur 360°, Graphe de dépendances).
- **v0.5.0** : Migrations Engine (`rs-ui migrate`), Scaffolder de composants projet (`rs-ui create component`), Registry Multi-Version (`@<version>`), Skills indépendants (`rs-ui skill`) et Monorepo awareness.

La **v0.6.0** finalise l'extensibilité et l'industrialisation de l'outil pour les équipes et les projets d'envergure.

---

## 1. PILIER 1 : SYSTÈME DE HOOKS CLI (`packages/cli/src/core/hooks-manager.ts`)

### 1.1 Objectif
Permettre aux projets d'exécuter des actions automatisées avant et après les opérations du CLI :
- `post-add` : Lancer automatiquement Prettier, ESLint ou régénérer les index.
- `pre-update` : Exécuter une suite de tests unitaires avant d'appliquer une mise à jour.
- `post-reset` : Nettoyer des caches d'assets locaux.

### 1.2 Configuration dans `rashwright-ui.json`
```json
{
  "hooks": {
    "post-add": "prettier --write src/components/ui",
    "pre-update": "bun test"
  }
}
```

---

## 2. PILIER 2 : MULTI-REGISTRES & REGISTRES PRIVÉS D'ORGANISATION (`rs-ui registry`)

### 2.1 Objectif
Permettre à un développeur ou une entreprise d'ajouter des sources de composants complémentaires en plus du registre officiel public.

### 2.2 Commandes
```bash
# Ajouter un registre personnalisé ou interne
rs-ui registry add internal https://registry.internal.corp/ui

# Lister les registres enregistrés
rs-ui registry list

# Installer un composant depuis un registre spécifique
rs-ui add @internal/auth-modal
```

---

## 3. PILIER 3 : MOTEUR DE TEMPLATES STARTERS ÉLARGI (`rs-ui init --template`)

### 3.1 Objectif & Philosophie
Fournir des points de départ pré-packagés, élégants et immédiatement utilisables selon la typologie d'application visée.
**Règle d'or** : Tous les templates sont composés **exclusivement avec les composants officiels `rs-ui`**, avec un design soigné, simple, responsive et compatible thèmes clairs/sombres & Liquid Glass.

### 3.2 Catalogue des Templates
1. **`minimal`** : Écran vierge minimaliste avec wrapper ThemeProvider et typographies prêtes.
2. **`showcase`** (défaut) : Écran complet de démonstration des composants et primitives Liquid Glass.
3. **`auth`** (Écrans de Connexion & Inscription) :
   - Écran de Login / Sign Up complet.
   - Utilise `Button`, `TextInput`, `OtpInput`, `Form`, `Checkbox`, `Divider`, `Card` et `LiquidGlassView`.
4. **`onboarding`** (Écrans d'Accueil & Présentation) :
   - Carrousel ou étapes animées d'accueil.
   - Utilise `Carousel`, `Dot`, `Button`, `StatCard`, `Badge` et `LiquidPressable`.
5. **`dashboard`** (Tableau de Bord Mobile) :
   - Vue métriques et activité récente.
   - Utilise `StatCard`, `DataTable`, `Avatar`, `Badge`, `Progress`, `ActionsGrid` et `Tabs`.
6. **`commerce`** (Boutique & Produits) :
   - Catalogue avec filtres et panier.
   - Utilise `Card`, `SearchInput`, `Rating`, `Chip`, `FloatingActionButton` et `Badge`.
7. **`settings`** (Paramètres & Profil) :
   - Écran de configuration utilisateur.
   - Utilise `Avatar`, `Switch`, `Select`, `Divider`, `Confirm` et `Modal`.

---

## 4. PILIER 4 : VALIDATION, QUALITY GATE & RELEASE V0.6.0
- Maintien du Quality Gate 100% vert (tests unitaires complets sur hooks, registry et templates).
- Mise à jour synchronisée de la documentation utilisateur et technique.
