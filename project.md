# Chess Fighter Rebuild

## Project overview

Rebuild complet de "Chess Fighter", un jeu d'échecs Java Swing étudiant (Epitech T-JAV-501),
en application web moderne Next.js 14 avec des effets visuels WOW, 4 thèmes,
règles FIDE complètes, et une démo automatisée (screenshots + vidéo).

Le code source Java de référence est dans `src/main/java/main/`.

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + Framer Motion 11
- **Styling** : Tailwind CSS 3
- **Language** : TypeScript (strict mode)
- **Tests** : Vitest (unitaires) + Playwright (E2E + screenshots)
- **Linter** : ESLint + Prettier
- **PWA** : Workbox (Service Worker) + Web App Manifest
- **Animations** : Framer Motion + Canvas 2D (particules)
- **Video** : FFmpeg (post-production démo)

---

## Architecture

```
chess-fighter/
├── src/
│   ├── app/                    # Next.js App Router (pages, layout)
│   │   ├── layout.tsx          # Root layout (ThemeProvider, fonts)
│   │   ├── page.tsx            # Landing page
│   │   ├── play/
│   │   │   └── page.tsx        # Game page (board + UI)
│   │   └── settings/
│   │       └── page.tsx        # Theme selection
│   ├── components/
│   │   ├── ui/                 # Composants UI (Button, Card, Badge, Modal)
│   │   ├── board/              # Échiquier (Board, Square, Piece, DragLayer)
│   │   ├── game/               # UI jeu (Clock, MoveList, GameOver, Promotion)
│   │   ├── effects/            # Effets WOW (Particles, Confetti, Shake, Trail)
│   │   └── layout/             # Layout (Header, Nav, Footer)
│   ├── engine/                 # Moteur d'échecs TypeScript
│   │   ├── board.ts            # État du plateau, make/undo move
│   │   ├── pieces/             # 6 pièces (King, Queen, Rook, Bishop, Knight, Pawn)
│   │   ├── moves.ts            # Génération de coups légaux
│   │   ├── check.ts            # Détection échec, mat, pat
│   │   ├── rules.ts            # Règles spéciales (castling, en passant, promotion)
│   │   ├── notation.ts         # Notation algébrique + PGN
│   │   └── types.ts            # Types partagés (Color, PieceType, Square, Move)
│   ├── themes/                 # Système de thèmes
│   │   ├── provider.tsx        # ThemeProvider (React Context)
│   │   ├── classic.ts          # Thème Classic
│   │   ├── marvel.ts           # Thème Marvel
│   │   ├── pokemon.ts          # Thème Pokemon
│   │   └── neon.ts             # Thème Neon (cyberpunk)
│   ├── hooks/                  # Custom hooks
│   │   ├── useChessGame.ts     # Hook principal du jeu
│   │   ├── useDragPiece.ts     # Drag & drop (mouse + touch)
│   │   ├── useChessClock.ts    # Horloge countdown
│   │   └── useMediaQuery.ts    # Responsive breakpoints
│   ├── lib/                    # Utilitaires
│   │   ├── cn.ts               # className helper (clsx + twMerge)
│   │   └── storage.ts          # localStorage wrapper (scores, settings)
│   └── styles/
│       └── globals.css         # Tailwind base + design tokens + breakpoints
├── public/
│   ├── pieces/                 # Assets pièces (4 thèmes × 2 couleurs × 6 pièces)
│   │   ├── classic/
│   │   ├── marvel/
│   │   ├── pokemon/
│   │   └── neon/
│   ├── backgrounds/            # Fonds d'échiquier par thème
│   ├── sounds/                 # Sons (move, capture, check, checkmate)
│   ├── icons/                  # Icônes PWA multi-tailles
│   ├── manifest.json           # Web App Manifest
│   └── sw.js                   # Service Worker
├── tests/
│   ├── unit/                   # Tests Vitest (engine, hooks)
│   │   ├── engine/             # Tests moteur (pièces, check, rules)
│   │   └── hooks/              # Tests hooks
│   └── e2e/                    # Tests Playwright
│       ├── game.spec.ts        # Tests gameplay
│       ├── screenshots.spec.ts # Capture screenshots automatisés
│       └── demo-video.spec.ts  # Vidéo de démonstration
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## Référence Java

Le code source Java dans `src/main/java/main/` implémente :

| Fichier Java | Fonctionnalité | Port TypeScript |
|-------------|----------------|-----------------|
| `Board.java` (519 lignes) | Plateau 8x8, validation moves, tours | `engine/board.ts` |
| `CheckScanner.java` (177 lignes) | Détection échec (8 directions, cavalier, pion) | `engine/check.ts` |
| `pieces/*.java` (7 fichiers) | 6 types de pièces + base class | `engine/pieces/*.ts` |
| `Move.java` | Représentation d'un coup | `engine/types.ts` |
| `Input.java` | Drag & drop souris | `hooks/useDragPiece.ts` |
| `Main.java` | Timers, frame setup | `hooks/useChessClock.ts` |
| `Menu.java` | Menu principal animé | `app/page.tsx` |
| `Settings.java` | Sélection thème | `app/settings/page.tsx` |
| `ControlPanel.java` | Noms joueurs, choix timer | `components/game/PlayerSetup.tsx` |
| `Player.java` | Joueur + scores persistés | `lib/storage.ts` |

### Ce que le Java implémente

- 6 types de pièces avec mouvements corrects
- En passant
- Promotion (auto-Queen, sans choix)
- Détection d'échec (multi-directionnelle)
- 3 thèmes (Classic, Marvel, Pokemon)
- Timers countdown
- Scores persistés dans file.txt
- Sons (click, erreur)

### Ce que le Java N'implémente PAS (à ajouter)

- Castling (petit roque, grand roque)
- Promotion avec choix de pièce (Q/R/B/N)
- Détection checkmate
- Détection stalemate (pat)
- Règle des 50 coups
- Répétition triple
- Matériel insuffisant
- Notation algébrique
- Historique de coups / undo
- 4ème thème Neon

---

## User Stories

### Phase 1 — Foundation (haute priorité)

- [US-01] Scaffold Next.js 14 + Design System | Setup Next.js 14 App Router, TypeScript strict, Tailwind CSS, Framer Motion, ESLint, Prettier, Vitest, Playwright. Design tokens (couleurs, typo, spacing), breakpoints mobile-first, composants UI de base (Button, Card, Badge, Modal). | haute
  - Team: architect, frontend-dev, stabilizer
  - Critères d'acceptance:
    - [ ] `npm run build` passe sans erreur
    - [ ] `npm run lint` clean
    - [ ] `npm run type-check` clean
    - [ ] Design tokens définis dans globals.css
    - [ ] Breakpoints mobile-first configurés
    - [ ] Lighthouse > 90 sur page vide
  - Fichiers: package.json, tsconfig.json, tailwind.config.ts, next.config.js, src/styles/globals.css, src/components/ui/*, src/app/layout.tsx

- [US-02] Moteur d'échecs TypeScript | Port complet du moteur Java en TypeScript. 6 pièces avec mouvements FIDE complets : castling (kingside + queenside), en passant, promotion avec choix (Q/R/B/N), checkmate, stalemate, 50-move rule, threefold repetition, insufficient material. Tests unitaires > 90% couverture. | haute | après:US-01
  - Team: developer, tester, stabilizer
  - Critères d'acceptance:
    - [ ] Tous les mouvements de base identiques au Java
    - [ ] Castling kingside et queenside fonctionnel
    - [ ] En passant fonctionnel
    - [ ] Promotion avec choix (Q/R/B/N)
    - [ ] Détection checkmate correcte
    - [ ] Détection stalemate correcte
    - [ ] 50-move rule implémentée
    - [ ] Threefold repetition détectée
    - [ ] Insufficient material détecté
    - [ ] Tests unitaires > 90% couverture moteur
  - Fichiers: src/engine/**/*.ts, tests/unit/engine/**/*.test.ts

