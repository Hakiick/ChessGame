teur FORGE du projet Chess Fighter Rebuild.
 
# MISSION
Rebuild complet de "Chess Fighter", un jeu d'échecs Java Swing étudiant,
en une application web Next.js 14 avec des effets visuels WOW, puis capturer
des screenshots et une vidéo de démonstration époustouflante.
 
# CONTEXTE
Le code source Java est dans src/main/java/main/ — c'est ta référence pour
le moteur d'échecs. L'app originale a :
- 6 types de pièces avec mouvements corrects
- 3 thèmes (Classic, Marvel, Pokemon)
- Timers, scores, menu
- PAS de checkmate/stalemate/castling complets
 
# OBJECTIFS
1. REBUILD : Recréer l'app en Next.js 14 + React + TypeScript + Framer Motion
2. PIMP : Ajouter un 4ème thème "Neon" cyberpunk, des animations époustouflantes
   (particules sur capture, shake sur échec, confettis sur mat, trails lumineux)
3. CAPTURE : Screenshots automatisés (4 thèmes × 3 viewports × scènes clés)
4. DEMO : Vidéo de démonstration 60-90s avec séquence scriptée
 
# FICHIERS DE RÉFÉRENCE
Lis ces fichiers dans l'ordre avant de commencer :
1. orchestrator/project.md    — Specs complètes, stack, user stories
2. orchestrator/CLAUDE.md     — Règles de qualité et standards
3. orchestrator/workflow.md   — Pipeline de développement par US
4. orchestrator/team.md       — Rôles des agents et règles d'exécution
5. orchestrator/prompts/      — Prompts détaillés pour chaque agent
 
# PIPELINE
Pour chaque User Story (US-01 à US-12), suis le pipeline :
FORGE(assign) → ARCHITECT(plan) → DEVELOPER(code) → TESTER(test) → REVIEWER(review) → STABILIZER(stabilize) → FORGE(merge)
 
# PHASES
Phase 1 — Foundation (US-01 à US-04) : scaffold, moteur d'échecs, board, thèmes
Phase 2 — Features (US-05 à US-08) : landing, joueurs/timers, effets WOW, replay
Phase 3 — Polish & Demo (US-09 à US-12) : PWA, a11y, screenshots, vidéo démo
 
# CRITÈRES DE SUCCÈS
- Le jeu est jouable en PvP local avec toutes les règles FIDE
- 4 thèmes visuels avec transitions animées
- Effets WOW sur capture, check, checkmate, promotion
- 38+ screenshots haute qualité générés automatiquement
- 1 vidéo de démo 1080p 60fps
- Lighthouse > 90 sur les 4 métriques
- Tests > 80% couverture
- WCAG AA accessible
 
# COMMENCE
1. Lis les fichiers de référence
2. Vérifie l'environnement (node, npm)
3. Crée board.md avec l'état initial
4. Lance US-01 : scaffold Next.js 14
```
 
---
 
## VARIANTES DU PROMPT
 
### Version Courte (si contexte limité)
 
```
Rebuild "Chess Fighter" (jeu d'échecs Java Swing dans src/main/java/main/)
en app web Next.js 14 + React + Framer Motion + Tailwind.
 
Lis orchestrator/project.md pour les specs et orchestrator/workflow.md pour le pipeline.
 
Objectifs : app jouable avec règles FIDE complètes, 4 thèmes (Classic/Marvel/Pokemon/Neon),
effets WOW (particules, shakes, confettis), screenshots Playwright, vidéo démo 1080p.
 
Suis les 12 User Stories dans l'ordre. Stabilise (build+test+lint) entre chaque US.
```
 
### Version Focus Screenshots Only
 
```
L'app Chess Fighter est déjà buildée dans chess-fighter/.
Ta mission : créer des screenshots et une vidéo de démonstration.
 
Lis orchestrator/prompts/screenshot-artist.md pour les instructions détaillées.
 
Crée :
1. tests/e2e/screenshots.spec.ts — capture 38+ screenshots
   (4 thèmes × 3 viewports × scènes : menu, game, check, checkmate)
2. tests/e2e/demo-video.spec.ts — vidéo 60-90s montrant :
   menu → thèmes → partie → capture → échec → mat → mobile → outro
3. scripts/generate-demo.ts — post-production FFmpeg
4. SCREENSHOTS.md — galerie auto-générée
 
Commandes : npx playwright test tests/e2e/screenshots.spec.ts
```
 
### Version Focus Effets WOW Only
 
```
L'app Chess Fighter a un échiquier fonctionnel mais manque d'effets visuels.
Ta mission : ajouter les effets WOW qui rendent l'app inoubliable.
 
Effets à implémenter :
1. CAPTURE de pièce → explosion de 20-30 particules (Canvas 2D, 600ms, couleurs du thème)
2. ÉCHEC → flash rouge sur le roi + shake du board (800ms) + son dramatique
3. ÉCHEC ET MAT → overlay sombre + "CHECKMATE" animé + confettis (canvas-confetti) + son victoire
4. PROMOTION → pièce qui grandit + flash + sélecteur en arc de cercle
5. DÉPLACEMENT → trail lumineux derrière la pièce (opacity fadeout)
6. SÉLECTION → glow doré + scale 1.1 (Framer Motion spring)
 
Contraintes :
- 60fps constant (transform + opacity uniquement)
- prefers-reduced-motion : désactiver les effets
- Chaque effet débrayable dans Settings
- Framer Motion pour les animations React, Canvas 2D pour les particules
```
 
---
 
## NOTES D'UTILISATION
 
### Environnement Requis
- Node.js 18+ et npm
- Git configuré
- Playwright (installé via npx playwright install)
- FFmpeg (pour la vidéo de démo)
 
### Lancement sur Claude Code Mobile
Si tu utilises le framework setup-claude-code-mobile-first :
1. Place les fichiers du dossier `orchestrator/` à la racine du workspace
2. Le CLAUDE.md devient le CLAUDE.md global du projet
3. Chaque prompt dans `prompts/` devient un SKILL.md dans `.claude/skills/`
4. Utilise `dispatch.sh` et `collect.sh` pour orchestrer les agents dans tmux
 
### Adaptation
- **Budget temps limité** : skip US-08 (replay), US-09 (PWA), US-10 (a11y)
- **Pas de FFmpeg** : skip US-12, garder uniquement les screenshots
- **Pas de 3D** : retirer Three.js/R3F, rester 100% 2D
- **Thème unique** : commencer par Neon seul, ajouter les autres après
