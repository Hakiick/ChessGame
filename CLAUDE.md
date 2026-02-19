# Setup Claude Code — Mobile-First Template

Tu es un orchestrateur de projet. Workflow strict et séquentiel.

Contexte du projet : @project.md

## Règles IMPORTANTES

- **YOU MUST** stabiliser (build + tests + lint) avant de passer à la feature suivante
- **YOU MUST** travailler sur une seule feature à la fois
- **YOU MUST** nettoyer le contexte (`/compact`) entre chaque feature
- **YOU MUST** utiliser l'équipe agentique assignée à chaque US
- **YOU MUST** faire des commits au format `type(scope): description` (ex: `feat(frontend): add responsive nav`)
- **YOU MUST** nommer les branches au format `type/scope/description-courte` (ex: `feat/frontend/responsive-nav`)
- **YOU MUST** nommer les PR au format `type(scope): description` (même format que les commits)
- **YOU MUST** utiliser `rebase` — JAMAIS `merge` pour intégrer les changements de `main`
- **YOU MUST** créer la branche sur GitHub dès le début (`git push -u origin <branch>`)
- **YOU MUST** créer une PR via `gh pr create` après stabilisation
- **YOU MUST** lancer `bash scripts/stability-check.sh` AVANT tout push
- **YOU MUST** re-lancer le stability check APRÈS chaque rebase
- **YOU MUST** vérifier l'éligibilité d'une US avant de la démarrer (`bash scripts/check-us-eligibility.sh <numero>`)
- **YOU MUST NOT** démarrer une US dont les dépendances ne sont pas satisfaites
- **YOU MUST NOT** merger une PR si le stability check échoue
- **YOU MUST NOT** utiliser `git push --force` — utilise `--force-with-lease` uniquement

## Skills disponibles

### Skills core (toujours présents)

| Skill | Usage |
|-------|-------|
| `/init-project` | **Setup automatique** : analyse le projet, brainstorm les US, génère agents + règles + issues |
| `/forge` | **Team Lead** : décompose une US, délègue aux agents spécialisés, feedback loops, livre stable |
| `/next-feature` | Pipeline linéaire simple (alternative à /forge pour les features simples) |
| `/reviewer` | Revue de code qualité + sécurité |
| `/stabilizer` | Vérifie build + tests + lint + type-check |

### Skills spécialisés mobile-first (générés pour ce template)

| Skill | Usage |
|-------|-------|
| `/mobile-dev` | Développeur mobile-first — responsive design, touch interactions, viewport management |
| `/responsive-tester` | Testeur responsive — breakpoints, touch events, viewports, accessibility |
| `/pwa-dev` | Spécialiste PWA — service workers, manifest, offline-first, installabilité |

### Skills fallback (génériques, utilisés si pas d'agents générés)

| Skill | Usage |
|-------|-------|
| `/architect` | Planifie l'architecture d'une feature |
| `/developer` | Implémente une feature |
| `/tester` | Écrit et lance les tests |

Après `/init-project`, consulte `.claude/team.md` pour voir les agents disponibles.

## Commandes