- [US-03] Échiquier interactif React | Composant Board responsive : rendu 8x8, pièces SVG/PNG, drag & drop (mouse + touch), highlight coups valides, indication dernier coup, coordonnées (a-h, 1-8). Mobile-first : plein écran mobile, centré desktop. | haute | après:US-02
  - Team: mobile-dev, frontend-dev, tester, stabilizer
  - Critères d'acceptance:
    - [ ] Board rendu correctement avec alternance couleurs
    - [ ] Pièces affichées aux bonnes positions
    - [ ] Drag & drop fonctionnel (souris ET touch)
    - [ ] Coups valides highlightés au clic/tap
    - [ ] Dernier coup indiqué visuellement
    - [ ] Coordonnées affichées (a-h, 1-8)
    - [ ] Responsive : plein écran mobile (< 640px), centré desktop
    - [ ] Touch targets minimum 44x44px
    - [ ] 60fps pendant le drag
  - Fichiers: src/components/board/*, src/hooks/useDragPiece.ts, src/hooks/useChessGame.ts

- [US-04] Système de 4 thèmes | ThemeProvider React Context, switch instantané entre 4 thèmes. Classic (assets Java portés), Marvel, Pokemon, Neon (nouveau cyberpunk). Fond échiquier, pièces, couleurs UI, sons adaptés par thème. Transition animée (Framer Motion). | haute | après:US-03
  - Team: frontend-dev, mobile-dev, stabilizer
  - Critères d'acceptance:
    - [ ] 4 thèmes complets avec pièces et fonds
    - [ ] ThemeProvider fonctionnel (React Context)
    - [ ] Switch de thème < 200ms sans flash/CLS
    - [ ] Thème Neon : design cyberpunk avec néons, grille futuriste
    - [ ] Transition animée entre thèmes (Framer Motion)
    - [ ] Thème persisté en localStorage
    - [ ] Assets optimisés (WebP, lazy-loaded)
  - Fichiers: src/themes/*, public/pieces/*, public/backgrounds/*

### Phase 2 — Features (haute priorité)

- [US-05] Landing page + menu animé | Page d'accueil "Chess Fighter" avec titre animé, preview des 4 thèmes, navigation (Play, Settings, About). Animations d'entrée Framer Motion. Responsive mobile-first. | haute | après:US-04
  - Team: mobile-dev, frontend-dev, stabilizer
  - Critères d'acceptance:
    - [ ] Titre "Chess Fighter" animé (Framer Motion)
    - [ ] Preview des 4 thèmes cliquable
    - [ ] Navigation claire : Play, Settings
    - [ ] Animations d'entrée fluides (60fps)
    - [ ] Responsive : stack vertical mobile, grid desktop
    - [ ] LCP < 2s
  - Fichiers: src/app/page.tsx, src/app/settings/page.tsx, src/components/layout/*

- [US-06] Setup joueurs + horloges d'échecs | Saisie noms joueurs, sélection durée (1/5/10/30 min). Horloge countdown duale avec indicateur tour actif, pause. Game over sur temps écoulé, checkmate, stalemate, draw. Scores persistés localStorage. | haute | après:US-03
  - Team: frontend-dev, developer, stabilizer
  - Critères d'acceptance:
    - [ ] Formulaire de setup joueurs (noms + timer)
    - [ ] Horloges countdown duales fonctionnelles
    - [ ] Indicateur visuel du tour actif
    - [ ] Pause fonctionnelle
    - [ ] Game over sur toutes les conditions (temps, mat, pat, draw)
    - [ ] Dialog game over avec scores et option restart
    - [ ] Scores persistés en localStorage
    - [ ] Timers précis (±1s de dérive max)
  - Fichiers: src/components/game/PlayerSetup.tsx, src/components/game/Clock.tsx, src/components/game/GameOver.tsx, src/hooks/useChessClock.ts, src/lib/storage.ts

- [US-07] Effets visuels WOW | Capture: explosion 20-30 particules Canvas 2D (couleurs thème, 600ms). Échec: flash rouge roi + shake board (800ms). Checkmate: overlay sombre + "CHECKMATE" animé + confetti. Promotion: pièce grandit + flash + sélecteur arc. Déplacement: trail lumineux. Sélection: glow + scale 1.1. Tout débrayable, prefers-reduced-motion respecté. | haute | après:US-04,US-06
  - Team: frontend-dev, mobile-dev, stabilizer
  - Critères d'acceptance:
    - [ ] Particules sur capture (Canvas 2D, 20-30, 600ms)
    - [ ] Flash rouge + shake sur échec (800ms)
    - [ ] Overlay + "CHECKMATE" + confetti sur mat
    - [ ] Animation promotion avec sélecteur
    - [ ] Trail lumineux sur déplacement
    - [ ] Glow + scale sur sélection
    - [ ] 60fps constant pendant les effets
    - [ ] prefers-reduced-motion : effets désactivés
    - [ ] Toggle on/off dans settings
    - [ ] 0 layout shift (CLS < 0.1)
  - Fichiers: src/components/effects/*, src/components/board/*, src/hooks/useEffects.ts

- [US-08] Historique de coups + replay | Notation algébrique standard (e4, Nf3, O-O, Qxd7+, etc.). Panel move list scrollable avec highlight coup courant. Undo/redo. Navigation dans l'historique (premier, précédent, suivant, dernier). | haute | après:US-06
  - Team: developer, frontend-dev, stabilizer
  - Critères d'acceptance:
    - [ ] Notation algébrique conforme PGN
    - [ ] Move list scrollable, auto-scroll au dernier coup
    - [ ] Highlight du coup courant dans la liste
    - [ ] Undo/redo fonctionnel (boutons + raccourcis clavier)
    - [ ] Navigation : |<  <  >  >| (premier, prev, next, dernier)
    - [ ] Board se met à jour en temps réel à la navigation
    - [ ] Responsive : panel en dessous sur mobile, à droite sur desktop
  - Fichiers: src/engine/notation.ts, src/components/game/MoveList.tsx, src/hooks/useChessGame.ts

### Phase 3 — Polish & Demo (priorité moyenne)

- [US-09] PWA Setup | Service Worker Workbox, Web App Manifest, icônes multi-tailles (192, 512), splash screen. Stratégie cache offline-first (assets + game state). Install prompt. | moyenne | après:US-07
  - Team: pwa-dev, stabilizer
  - Critères d'acceptance:
    - [ ] Service Worker enregistré et fonctionnel
    - [ ] Manifest avec icônes, couleurs, display standalone
    - [ ] App installable sur mobile (Chrome, Safari)
    - [ ] Jouable offline (assets cachés)
    - [ ] Lighthouse PWA > 90
  - Fichiers: public/manifest.json, public/sw.js, src/app/layout.tsx, public/icons/*

- [US-10] Responsive polish + accessibilité WCAG AA | Audit responsive complet (tous breakpoints). ARIA labels, rôles sémantiques, focus management clavier. Contraste WCAG AA (4.5:1 texte, 3:1 grands). Touch targets 44×44px. Lighthouse > 90 mobile sur les 4 métriques. | moyenne | après:US-07
  - Team: responsive-tester, reviewer, stabilizer
  - Critères d'acceptance:
    - [ ] Responsive OK sur 5 breakpoints (sm, md, lg, xl, 2xl)
    - [ ] ARIA labels sur tous les éléments interactifs
    - [ ] Navigation clavier complète (Tab, Enter, Escape, flèches)
    - [ ] Focus visible sur tous les éléments focusables
    - [ ] Contraste WCAG AA respecté (4.5:1 / 3:1)
    - [ ] Touch targets minimum 44×44px
    - [ ] Lighthouse mobile > 90 sur Performance, Accessibility, Best Practices, SEO
    - [ ] 0 erreur axe-core
  - Fichiers: src/components/**/*.tsx, src/styles/globals.css

