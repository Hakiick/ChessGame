---
paths:
  - "src/**/*.{ts,tsx,js,jsx}"
  - "tests/**/*.{ts,tsx}"
  - "package.json"
  - "next.config.*"
  - "tailwind.config.*"
---

# Règles de stabilité — Chess Fighter

## Commandes de stabilité

```bash
# Build Next.js
npm run build

# Type-check TypeScript
npm run type-check          # npx tsc --noEmit

# Lint + format
npm run lint                # eslint
npm run format:check        # prettier --check

# Tests unitaires
npm test                    # vitest run

# Tests E2E (nécessite le serveur)
npm run test:e2e            # playwright test

# Check complet (script automatisé)
bash scripts/stability-check.sh
```

## Règles strictes

- **YOU MUST** lancer `bash scripts/stability-check.sh` AVANT tout push
- **YOU MUST** re-lancer le stability check APRÈS chaque rebase sur main
- **YOU MUST NOT** désactiver un test existant pour "faire passer" une feature
- **YOU MUST NOT** ajouter `@ts-ignore` ou `@ts-expect-error` pour contourner une erreur de type
- **YOU MUST NOT** désactiver des règles ESLint sans justification
- **YOU MUST NOT** merger une PR si le stability check échoue

## Ordre de vérification

1. `npm run type-check` — Erreurs de type TypeScript
2. `npm run lint` — Erreurs de lint ESLint
3. `npm run build` — Build Next.js (inclut type-check)
4. `npm test` — Tests unitaires Vitest
5. (Optionnel) `npm run test:e2e` — Tests E2E Playwright

## Seuils

| Métrique | Seuil | Commande |
|----------|-------|----------|
| TypeScript | 0 erreur | `npx tsc --noEmit` |
| ESLint | 0 erreur, 0 warning | `npm run lint` |
| Build | Succès | `npm run build` |
| Tests unitaires | 100% passing | `npm test` |
| Couverture moteur | > 90% | `npm run test:coverage` |
| Lighthouse mobile | > 90 (4 métriques) | Après déploiement |

## Après chaque modification de code

1. Le serveur dev doit démarrer sans erreur (`npm run dev`)
2. Le build doit passer (`npm run build`)
3. Les tests doivent passer (`npm test`)
4. Le type-check doit passer (`npm run type-check`)
5. Le lint doit passer (`npm run lint`)

## Stability check automatisé

Le script `scripts/stability-check.sh` exécute tous les checks dans l'ordre et retourne :
- **exit 0** : tout est stable, OK pour push/merge
- **exit 1** : instable, corriger avant de continuer