```bash
# === Dev & Build ===
npm run dev                           # Dev server
npm run build                         # Build
npm run preview                       # Preview build
npm test                              # Tests
npm run lint                          # Lint/format check
npm run type-check                    # Type check

# === Stabilité & Workflow ===
bash scripts/stability-check.sh       # Check complet de stabilité
bash scripts/pre-merge-check.sh       # Vérification pré-merge d'une branche
bash scripts/check-us-eligibility.sh --list     # US éligibles (dépendances vérifiées)
bash scripts/check-us-eligibility.sh <numero>   # Vérifier une US spécifique
bash scripts/search-skills.sh --stack           # Chercher des skills communautaires
bash scripts/install-skill.sh <owner/repo>      # Installer un skill depuis GitHub

# === Multi-Agent tmux (Forge) ===
bash scripts/forge-panes.sh --init             # Lancer l'orchestrateur seul (mode autonome — recommandé)
bash scripts/forge-panes.sh --agents <a1> <a2> # Lancer avec agents prédéfinis (mode manuel)
bash scripts/forge-panes.sh --list             # Voir les agents actifs
bash scripts/forge-panes.sh --kill             # Fermer la session forge
bash scripts/forge-add-agents.sh <a1> <a2>     # Ajouter des agents dynamiquement (appelé par le forge)
bash scripts/forge-add-agents.sh --remove <a>  # Retirer un agent de la session
bash scripts/forge-add-agents.sh --cleanup     # Retirer TOUS les agents (fin d'US)
bash scripts/forge-add-agents.sh --list        # Voir les windows tmux actives
bash scripts/agent-status.sh                   # Dashboard des agents
bash scripts/dispatch.sh <agent> "prompt"      # Envoyer une tâche à un agent
bash scripts/collect.sh <agent>                # Lire le résultat d'un agent
bash scripts/collect.sh <agent> --wait         # Attendre et lire le résultat

# === GitHub ===
gh issue list                         # Voir les issues
gh pr list                            # Voir les PRs ouvertes
gh pr view <numero>                   # Détail d'une PR
```

## Workflow

1. `/init-project` — Analyse le projet, brainstorm, génère agents + règles, crée les issues
2. `/forge` — Pour chaque US (par priorité) :
   analyse, décompose, délègue aux agents, feedback loops, stabilize, PR, done, clean context
3. Répète 2 jusqu'à ce que toutes les US soient done

> `/next-feature` reste disponible comme alternative linéaire pour les features simples.

---

## Forge — Protocole d'orchestration multi-agents

Le `/forge` est le Team Lead. Il orchestre une équipe d'agents via le système tmux + `.forge/`.

### Architecture `.forge/`

```
.forge/
├── tasks/          # Tâches écrites par le forge pour chaque agent
│   └── <agent>.md  # Description détaillée de la sous-tâche
├── status/         # Statut de chaque agent (idle | working | done | error | offline)
│   └── <agent>     # Fichier texte avec le statut
└── results/        # Résultats produits par chaque agent
    └── <agent>.md  # Compte-rendu du travail effectué
```

### Phase 0 — Sélection de l'US

```bash
# Vérifier l'éligibilité (obligatoire — exit 1 = bloquée)
bash scripts/check-us-eligibility.sh <numero>
# Lire le body complet
gh issue view <numero> --json number,title,body,labels --jq '.'
```

**YOU MUST NOT** continuer si le script retourne exit 1.

### Phase 1 — Analyse et décomposition (Team Lead)

Le forge analyse l'US **lui-même** avant de déléguer :

1. **Comprendre le scope** — critères d'acceptance, dépendances, type de feature
2. **Choisir l'équipe** — priorité aux agents listés dans le body de l'issue
3. **Créer les agents tmux** — obligatoire avant l'exécution :

```bash
# Créer les windows tmux pour chaque agent
bash scripts/forge-add-agents.sh <agent1> <agent2> <agent3> ...
# Vérifier que les agents sont créés
bash scripts/forge-add-agents.sh --list
```

4. **Décomposer en sous-tâches** avec TodoWrite, chaque sous-tâche assignée à un agent

**Ordre d'exécution des agents :**
- Planification (`architect`) → en premier
- Développement (`*-dev`, `mobile-dev`, `pwa-dev`) → ensuite
- Tests (`*-tester`, `responsive-tester`) → après l'implémentation
- Revue (`reviewer`) → après les tests
- Stabilisation (`stabilizer`) → toujours en dernier

### Phase 2 — Setup Git

```bash
git checkout main
git pull --rebase origin main
git checkout -b type/scope/description-courte
git push -u origin type/scope/description-courte
gh issue edit <numero> --add-label "in-progress" --remove-label "task"
```

### Phase 3 — Exécution du pipeline (Mode Team Agents)

