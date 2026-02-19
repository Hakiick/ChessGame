# Workflow de travail

## Vue d'ensemble

```
[Initialisation] → [Feature Loop] → [Finalisation]
                        ↓
              ┌───────────────────────────┐
              │  1. Pick next US          │
              │  2. Assign team           │
              │  3. Create branch         │
              │  4. Move → In Prog        │
              │  5. Implement             │
              │  6. Stabilize             │
              │  7. Rebase + Push + PR    │
              │  8. Move → Done           │
              │  9. Clean context         │
              └───────────┬───────────────┘
                          ↓
                    [Next US or End]
```

## Modèles des agents

| Phase | Agent | Modèle |
|-------|-------|--------|
| Orchestration | forge | **Opus 4.6** |
| Planification | architect | **Opus 4.6** |
| Développement | mobile-dev, pwa-dev, developer | **Opus 4.6** |
| Tests | tester, responsive-tester | **Sonnet 4.5** |
| Revue | reviewer | **Opus 4.6** |
| Stabilisation | stabilizer | **Sonnet 4.5** |

## Stratégie Git : Rebase Only

**Règle fondamentale** : on utilise TOUJOURS `rebase` — JAMAIS `merge` pour intégrer les changements de `main` dans une branche feature.

## Détail de chaque étape

### 1. Pick next US (sélection intelligente)

- S'il y a une US `in-progress`, reprends-la en priorité
- Sinon, sélectionne la prochaine US éligible :
  1. Liste les issues avec label `task`
  2. Pour chaque issue, lis la section **Dépendances** dans le body
  3. Vérifie que toutes les dépendances sont satisfaites
  4. Prends la première US éligible par priorité (haute → moyenne → basse)

**Règles de dépendances :**
| Type | Condition pour démarrer |
|------|------------------------|
| `après:US-XX` | US-XX doit avoir le label `done` |
| `partage:US-XX` | US-XX ne doit PAS être `in-progress` |
| `enrichit:US-XX` | US-XX doit être `done` ou `in-progress` |

### 2. Assign team

- Consulte `project.md` > Équipe agentique par feature
- Charge les prompt patterns des agents depuis `team.md`
- L'ordre d'exécution des agents est important

### 3. Create branch

```bash
git checkout main
git pull --rebase origin main
git checkout -b type/scope/description-courte
git push -u origin type/scope/description-courte
```

### 4. Move → In Progress

```bash
gh issue edit <numero> --add-label "in-progress" --remove-label "task"
```

### 5. Implement

Chaque agent intervient dans l'ordre :

**architect (si assigné) → model: opus :**
- Analyse la US, propose un plan d'implémentation

**developer / mobile-dev / pwa-dev → model: opus :**
- Implémente selon le plan
- Commits atomiques
- Rebase régulier sur main

**tester / responsive-tester → model: sonnet :**
- Écrit les tests après l'implémentation
- Teste sur multiple viewports

**reviewer (si assigné) → model: opus :**
- Revue du code produit
- Le developer corrige si nécessaire

### 6. Stabilize

**stabilizer (toujours en dernier) → model: sonnet :**

```bash
bash scripts/stability-check.sh
```

### 7. Rebase + Push + PR

```bash
git fetch origin main
git rebase origin/main
bash scripts/stability-check.sh
git push --force-with-lease origin type/scope/description-courte
gh pr create --title "type(scope): description" --base main
```

### 8. Move → Done

```bash
gh issue edit <numero> --add-label "done" --remove-label "in-progress"
gh issue close <numero>
```

### 9. Clean context

```bash
git checkout main
git pull --rebase origin main
```

Utilise `/compact` pour nettoyer le contexte.

## Gestion des dépendances

### Types de dépendances

| Relation | Syntaxe | Signification | Impact |
|----------|---------|---------------|--------|
| Dépendance stricte | `après:US-XX` | A besoin du code de US-XX | Attendre Done |
| Scope partagé | `partage:US-XX` | Mêmes fichiers modifiés | Pas en parallèle |
| Extension | `enrichit:US-XX` | Ajoute des fonctionnalités | Quand en cours ou Done |

### Contexte partagé entre US liées

Quand une US dépend d'une autre, l'agent DOIT :
1. **Lire le résumé de l'US précédente**
2. **Comprendre ce qui a été construit**
3. **Construire dessus**
4. **Vérifier la non-régression**

## Protection contre les merges cassés

1. **Rebase sur main** — la branche doit être à jour
2. **Stability check** — `bash scripts/stability-check.sh` doit passer
3. **Pas de conflits** — PR mergeable
4. **CI verte** — si configurée
5. **Review approuvée** — si reviewer assigné

## Gestion des erreurs

- **Build échoue** → Le stabilizer corrige
- **Test échoue** → Le tester analyse et corrige
- **Régression** → Stop tout, corrige d'abord
- **US bloquée** → Crée une issue `blocked`, passe à la suivante
- **Conflit de rebase** → `git rebase --abort`, demander à l'utilisateur
- **Main cassé** → Priorité absolue, hotfix immédiat
