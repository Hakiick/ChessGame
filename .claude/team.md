# Équipe Agentique — Chess Fighter Rebuild

> Généré par `/init-project` — 2026-02-19
> Projet : Chess Fighter Rebuild (Next.js 14 + React + TypeScript)

## Agents core (toujours présents)

### `forge`
**Rôle** : Team Lead — orchestre les agents, décompose les US, gère les feedback loops
**Modèle** : **Opus 4.6** (obligatoire)
**Toujours présent** : oui (c'est l'orchestrateur principal)

### `stabilizer`
**Rôle** : Quality gate — build, tests, lint, type-check
**Modèle** : **Opus 4.6**
**Toujours présent** : oui (toujours en dernier dans le pipeline)
**Responsabilités** :
- Lancer `bash scripts/stability-check.sh`
- Corriger les problèmes simples (lint, format)
- Renvoyer les problèmes complexes (types, logique) au dev

### `reviewer`
**Rôle** : Revue de code qualité + sécurité + accessibilité
**Modèle** : **Opus 4.6**
**Quand l'utiliser** : US de priorité haute ou touchant un domaine critique

---

## Agents spécialisés Chess Fighter

### `chess-engine-dev` (NOUVEAU)
**Rôle** : Spécialiste moteur d'échecs TypeScript — port Java, règles FIDE complètes
**Modèle** : **Opus 4.6**
**Skill** : `/chess-engine-dev`
**Domaine** : `src/engine/**` — Board, pièces, check/checkmate/stalemate, castling, en passant, promotion, notation
**US assignées** : US-02, US-08
**Responsabilités** :
- Porter le moteur Java en TypeScript pur (0 dépendance React)
- Implémenter les règles FIDE manquantes (castling, checkmate, stalemate, draws)
- Écrire les tests unitaires (> 90% couverture)
- Implémenter la notation algébrique et PGN

### `frontend-dev` (MIS À JOUR)
**Rôle** : Développeur frontend React + Next.js 14 — UI/UX, composants, pages
**Modèle** : **Opus 4.6**
**Skill** : `/frontend-dev`
**Domaine** : `src/components/**`, `src/app/**` — pages, composants UI, layout
**US assignées** : US-01, US-03, US-04, US-05, US-06, US-07, US-08
**Responsabilités** :
- Composants React avec TypeScript strict
- Pages Next.js App Router
- Tailwind CSS mobile-first
- Framer Motion animations UI

### `vfx-dev` (NOUVEAU)
**Rôle** : Spécialiste effets visuels WOW — particules, shakes, confetti, trails
**Modèle** : **Opus 4.6**
**Skill** : `/vfx-dev`
**Domaine** : `src/components/effects/**` — Canvas 2D, Framer Motion animations
**US assignées** : US-07
**Responsabilités** :
- Particules Canvas 2D sur capture (60fps)
- Shake + flash sur échec
- Confetti + overlay sur checkmate
- Trails, glows, animations de promotion
- Respect de `prefers-reduced-motion`

### `screenshot-artist` (NOUVEAU)
**Rôle** : Capture média — screenshots Playwright, vidéo FFmpeg
**Modèle** : **Opus 4.6**
**Skill** : `/screenshot-artist`
**Domaine** : `tests/e2e/screenshots.spec.ts`, `tests/e2e/demo-video.spec.ts`, `scripts/generate-*`
**US assignées** : US-11, US-12
**Responsabilités** :
- 38+ screenshots automatisés (4 thèmes × 3 viewports × scènes)
- Vidéo de démo 1080p 60fps avec séquence scriptée
- Post-production FFmpeg
- Galerie SCREENSHOTS.md

---

## Agents mobile-first (pré-configurés)

### `mobile-dev`
**Rôle** : Développeur mobile-first — responsive, touch, viewport, performance
**Modèle** : **Opus 4.6**
**Skill** : `/mobile-dev`
**US assignées** : US-03, US-04, US-05, US-07

### `responsive-tester`
**Rôle** : Testeur responsive — breakpoints, viewports, touch, accessibilité
**Modèle** : **Opus 4.6**
**Skill** : `/responsive-tester`
**US assignées** : US-10

### `pwa-dev`
**Rôle** : Spécialiste PWA — service worker, manifest, offline, installabilité
**Modèle** : **Opus 4.6**
**Skill** : `/pwa-dev`
**US assignées** : US-09

---

## Agents génériques (fallback)

### `architect`
**Modèle** : **Opus 4.6**
**Rôle** : Planification architecture (read-only)
**US assignées** : US-01

### `developer`
**Modèle** : **Opus 4.6**
**Rôle** : Développeur générique (quand aucun spécialiste ne correspond)
**US assignées** : US-02, US-06, US-08, US-12

### `tester`
**Modèle** : **Opus 4.6**
**Rôle** : Tests unitaires et d'intégration
**US assignées** : US-02, US-03, US-11, US-12

---

## Assignation US → Agents

| US | Agents (ordre d'exécution) |
|----|---------------------------|
| US-01 | architect → frontend-dev → stabilizer |
| US-02 | chess-engine-dev → tester → stabilizer |
| US-03 | mobile-dev + frontend-dev → tester → stabilizer |
| US-04 | frontend-dev + mobile-dev → stabilizer |
| US-05 | mobile-dev + frontend-dev → stabilizer |
| US-06 | frontend-dev + developer → stabilizer |
| US-07 | vfx-dev + frontend-dev + mobile-dev → stabilizer |
| US-08 | chess-engine-dev + frontend-dev → developer → stabilizer |
| US-09 | pwa-dev → stabilizer |
| US-10 | responsive-tester → reviewer → stabilizer |
| US-11 | screenshot-artist → tester → stabilizer |
| US-12 | screenshot-artist + developer → tester → stabilizer |

---

## Règles d'équipe

1. Le **stabilizer** intervient TOUJOURS en dernier
2. Les agents de planification (architect) interviennent TOUJOURS en premier
3. Au moins un agent de développement est TOUJOURS présent
4. L'ordre d'exécution suit le tableau ci-dessus
5. Le **forge** évalue le résultat de chaque agent avant de passer au suivant

## Modèles par catégorie

| Catégorie | Agents | Modèle |
|-----------|--------|--------|
| Orchestration | forge, init-project, next-feature | **Opus 4.6** |
| Planification | architect | **Opus 4.6** |
| Moteur échecs | chess-engine-dev | **Opus 4.6** |
| Frontend | frontend-dev, mobile-dev | **Opus 4.6** |
| Effets visuels | vfx-dev | **Opus 4.6** |
| PWA | pwa-dev | **Opus 4.6** |
| Capture média | screenshot-artist | **Opus 4.6** |
| Revue | reviewer | **Opus 4.6** |
| Test | tester, responsive-tester | **Opus 4.6** |
| Validation | stabilizer | **Opus 4.6** |

**IMPORTANT : Tous les agents Task() utilisent `model: "opus"`. Jamais de sonnet ni haiku.**