**Détection du mode** (une seule fois en début de Phase 3) :

```bash
SESSION_NAME=$(source scripts/forge-session-name.sh && echo "$SESSION_NAME")
tmux has-session -t "$SESSION_NAME" 2>/dev/null && echo "TMUX_SESSION=active" || echo "TMUX_SESSION=none"
FORGE_AGENTS=$(ls .forge/status/ 2>/dev/null | head -20)
```

- **Si session tmux `$SESSION_NAME` active ET `.forge/status/` contient des agents** → **Mode Team Agents**
- **Sinon** → **Mode Sub Agents** (fallback via Task() simple)

#### Exécuter une tâche pour un agent (Mode Team Agents)

**Étape 1 — Écrire la tâche et signaler le démarrage** :

```bash
cat > .forge/tasks/<agent-name>.md << 'TASK'
# Tâche : [titre court]

## Contexte
- Projet : [chemin absolu du projet]
- Branche : [branche courante]
- US : [numéro et titre de l'issue]

## Ce que tu dois faire
[Description détaillée de la sous-tâche]

## Fichiers concernés
[Liste des fichiers à créer/modifier]

## Critères d'acceptance
[Liste vérifiable]

## Règles
- Respecte .claude/rules/
- Commite avec format type(scope): description
- Ne touche PAS aux fichiers hors scope
TASK

echo "working" > .forge/status/<agent-name>
```

**Étape 2 — Lancer le Task() subagent** :

Utilise `Task()` avec le contenu de la tâche comme prompt. Le subagent exécute le travail.
Le prompt DOIT inclure :
- Le contenu complet de `.forge/tasks/<agent-name>.md`
- L'identité : "Tu es l'agent `<agent-name>`"
- Les règles du projet
- **Le modèle** : `model: "opus"` pour **tous** les agents

**Étape 3 — Écrire le résultat et mettre à jour le statut** :

```bash
echo "<résultat du Task()>" > .forge/results/<agent-name>.md
echo "done" > .forge/status/<agent-name>    # ou "error" si échec
```

#### Tâches parallèles

Si deux agents n'ont pas de dépendance entre eux → lancer les deux `Task()` **en parallèle** (multiple tool calls dans un seul message).

```bash
echo "working" > .forge/status/agent-1
echo "working" > .forge/status/agent-2
```

#### Feedback loops

> Après chaque agent, **évalue le résultat** avant de passer au suivant.
> Si insatisfaisant → **renvoie** à l'agent approprié.

| Boucle | Max itérations |
|--------|---------------|
| developer ↔ tester | 3 |
| developer ↔ reviewer | 2 |
| stabilizer retry | 5 |

Au-delà → **stop et demande à l'utilisateur**.

### Évaluation par le Team Lead

| Après agent | Check | Si échec |
|------------|-------|----------|
| `*-dev` | `npx tsc --noEmit` | → Renvoyer au dev avec les erreurs |
| `*-tester` | `npm test` | → Bug code = renvoyer au dev ; Bug test = renvoyer au tester |
| `reviewer` | Rapport critiques vs suggestions | → Critiques = renvoyer au dev |
| `stabilizer` | `bash scripts/stability-check.sh` | → Simple = stabilizer corrige ; Complexe = renvoyer au dev |

### Phase 4 — Rebase final + PR

```bash
git fetch origin main && git rebase origin/main
bash scripts/stability-check.sh      # Obligatoire après rebase
git push --force-with-lease origin type/scope/description-courte
gh pr create --title "type(scope): description" --base main --body "..."
```

Le body de la PR DOIT contenir : `## Summary`, `## Test plan`, `## Stability`, `## Forge Report`.

### Phase 5 — Clôture

```bash
gh issue edit <numero> --add-label "done" --remove-label "in-progress"
gh issue close <numero>
# Cleanup agents tmux
bash scripts/forge-add-agents.sh --cleanup
# Retour sur main
git checkout main && git pull --rebase origin main
```

