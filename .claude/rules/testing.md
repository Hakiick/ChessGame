---
paths:
  - "tests/**/*.{ts,tsx}"
  - "src/engine/**/*.ts"
  - "vitest.config.*"
  - "playwright.config.*"
---

# Testing — Chess Fighter

## Stack de tests

- **Vitest** : tests unitaires et d'intégration (moteur d'échecs, hooks, utilitaires)
- **Playwright** : tests E2E, screenshots automatisés, vidéo de démo

## Tests unitaires (Vitest)

### Structure

```
tests/unit/
├── engine/
│   ├── board.test.ts        # État du plateau, makeMove, undoMove
│   ├── pieces/
│   │   ├── pawn.test.ts     # Mouvement, capture, en passant, promotion
│   │   ├── rook.test.ts     # Mouvement, collision, castling
│   │   ├── bishop.test.ts   # Mouvement diagonal, collision
│   │   ├── queen.test.ts    # Mouvement combiné
│   │   ├── knight.test.ts   # Mouvement L, saute par-dessus
│   │   └── king.test.ts     # Mouvement, castling, pas en échec
│   ├── check.test.ts        # Échec, mat, pat
│   ├── rules.test.ts        # Castling, en passant, promotion, 50-move, repetition
│   └── notation.test.ts     # Notation algébrique
└── hooks/
    ├── useChessGame.test.ts
    └── useChessClock.test.ts
```

### Conventions

- **YOU MUST** nommer les fichiers `*.test.ts` (pas `*.spec.ts` pour Vitest)
- **YOU MUST** tester le moteur d'échecs avec > 90% de couverture
- **YOU MUST** tester chaque pièce individuellement avec cas nominaux + edge cases
- **YOU MUST** utiliser `describe` / `it` avec des descriptions claires en anglais
- **YOU MUST** tester les positions connues (Scholar's Mate, Fool's Mate, etc.)

### Pattern de test moteur

```typescript
import { describe, it, expect } from 'vitest'
import { createBoard, makeMove } from '@/engine/board'
import { getValidMoves } from '@/engine/moves'

describe('Pawn', () => {
  it('should move one square forward', () => {
    const board = createBoard()
    const moves = getValidMoves(board, { col: 4, row: 6 }) // e2
    expect(moves).toContainEqual({ col: 4, row: 5 }) // e3
  })

  it('should move two squares on first move', () => {
    const board = createBoard()
    const moves = getValidMoves(board, { col: 4, row: 6 }) // e2
    expect(moves).toContainEqual({ col: 4, row: 4 }) // e4
  })
})
```

### Cas de test obligatoires pour le moteur

| Catégorie | Tests minimum |
|-----------|--------------|
| Chaque pièce | Mouvement basique, capture, blocked by ally, blocked by enemy |
| Pawn | Forward 1, forward 2 (first), capture diagonal, en passant, promotion |
| King | Normal move, castling O-O, castling O-O-O, can't castle through check, can't castle after king moved |
| Check | Simple check, double check, discovered check |
| Checkmate | Scholar's mate, Fool's mate, back rank mate |
| Stalemate | Position de pat classique |
| Draw | 50-move rule, threefold repetition, insufficient material (K vs K, K+B vs K, K+N vs K) |
| Notation | e4, Nf3, O-O, O-O-O, Qxd7+, Qxd7#, exd5, e8=Q |

## Tests E2E (Playwright)

### Structure

```
tests/e2e/
├── game.spec.ts             # Gameplay complet
├── screenshots.spec.ts      # Capture screenshots
└── demo-video.spec.ts       # Vidéo de démo
```

### Conventions

- **YOU MUST** nommer les fichiers `*.spec.ts` (convention Playwright)
- **YOU MUST** tester sur 3 viewports : mobile (375×667), tablet (768×1024), desktop (1440×900)
- **YOU MUST** utiliser `page.waitForSelector` ou `expect(locator).toBeVisible()` — pas de `waitForTimeout`

### Tests responsive obligatoires

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`board renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    // ...
  })
}
```

## Couverture

- Moteur d'échecs : > 90%
- Hooks : > 70%
- Composants : testés via E2E (pas de unit tests React obligatoires)
- Global : > 80%

## Commandes

```bash
npm test                    # Vitest (unit)
npm run test:coverage       # Vitest avec couverture
npm run test:e2e            # Playwright (E2E)
npm run test:screenshots    # Playwright screenshots uniquement
```
