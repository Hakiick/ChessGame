---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.{ts,tsx}"
---

# Clean Code — Chess Fighter (TypeScript + React)

## TypeScript

- **YOU MUST NOT** utiliser `any` — types stricts partout
- **YOU MUST NOT** utiliser `as` type assertion sauf pour les tests — utiliser des type guards
- **YOU MUST** activer `strict: true` et `noUncheckedIndexedAccess: true`
- **YOU MUST** définir les types du moteur d'échecs dans `src/engine/types.ts`
- Préférer les union types aux enums : `type Color = 'white' | 'black'`
- Préférer les interfaces pour les objets, les types pour les unions et utilitaires

## React

- **YOU MUST** utiliser `"use client"` uniquement quand nécessaire (événements, hooks, state)
- **YOU MUST NOT** utiliser `useEffect` pour la logique dérivée — utiliser `useMemo`
- **YOU MUST** memoize les callbacks passés aux enfants avec `useCallback`
- **YOU MUST** utiliser `React.memo` sur les composants qui reçoivent des props stables (Square, Piece)
- Pas de prop drilling > 2 niveaux — utiliser Context ou composition
- Un composant = un fichier. Pas de composants anonymes.

## Fonctions

- Maximum 50 lignes par fonction (hors types et imports)
- Maximum 3 paramètres — au-delà, utiliser un objet de config
- Nommage explicite : `getValidMoves()` pas `getMoves()`, `isKingInCheck()` pas `checkKing()`
- Fonctions pures autant que possible (surtout dans engine/)

## Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composants React | PascalCase | `ChessBoard`, `MoveList` |
| Hooks | camelCase avec `use` | `useChessGame`, `useDragPiece` |
| Fonctions/variables | camelCase | `getValidMoves`, `isWhiteTurn` |
| Types/Interfaces | PascalCase | `GameState`, `ChessMove` |
| Constantes | UPPER_SNAKE_CASE | `BOARD_SIZE`, `INITIAL_TIME` |
| Fichiers composants | PascalCase.tsx | `ChessBoard.tsx` |
| Fichiers utilitaires | camelCase.ts | `notation.ts` |
| Fichiers de test | *.test.ts | `board.test.ts` |
| CSS classes | kebab-case (Tailwind) | `bg-board-light` |

## Ce qui est interdit

- `console.log` en production — supprimer avant commit
- Code commenté — supprimer ou créer une issue
- `// TODO` sans issue associée
- Variables inutilisées (ESLint `no-unused-vars`)
- Imports inutilisés
- `any`, `@ts-ignore`, `@ts-expect-error` (sauf cas justifié en test)
- Magic numbers — utiliser des constantes nommées

## Mobile-First CSS (Tailwind)

- **YOU MUST** écrire les styles mobile en premier (sans préfixe)
- **YOU MUST** utiliser les préfixes responsive Tailwind pour élargir : `sm:`, `md:`, `lg:`
- **YOU MUST NOT** utiliser `max-width` media queries
- **YOU MUST** utiliser `rem` pour les tailles de texte (Tailwind default)
- **YOU MUST** vérifier les touch targets : minimum `min-h-[44px] min-w-[44px]`

```tsx
// BON — Mobile-first
<div className="flex flex-col gap-2 md:flex-row md:gap-4 lg:gap-6">

// MAUVAIS — Desktop-first
<div className="flex flex-row gap-6 max-md:flex-col max-md:gap-2">
```

## Accessibilité

- **YOU MUST** utiliser des éléments HTML sémantiques (`nav`, `main`, `section`, `button`)
- **YOU MUST** ajouter `aria-label` sur les boutons icônes et éléments sans texte visible
- **YOU MUST** gérer le focus visible (`:focus-visible` outline)
- **YOU MUST** fournir des `alt` sur toutes les images de pièces
- **YOU MUST** supporter la navigation clavier sur l'échiquier (flèches, Enter, Escape)
