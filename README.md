# Setup Claude Code — Mobile-First

> Set up a complete Claude Code multi-agent workspace in 5 minutes, accessible from your iPhone.

## What you get

- **Secured server** : SSH hardening, UFW firewall, Tailscale VPN (optional)
- **Claude Code CLI** : installed and configured with your API key
- **15 specialized agents** (skills) orchestrated by Forge (Team Lead)
- **Web IDE** : code-server (VS Code in the browser)
- **Orchestration multi-agents** : forge (Team Lead), feedback loops, monitoring temps réel
- **Workflow structuré** : US -> branch -> implement -> stabilize -> PR -> done
- **Azure (optional)** : Terraform to provision the VM automatically

## Quick start

### Option A — Server setup (5 min)

Pour installer Claude Code + code-server sur un serveur Ubuntu :

```bash
git clone https://github.com/Hakiick/setup-claude-code-mobile-first.git
cd setup-claude-code-mobile-first

cp config.env.example config.env
nano config.env   # Set ANTHROPIC_API_KEY and WEB_PASSWORD

sudo bash scripts/setup.sh
bash scripts/setup-api-key.sh
```

Puis lancer le forge :

```bash
cd ~/workspace/my-project
bash scripts/forge-panes.sh --init
tmux attach -t forge
# dans l'orchestrateur : /forge <US-numero>
```

Access : `http://<IP>:8080/` (VS Code web)

### Option B — Template only

Pour utiliser uniquement le template Claude Code dans un projet existant :

```bash
git clone https://github.com/Hakiick/setup-claude-code-mobile-first.git /tmp/setup

cp -r /tmp/setup/.claude /chemin/ton-projet/
cp -r /tmp/setup/scripts /chemin/ton-projet/
cp /tmp/setup/CLAUDE.md /chemin/ton-projet/
cp /tmp/setup/project.md /chemin/ton-projet/  # Template à personnaliser

rm -rf /tmp/setup
```

Puis dans Claude Code : `/init-project`

## Agents (Skills)

Tous les agents tournent sur **Opus 4.6**.

### Core

| Skill | Role |
|-------|------|
| `/forge` | Team Lead : décompose, délègue, feedback loops, livre stable |
| `/init-project` | Analyse le projet, génère agents + règles, crée les issues |
| `/next-feature` | Pipeline linéaire simple (alternative à /forge) |
| `/stabilizer` | Quality gate : build, tests, lint, type-check |
| `/reviewer` | Revue de code qualité + sécurité |
| `/architect` | Plan d'implémentation (read-only) |
| `/developer` | Implémentation générique |
| `/tester` | Tests unitaires et E2E |

### Mobile-first

| Skill | Role |
|-------|------|
| `/mobile-dev` | Dev responsive, touch-first, viewport |
| `/responsive-tester` | Tests multi-viewport, WCAG, Lighthouse |
| `/pwa-dev` | Service workers, manifest, offline-first |

### Infrastructure (disponibles si besoin)

| Skill | Role |
|-------|------|
| `/frontend-dev` | UI/UX, SPA, responsive mobile-first |
| `/backend-dev` | REST API, business logic, WebSocket |
| `/admin-sys` | Infrastructure, networking, security |
| `/devops` | CI/CD, Docker, cloud, Terraform |

## Multi-Agent avec tmux (Forge)

### Mode autonome (recommandé)

```bash
# L'orchestrateur crée ses agents dynamiquement selon l'US
bash scripts/forge-panes.sh --init
tmux attach -t forge
# puis dans l'orchestrateur : /forge <US-numero>
```

### Mode manuel (agents prédéfinis)

```bash
bash scripts/forge-panes.sh --agents mobile-dev responsive-tester stabilizer
tmux attach -t forge
```

```
Window 1: orchestrateur  → Claude Code (Team Lead /forge)
Window 2: mobile-dev     → Moniteur passif (agent-watcher.sh)
Window 3: responsive-tester → Moniteur passif
Window N: monitor        → Dashboard temps réel (forge-monitor.sh)
```

### Commandes

