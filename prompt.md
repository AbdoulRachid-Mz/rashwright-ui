# Prompt maître — Rashwright UI Mobile v0.1.0 (STABILISÉ)

> **⚠️ Ce document est la spécification ORIGINELLE (hors champ). Une grande partie a été implémentée.**
>
> - Si tu **ajoutes un composant** → références-toi à CONTRIBUTOR.md (§Ajouter un composant)
> - Si tu **corrige un bug** → 1) reproduis via `rs-ui doctor`, 2) lis CONTRIBUTOR.md §Debug, 3) utilise `check-types` + `validate-registry` après chaque changement.
> - Si tu **publies** → ordre : ui-mobile PUIS cli (CLI dépend de @rashwright/ui-mobile).

---

## Ce prompt ne contient PAS les dernières corrections de bugs réels.

Utilise ces docs comme source de vérité **actuelle** :

| Document | Usage |
|---|---|
| `ANALYSIS.md §4/5/6` | P0/P1 100% résolus, P2 détectés encore à faire |
| `PLAN.md §4 §5` | Vérifications post-tâches + checklist pre-publish |
| `errors.md §1 §2 §3` | Objectifs atteints + restant |
| `CONTRIBUTOR.md` | Comment contribuer : scripts, tsconfig, ajouter composant, publier |
| `Quick-Start.md` | Démarrer workspace |
| `README.md (racine)` | Guide développeur utilisateur final |

---

## Rappel du scope original (sections 1→110)

Voir l'historique git pour la version complète. Les sections 0 → 110 décrivent :
- la mission (système UI distribuable à la shadcn/ui pour React Native/Expo)
- la philosophie (code copié dans projet user, propriété totale)
- les commandes officielles CLI : init, add, list, info, doctor, remove, update, avec `--yes`, `--dry-run`, `--json`, `--glass`, `--all`, `--theme`, `--force`, `--no-reset`, `--no-interactive`, `--non-interactive` (alias).
- le registry central JSON (55 composants), la compatibilité matricielle Expo SDK 54-58, les 8 liquid primitives (glass border/blur/blob/highlight/surface/pressable/glow/shadow), le moteur thèmes (6 presets default/emerald/violet/amber/rose/slate).

Tout est implémenté dans v0.1.0 publié.