- [US-11] Screenshots automatisés Playwright | 4 thèmes × 3 viewports (375px, 768px, 1440px) × scènes clés (menu, game start, mid-game, check, checkmate, promotion, theme switch). 38+ screenshots haute qualité. Galerie SCREENSHOTS.md auto-générée. | moyenne | après:US-10
  - Team: tester, stabilizer
  - Critères d'acceptance:
    - [ ] Script Playwright reproductible (`npx playwright test screenshots.spec.ts`)
    - [ ] 38+ screenshots générés dans screenshots/
    - [ ] 4 thèmes couverts
    - [ ] 3 viewports par scène
    - [ ] Scènes : menu, game, check, checkmate, promotion, theme switch
    - [ ] SCREENSHOTS.md avec galerie auto-générée
  - Fichiers: tests/e2e/screenshots.spec.ts, scripts/generate-gallery.ts, SCREENSHOTS.md

- [US-12] Vidéo de démonstration | Playwright séquence scriptée 60-90s : menu → switch thèmes → partie → capture (particules) → échec (shake) → mat (confetti) → vue mobile → outro. FFmpeg post-production (transitions, titre, musique). Output 1080p 60fps. | moyenne | après:US-11
  - Team: tester, developer, stabilizer
  - Critères d'acceptance:
    - [ ] Séquence Playwright complète et reproductible
    - [ ] Vidéo finale 1080p 60fps
    - [ ] Durée 60-90 secondes
    - [ ] Montre toutes les features majeures
    - [ ] Titre et transitions (FFmpeg)
    - [ ] Fichier final dans demo/chess-fighter-demo.mp4
  - Fichiers: tests/e2e/demo-video.spec.ts, scripts/generate-demo.ts, demo/

---

## Dépendances entre US

```
US-01 → US-02 → US-03 → US-04 → US-05
                   │        │
                   ↓        ↓
                 US-06    US-07 (aussi après US-06)
                   │        │
                   ↓        ├→ US-09
                 US-08      └→ US-10 → US-11 → US-12
```

| US | Dépend de |
|----|-----------|
| US-01 | — |
| US-02 | US-01 |
| US-03 | US-02 |
| US-04 | US-03 |
| US-05 | US-04 |
| US-06 | US-03 |
| US-07 | US-04, US-06 |
| US-08 | US-06 |
| US-09 | US-07 |
| US-10 | US-07 |
| US-11 | US-10 |
| US-12 | US-11 |

---

## SEO & Performance

- Meta tags Open Graph + Twitter Cards
- Viewport meta tag correctement configuré
- Responsive images avec srcset (pièces, backgrounds)
- Font preload (Inter ou Geist)
- Service Worker pour le cache offline (PWA)
- Score Lighthouse cible : > 90 sur les 4 métriques (mobile)
- Core Web Vitals : LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size < 200KB gzipped (initial load)