```bash
# Forge session
bash scripts/forge-panes.sh --init            # Lancer l'orchestrateur seul (mode autonome)
bash scripts/forge-panes.sh --list            # Agents actifs
bash scripts/forge-panes.sh --kill            # Fermer la session

# Agent management (dynamique)
bash scripts/forge-add-agents.sh <a1> <a2>    # Ajouter des agents à la session
bash scripts/forge-add-agents.sh --remove <a> # Retirer un agent
bash scripts/forge-add-agents.sh --cleanup    # Retirer TOUS les agents (fin d'US)
bash scripts/forge-add-agents.sh --list       # Voir les windows tmux

# Monitoring & dispatch
bash scripts/agent-status.sh                  # Dashboard
bash scripts/dispatch.sh <agent> "tâche"      # Dispatch manuel
bash scripts/collect.sh <agent> --wait        # Lire un résultat

# Stability & workflow
bash scripts/stability-check.sh               # Build + tests + lint + types
bash scripts/pre-merge-check.sh               # Vérifie une branche avant merge
bash scripts/check-us-eligibility.sh --list   # US éligibles
```

### Navigation tmux

| Shortcut | Action |
|----------|--------|
| `Ctrl+A, 1-9` | Go to agent N |
| `Ctrl+A, n/p` | Next/previous agent |
| `Ctrl+A, w` | Tree view (all agents) |
| `Ctrl+A, d` | Detach (agents continue) |

## Selective install

```bash
sudo bash scripts/setup.sh --skip 3     # Skip Tailscale
sudo bash scripts/setup.sh --only 4 6   # Only Claude Code + code-server
sudo bash scripts/setup.sh --from 5     # Start from step 5
```

## Azure VM (optional)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars   # Set subscription_id, ssh key, etc.

terraform init
terraform plan
terraform apply
```

See [docs/TERRAFORM.md](docs/TERRAFORM.md) for details.

## Project structure

```
setup-claude-code-mobile-first/
├── README.md
├── CLAUDE.md                     # Claude Code orchestration rules
├── project.md                    # Project template (customize per project)
├── config.env.example            # Server config template
├── LICENSE
│
├── .claude/                      # Claude Code template
│   ├── settings.json             # Permissions + hooks
│   ├── board.md                  # Agent coordination board
│   ├── team.md, workflow.md      # Team & workflow docs
│   ├── hooks/                    # File protection + context reinjection
│   ├── rules/                    # Code style, commits, branches, stability
│   └── skills/                   # 15 agent skill definitions
│
├── scripts/
│   ├── setup.sh                  # Master setup orchestrator
│   ├── 01-bootstrap.sh           # OS bootstrap (packages, user, swap)
│   ├── 04-install-claude-code.sh # Node.js + Claude Code CLI
│   ├── 06-install-code-server.sh # VS Code web
│   ├── 08-validate.sh            # Validate installation
│   ├── setup-api-key.sh          # Configure Anthropic API key
│   ├── stability-check.sh        # Build + tests + lint + types
│   ├── pre-merge-check.sh        # Branch merge readiness check
│   ├── check-us-eligibility.sh   # US dependency management
│   ├── create-issues.sh          # Create GitHub issues from project.md
│   ├── search-skills.sh          # Search community skills
│   ├── install-skill.sh          # Install skill from GitHub
│   ├── forge-panes.sh            # tmux forge session manager
│   ├── forge-add-agents.sh       # Dynamic agent creation/removal/cleanup
│   ├── dispatch.sh               # Send task to agent
│   ├── collect.sh                # Read agent result
│   ├── agent-watcher.sh          # Passive agent monitor
│   ├── agent-status.sh           # Agent dashboard
│   └── forge-monitor.sh          # Real-time monitoring dashboard
│
├── configs/
│   └── .tmux.conf                # tmux config (mobile-optimized)
│
├── terraform/                    # Azure VM provisioning (optional)
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars.example
│   └── cloud-init.yaml
│
└── docs/
    ├── ARCHITECTURE.md           # System architecture
    ├── PROCEDURE.md              # Complete setup procedure
    ├── MOBILE-ACCESS.md          # iPhone/iPad access guide
    ├── TERRAFORM.md              # Azure VM guide
    └── TROUBLESHOOTING.md        # Common issues & fixes
```

## Workflow Git

```
main ─────────────────────────────────────────────
  │                                        ↑
  └── feat/scope/feature ──── rebase ──── PR ── squash merge
```

- **Rebase only** : jamais de merge
- **Force-with-lease** : jamais de force push
- **Stability check** : obligatoire avant chaque push
- **Commits** : `type(scope): description`
- **Branches** : `type/scope/description-courte`

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — How the multi-agent system works
- [Mobile Access](docs/MOBILE-ACCESS.md) — iPhone/iPad access guide
- [Terraform](docs/TERRAFORM.md) — Azure VM provisioning
- [Troubleshooting](docs/TROUBLESHOOTING.md) — Common issues and fixes
- [Procedure](docs/PROCEDURE.md) — Complete step-by-step setup

## License

MIT
