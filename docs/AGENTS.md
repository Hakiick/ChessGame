# Agents Guide

## Overview

The workspace provides **15 specialized agents** (skills), all running on **Opus 4.6**. Agents are orchestrated by the **Forge** (Team Lead) which dynamically creates tmux windows and spawns subagents via `Task()`.

## How it works

1. **Forge** (`/forge`) analyzes the User Story and selects the right agents
2. Agent windows are created dynamically in tmux via `forge-add-agents.sh`
3. Each agent window runs a passive monitor (`agent-watcher.sh`) that displays task status
4. The Forge executes work via `Task()` subagents and writes results to `.forge/`
5. After the US is complete, `--cleanup` removes all agent windows

## Agent categories

### Core agents

| Skill | Role |
|-------|------|
| `/forge` | Team Lead: decomposes US, delegates, feedback loops, delivers stable |
| `/init-project` | Analyzes project, generates agents + rules, creates GitHub issues |
| `/next-feature` | Simple linear pipeline (alternative to /forge) |
| `/stabilizer` | Quality gate: build, tests, lint, type-check |
| `/reviewer` | Code review: quality + OWASP security + accessibility |
| `/architect` | Architecture planning (read-only) |
| `/developer` | Generic developer |
| `/tester` | Unit and integration tests |

### Mobile-first agents

| Skill | Role |
|-------|------|
| `/mobile-dev` | Responsive design, touch interactions, viewport, performance |
| `/responsive-tester` | Multi-viewport tests, WCAG, Lighthouse audit |
| `/pwa-dev` | Service workers, manifest, offline-first, installability |

### Infrastructure agents

| Skill | Role |
|-------|------|
| `/frontend-dev` | UI/UX, SPA, responsive mobile-first |
| `/backend-dev` | REST API, business logic, WebSocket |
| `/admin-sys` | Infrastructure, networking, security |
| `/devops` | CI/CD, Docker, cloud, Terraform |

## Agent lifecycle

```
forge-add-agents.sh <agents>  →  Task() subagents  →  forge-add-agents.sh --cleanup
     (create windows)              (execute work)         (remove windows)
```

## Customization

### Add a custom agent

Create a new skill in `.claude/skills/<agent-name>/SKILL.md`:

```yaml
---
name: my-agent
description: "What this agent does"
user-invocable: true
model: opus
---

Tu es l'agent [nom]. Ton rôle est [description].

## Ce que tu fais
- [responsibilities]

## Règles
- Respecte .claude/rules/
- Commite avec format type(scope): description
```

The Forge will automatically detect and use available skills.

## Pipeline execution order

```
1. architect       → Plans and decomposes (if assigned)
2. *-dev agents    → Implement code
3. *-tester agents → Write and run tests
4. reviewer        → Code review
5. stabilizer      → Final verification (ALWAYS LAST)
```