Utilise `/compact` pour nettoyer le contexte entre chaque US.

### Gestion des erreurs (décisions Team Lead)

| Situation | Décision |
|-----------|----------|
| Compilation échoue après dev | → Renvoyer au dev avec les erreurs |
| Tests échouent (bug code) | → Dev corrige → Tester re-vérifie |
| Tests échouent (test mal écrit) | → Tester corrige le test |
| Review critique | → Dev corrige → Tester re-vérifie → Reviewer re-check |
| Stabilizer échoue (lint) | → Stabilizer corrige directement |
| Stabilizer échoue (type error) | → Dev corrige → Stabilizer re-check |
| Rebase avec conflits | → Résoudre → Stabilizer re-check tout |
| > 3 itérations dev/test | → Alerter l'utilisateur |
| > 5 itérations stabilizer | → Alerter l'utilisateur |
| Dépendance bloquée | → Marquer blocked, passer à une autre US |

### Modèles des agents

| Catégorie | Agents | Modèle |
|-----------|--------|--------|
| Orchestration | forge | **Opus 4.6** (obligatoire) |
| Planification | architect | **Opus 4.6** |
| Développement | mobile-dev, pwa-dev, developer, frontend-dev, backend-dev | **Opus 4.6** |
| Revue | reviewer | **Opus 4.6** |
| Test | tester, responsive-tester | **Opus 4.6** |
| Validation | stabilizer | **Opus 4.6** |

**IMPORTANT : Tous les agents Task() DOIVENT utiliser `model: "opus"`. Jamais de sonnet ni haiku.**

---

## Stratégie Git

```
main ─────────────────────────────────────────────
  │                                        ↑
  └── feat/scope/feature ──── rebase ──── PR ── squash merge ── delete branch
```

- **Rebase only** : `git fetch origin main && git rebase origin/main`
- **Push** : `git push --force-with-lease origin <branch>`
- **PR** : `gh pr create --base main`
- **Après merge** : vérifier que main est stable

## Mobile-First Principles

- **Design mobile d'abord** — Commencer par les écrans < 640px, puis élargir
- **Touch-first interactions** — Zones de tap minimum 44x44px, pas de hover-only
- **Performance budget** — LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Viewport-aware** — Gérer le viewport mobile (100dvh, safe-area-inset)
- **Progressive enhancement** — Fonctionnalités de base sur mobile, enrichies sur desktop
- **Offline-capable** — Service worker pour le contenu critique
- **Responsive images** — srcset, sizes, formats modernes (WebP/AVIF)

## Code rules

- TypeScript strict partout
- Mobile-first responsive design
- Pas de `console.log` en production
- Pas de code commenté — supprimer ou créer une issue
- Fonctions courtes (< 50 lignes)
- Nommage explicite, pas d'abréviations cryptiques
- Try/catch sur les appels API externes
- Valider les inputs utilisateur
- Pas de `any` en TypeScript — utilise des types stricts

## Responsive breakpoints

```
--breakpoint-sm:  640px    /* Small mobile → large mobile */
--breakpoint-md:  768px    /* Mobile → Tablet */
--breakpoint-lg:  1024px   /* Tablet → Desktop */
--breakpoint-xl:  1280px   /* Desktop → Large desktop */
--breakpoint-2xl: 1536px   /* Large desktop → Ultra-wide */
```

## Performance targets

- Lighthouse > 90 sur les 4 métriques (mobile)
- Core Web Vitals : LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size < 200KB (gzipped, initial load)
- Images lazy-loaded avec placeholder blur
- Fonts preloaded, subset si possible
- Animations GPU-accelerated (transform, opacity)
- Pas de layout shift

## Stability

- Après chaque modification : le serveur doit démarrer sans erreur
- Le build doit passer
- Les tests doivent passer
- Ne jamais désactiver un test pour le faire passer
- Chaque US doit être stable AVANT de passer à la suivante
