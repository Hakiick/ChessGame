---
paths:
  - "src/**/*.{ts,tsx}"
  - "next.config.*"
  - "tailwind.config.*"
---

# Architecture — Chess Fighter (Next.js 14)

## Stack

- **Next.js 14** App Router (pas Pages Router)
- **React 18** avec Server Components par défaut, `"use client"` uniquement quand nécessaire
- **TypeScript** strict (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Tailwind CSS 3** avec design tokens CSS custom
- **Framer Motion 11** pour les animations React
- **Canvas 2D** pour les particules et effets lourds (pas de DOM pour les particules)

## Règles d'architecture

### App Router

- **YOU MUST** utiliser le App Router (`src/app/`) — pas de `pages/`
- **YOU MUST** garder les Server Components par défaut — ajouter `"use client"` uniquement pour l'interactivité
- **YOU MUST** colocater les composants page-specific dans leur dossier route
- Layout root : ThemeProvider, fonts, metadata

### Moteur d'échecs (`src/engine/`)

- **YOU MUST** garder le moteur d'échecs pur TypeScript — AUCUNE dépendance React
- **YOU MUST** le rendre testable unitairement sans DOM
- **YOU MUST** utiliser des types immutables pour l'état du jeu
- Pattern : le moteur expose des fonctions pures, le hook `useChessGame` gère l'état React
- Pas de classes — préférer les fonctions et types

### Composants (`src/components/`)

```
components/
├── ui/       # Primitives réutilisables (Button, Card, Modal) — pas de logique métier
├── board/    # Échiquier et pièces — dépend de engine/ via hooks
├── game/     # UI jeu (Clock, MoveList, GameOver) — dépend de hooks
├── effects/  # Effets visuels WOW — Canvas 2D et Framer Motion
└── layout/   # Header, Nav, Footer — structure de page
```

- **YOU MUST** respecter la séparation : `ui/` ne dépend de rien, `board/` dépend de `engine/` via hooks
- **YOU MUST** nommer les composants en PascalCase, un composant par fichier
- **YOU MUST** exporter les composants en named export (pas de default export)

### Hooks (`src/hooks/`)

- `useChessGame` — hook principal, fait le pont entre engine/ et les composants
- `useDragPiece` — gestion drag & drop (Pointer Events API pour mouse + touch)
- `useChessClock` — horloge countdown avec useRef pour la précision
- `useMediaQuery` — breakpoints responsive

### Thèmes (`src/themes/`)

- ThemeProvider via React Context
- Chaque thème exporte : couleurs board, couleurs UI, chemins assets, sons
- Le thème actif est stocké en localStorage et lu côté client uniquement

### Assets (`public/`)

```
public/
├── pieces/{classic,marvel,pokemon,neon}/{white,black}/  # Pièces par thème
├── backgrounds/                                          # Fonds échiquier
├── sounds/                                               # Sons par événement
└── icons/                                                # PWA icons
```

## Règles de performance

- **Animations** : uniquement `transform` et `opacity` (GPU-accelerated)
- **Particules** : Canvas 2D hors-DOM, requestAnimationFrame, cleanup sur unmount
- **Images** : `next/image` avec `priority` pour les pièces visibles, `loading="lazy"` sinon
- **Re-renders** : memoize les composants lourds (Board, Square), useMemo pour les coups valides
- **Bundle** : dynamic import pour les effets WOW, le replay, les sons

## Imports

Ordre des imports (ESLint enforced) :
1. React / Next.js
2. Bibliothèques externes (framer-motion, clsx)
3. `@/engine/*` (moteur d'échecs)
4. `@/hooks/*`
5. `@/components/*`
6. `@/themes/*`
7. `@/lib/*`
8. Types
9. Styles
