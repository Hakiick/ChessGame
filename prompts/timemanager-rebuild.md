# PROMPT AUTONOME — Rebuild TimeManager Mobile-First

> **Usage** : Copie-colle ce prompt ENTIER dans une nouvelle session Claude Code.
> Le working directory peut être n'importe où — le prompt gère le clone et le setup.

---

## MISSION

Tu es un orchestrateur autonome. Ta mission est de **rebuild le frontend** du projet TimeManager (repo GitHub : `Hakiick/T-POO-700-STG_1`) en version **mobile-first** avec un effet WOW pour un portfolio.

Tu vas travailler **pendant plusieurs heures**, en totale autonomie, sans intervention humaine. Tu dois gérer toi-même ta mémoire, ton contexte, et ton workflow.

### Règles absolues

- **Tous les commits et push** vont sur le repo `Hakiick/T-POO-700-STG_1`
- **Tu ne touches JAMAIS** au repo `setup-claude-code-mobile-first` — c'est un template source en lecture seule
- **Tu travailles principalement** dans le dossier `frontend/`

### Périmètre backend et docker-compose

Le backend Elixir/Phoenix et le docker-compose sont **en lecture seule par défaut**. Cependant, certaines situations peuvent nécessiter des ajustements mineurs. Voici les cas autorisés :

| Cas | Autorisé ? | Exemple |
|-----|-----------|---------|
| Lire le code backend pour comprendre l'API | ✅ Toujours | Lire les controllers Phoenix pour trouver les routes/endpoints |
| Modifier la config Vite (proxy API) | ✅ Toujours | `vite.config.ts` → proxy `/api` vers le backend |
| Modifier `docker-compose.yml` pour le dev frontend | ✅ Si nécessaire | Ajouter un volume, changer un port exposé, ajouter des variables d'env |
| Ajouter des CORS headers côté backend | ⚠️ Dernier recours | Si le proxy Vite ne suffit pas, modifier `backend/lib/**/endpoint.ex` ou `router.ex` pour ajouter les headers CORS — commit séparé avec scope `fix(backend)` |
| Ajouter/modifier un endpoint API | ❌ Non | Le frontend doit s'adapter aux endpoints existants |
| Refactorer le backend | ❌ Non | Hors scope du rebuild frontend |
| Changer la logique métier backend | ❌ Non | Hors scope |

**Stratégie si tu es bloqué par le backend** :
1. **D'abord** : lis le code backend pour comprendre l'API existante (`backend/lib/`)
2. **Ensuite** : adapte le frontend pour utiliser l'API telle qu'elle est
3. **Si CORS bloque** : configure le proxy dans `vite.config.ts` (solution préférée)
4. **Si le proxy ne suffit pas** : ajoute les headers CORS côté backend (commit séparé `fix(backend): add CORS headers for frontend dev`)
5. **Si un endpoint manque** : mock les données côté frontend avec un composable `useMockData.ts` et ajoute un `// TODO: connect to real API when endpoint available` — ne crée PAS le endpoint backend
6. **Si docker-compose bloque** : modifie-le avec un commit séparé `fix(docker): <description>`

---

## PHASE 0 : SETUP (à faire en premier, une seule fois)

### 0.1 — Cloner le projet et créer la branche

```bash
cd /home/user
git clone https://github.com/Hakiick/T-POO-700-STG_1.git
cd T-POO-700-STG_1
git checkout -b rebuild/mobile-first
```

### 0.2 — Copier le template mobile-first

Copie ces dossiers depuis `/home/user/setup-claude-code-mobile-first/` vers `/home/user/T-POO-700-STG_1/` :

```bash
cp -r /home/user/setup-claude-code-mobile-first/.claude/ /home/user/T-POO-700-STG_1/.claude/
cp -r /home/user/setup-claude-code-mobile-first/scripts/ /home/user/T-POO-700-STG_1/scripts/
cp /home/user/setup-claude-code-mobile-first/CLAUDE.md /home/user/T-POO-700-STG_1/CLAUDE.md
```

**NE PAS copier** : `project.md` du template, `prompts/`, `README.md`, `package.json` du template.

### 0.3 — Adapter le CLAUDE.md

Modifie le `CLAUDE.md` copié dans T-POO-700-STG_1 pour remplacer la section des commandes dev par :

```
# === Dev & Build (Frontend Vue 3 — dossier frontend/) ===
cd /home/user/T-POO-700-STG_1/frontend && npm run dev       # Dev server (Vite)
cd /home/user/T-POO-700-STG_1/frontend && npm run build     # Build production
cd /home/user/T-POO-700-STG_1/frontend && npm run preview   # Preview build
cd /home/user/T-POO-700-STG_1/frontend && npx tsc --noEmit  # Type check
cd /home/user/T-POO-700-STG_1/frontend && npm run lint      # Lint (si configuré)

# Le backend Elixir/Phoenix NE DOIT PAS être modifié.
```

Adapte aussi le `scripts/stability-check.sh` pour qu'il exécute les commandes depuis le dossier `frontend/`.

### 0.4 — Créer le project.md

Crée le fichier `/home/user/T-POO-700-STG_1/project.md` avec le contenu EXACT suivant :

---

# TimeManager — Rebuild Mobile-First

## Project overview

Rebuild complet du frontend de TimeManager, une application de gestion des heures de travail (clock in/out, équipes, overtime, dashboard admin). Le backend Elixir/Phoenix reste inchangé — on ne rebuild que le frontend Vue 3.

**Objectif portfolio** : Démontrer la maîtrise du responsive design, des animations fluides, du PWA, et de l'UX mobile-first sur un vrai projet full-stack de 275+ commits.

## Stack technique

- **Backend** : Elixir/Phoenix 1.7 + PostgreSQL (EXISTANT — NE PAS MODIFIER)
- **Frontend** : Vue 3.5 + TypeScript + Vite (à REBUILD mobile-first)
- **UI Components** : Radix Vue 1.9 (existant — adapter responsive)
- **State** : Pinia 2.2 (existant — garder)
- **Charts** : Unovis (existant — adapter responsive)
- **Styling** : Tailwind CSS 3 (existant — enrichir mobile-first)
- **Icons** : Lucide Vue (existant)
- **HTTP** : Axios (existant)
- **Tests** : Playwright (à configurer pour tests responsive multi-viewport)
- **PWA** : Service Worker + Manifest (existant basique — améliorer)

## Architecture cible (frontend/src/)

```
frontend/src/
├── components/
│   ├── ui/                 # Composants Radix Vue existants (adapter responsive)
│   ├── layout/             # MobileLayout, DesktopLayout, BottomTabBar, StickyHeader
│   ├── clock/              # ClockWidget radial animé, ClockHistory, ClockButton
│   ├── dashboard/          # StatCards animés, WeeklyChart, OvertimeIndicator
│   ├── team/               # TeamGrid, MemberCard, StatusBadge
│   ├── admin/              # ResponsiveTable, ManageModals, MobileFilters
│   ├── auth/               # LoginForm, RegisterForm, ConfirmFlow
│   └── shared/             # LoadingSkeleton, EmptyState, ErrorBoundary, OfflineBanner
├── composables/
│   ├── useMediaQuery.ts    # Détection de breakpoints
│   ├── useBreakpoint.ts    # Helper breakpoints nommés
│   ├── useOnline.ts        # Détection online/offline
│   ├── useSwipe.ts         # Gestion des gestes swipe
│   └── useAnimation.ts     # Helpers d'animation
├── layouts/
│   ├── MobileLayout.vue    # Layout avec BottomTabBar
│   ├── DesktopLayout.vue   # Layout avec Sidebar
│   └── AuthLayout.vue      # Layout pages auth (centré, minimal)
├── pages/
│   ├── Clock.vue           # Page clock in/out (WOW feature)
│   ├── Dashboard.vue       # Dashboard avec stats et graphiques
│   ├── Team.vue            # Vue équipe
│   ├── Admin.vue           # Panel admin
│   ├── Settings.vue        # Paramètres utilisateur
│   ├── Login.vue           # Connexion
│   └── Register.vue        # Inscription
├── styles/
│   ├── design-tokens.css   # Variables CSS (couleurs, spacing, typography)
│   └── animations.css      # Keyframes et classes d'animation
├── api/                    # EXISTANT — NE PAS MODIFIER
├── stores/                 # Pinia stores EXISTANTS — adapter si besoin
├── router.ts               # Adapter les routes
├── App.vue                 # Adapter avec layout switching
└── main.ts                 # Adapter
```

## User Stories

### Phase 1 — Foundation (haute priorité)

- [US-01] Design system mobile-first + setup | Configurer les design tokens responsive dans des variables CSS (couleurs, typographie fluid, espacements, ombres, border-radius). Enrichir tailwind.config.js avec les breakpoints mobile-first (sm:640, md:768, lg:1024, xl:1280, 2xl:1536). Créer les composants UI de base responsive : Button (3 tailles, touch-friendly), Card (avec variantes), Badge, Input (label flottant, 100% width mobile), Modal (fullscreen mobile, centered desktop). Créer les composables : useMediaQuery, useBreakpoint. Le design doit être moderne et professionnel — palette cohérente avec accent color vibrant pour l'effet WOW. | haute
  - Team: mobile-dev, stabilizer
  - Files: frontend/tailwind.config.js, frontend/src/styles/*, frontend/src/components/ui/*, frontend/src/composables/useMediaQuery.ts, frontend/src/composables/useBreakpoint.ts

- [US-02] Layout responsive + navigation mobile | Créer le système de layout dual : MobileLayout.vue avec BottomTabBar (5 onglets : Clock, Dashboard, Team, Admin, Settings — icônes Lucide, badge notification), DesktopLayout.vue avec Sidebar rétractable. StickyHeader avec avatar utilisateur et indicateur de statut. App.vue utilise useBreakpoint pour switcher dynamiquement entre les layouts. Transitions animées entre les pages (slide horizontal mobile, fade desktop). Le router.ts doit être adapté avec les nouvelles pages. | haute | après:US-01
  - Team: mobile-dev, responsive-tester, stabilizer
  - Files: frontend/src/layouts/*, frontend/src/components/layout/*, frontend/src/router.ts, frontend/src/App.vue

### Phase 2 — Core Features (haute priorité)

- [US-03] Clock In/Out mobile-first — WOW feature | C'est LA feature vitrine du portfolio. Créer ClockWidget.vue : cercle SVG radial animé montrant la progression de la journée en temps réel, gros bouton central one-tap clock in/out (min 64x64px) avec animation ripple + changement de couleur au tap, indicateur de statut coloré (vert = dans les heures normales, orange = proche overtime, rouge = overtime dépassé), compteur animé des heures travaillées aujourd'hui (count-up animation), historique scrollable des 5 derniers pointages avec timestamps. Tout doit être fluid et satisfying à utiliser sur mobile. | haute | après:US-02
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/components/clock/*, frontend/src/pages/Clock.vue

- [US-04] Dashboard employé responsive | Stat cards animées en haut (heures aujourd'hui, cette semaine, ce mois, overtime cumulé) avec count-up animation à l'apparition. Graphique hebdomadaire responsive (Unovis bar chart, adapté mobile). Vue switchable semaine/mois avec swipe gesture ou tabs. Indicateur de progression vers objectif horaire. Skeleton loading states pendant le chargement. Tout lisible et fonctionnel sur un écran 375px. | haute | après:US-02
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/components/dashboard/*, frontend/src/pages/Dashboard.vue

- [US-05] Gestion d'équipe mobile | Grille d'avatars responsive (2 colonnes mobile, 3 tablet, 4+ desktop) avec badge de statut temps réel (vert=clocké in, gris=clocké out, orange=en pause). Vue liste alternative pour mobile (toggle grid/list). Card membre avec : nom, rôle, heures aujourd'hui, dernier pointage. Pour les managers : section stats équipe en haut (membres actifs, heures totales, overtime). Filtre par statut (tous, actifs, absents). | haute | après:US-02
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/components/team/*, frontend/src/pages/Team.vue

### Phase 3 — Admin + Auth (moyenne priorité)

- [US-06] Admin panel responsive | Tables admin adaptatives : sur mobile → cards empilées avec les infos clés visibles + expand pour détails. Sur desktop → table classique avec tri et pagination. Modals responsive : fullscreen avec slide-up sur mobile, centered avec backdrop sur desktop. Filtres en bottom sheet glissant sur mobile, sidebar sur desktop. Actions bulk adaptées au touch (checkboxes larges, swipe-to-action). | moyenne | après:US-05
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/components/admin/*, frontend/src/pages/Admin.vue

- [US-07] Auth flow mobile-first | Pages login/register/confirm redesignées : layout centré avec illustration ou gradient en background. Inputs larges 100% width avec labels flottants. Validation inline en temps réel (feedback visuel immédiat). Gestion du clavier virtuel mobile (le formulaire remonte quand le clavier apparaît, pas de contenu caché). Bouton submit sticky en bas sur mobile. Animation de transition entre login et register. Message d'erreur toast en haut. | moyenne | après:US-01
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/components/auth/*, frontend/src/pages/Login.vue, frontend/src/pages/Register.vue

### Phase 4 — PWA + Polish (moyenne priorité)

- [US-08] PWA complète | Améliorer le service worker existant : Cache First pour assets statiques (CSS, JS, images, fonts), Network First pour les appels API, Stale While Revalidate pour les avatars. Mode offline : queue les actions clock in/out en IndexedDB, sync automatique quand la connexion revient. Composant OfflineBanner.vue qui s'affiche en haut quand offline. Install prompt natif avec bouton custom élégant. manifest.json complet avec icônes 192px et 512px, splash screen, theme_color, background_color. Composable useOnline.ts pour détecter le statut réseau. | moyenne | après:US-03
  - Team: pwa-dev, stabilizer
  - Files: frontend/public/manifest.json, frontend/public/sw.js, frontend/src/composables/useOnline.ts, frontend/src/components/shared/OfflineBanner.vue

- [US-09] Animations et micro-interactions WOW | Ajouter partout des animations qui rendent l'app satisfying : transitions de page (slide-left/right sur mobile, crossfade sur desktop via Vue Router transitions), animation stagger sur les listes de cards (chaque card apparaît 50ms après la précédente), boutons avec feedback ripple au tap, compteurs animés (count-up de 0 à la valeur réelle), loading skeletons pulsants pendant le chargement, pull-to-refresh animation sur mobile (rotation spinner). TOUTES les animations doivent être GPU-accelerated : uniquement transform et opacity, JAMAIS width/height/top/left. 60fps obligatoire. | moyenne | après:US-04
  - Team: mobile-dev, stabilizer
  - Files: frontend/src/styles/animations.css, frontend/src/composables/useAnimation.ts, tous les composants

- [US-10] Polish responsive + accessibilité + Lighthouse | Audit complet de chaque composant : vérifier WCAG AA (contraste 4.5:1 texte, 3:1 grands textes), ajouter aria-label sur tous les boutons/icônes sans texte, ajouter role et aria-* sur les composants dynamiques, vérifier que le focus est visible et logique (tab order), touch targets ≥ 44x44px avec espacement suffisant. Tester chaque page sur 7 viewports : 375px, 390px, 430px, 768px, 1024px, 1280px, 1920px. Lighthouse > 90 sur les 4 métriques mobile. Dark mode si le temps le permet (bonus). Optimiser le bundle : lazy-load les routes, tree-shake les icônes, compression images. | moyenne | après:US-09
  - Team: responsive-tester, reviewer, stabilizer
  - Files: tous les composants frontend

## SEO & Performance cibles

- Viewport meta : `width=device-width, initial-scale=1, viewport-fit=cover`
- `100dvh` pour les layouts full-height
- `env(safe-area-inset-*)` pour les notchs iPhone
- Lighthouse mobile > 90 sur Performance, Accessibility, Best Practices, SEO
- Bundle < 200KB gzipped (initial load)
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Images lazy-loaded avec dimensions explicites
- Fonts preloaded

---

### 0.5 — Créer le board.md de coordination

Écris le fichier `.claude/board.md` dans le projet avec :

```markdown
# Board — TimeManager Rebuild Mobile-First

## Projet
- **Nom** : TimeManager Rebuild
- **Repo** : Hakiick/T-POO-700-STG_1
- **Branche base** : rebuild/mobile-first
- **Objectif** : Rebuild frontend Vue 3 mobile-first pour portfolio

## US Courante
- **US** : (en attente)
- **Branche** : —
- **Statut** : —
- **Équipe** : —

## Plan d'exécution
1. US-01 : Design system (mobile-dev, stabilizer)
2. US-02 : Layout + nav (mobile-dev, responsive-tester, stabilizer)
3. US-03 : Clock WOW (mobile-dev, stabilizer)
4. US-04 : Dashboard (mobile-dev, stabilizer)
5. US-05 : Team (mobile-dev, stabilizer)
6. US-06 : Admin (mobile-dev, stabilizer)
7. US-07 : Auth (mobile-dev, stabilizer)
8. US-08 : PWA (pwa-dev, stabilizer)
9. US-09 : Animations (mobile-dev, stabilizer)
10. US-10 : Polish + a11y (responsive-tester, reviewer, stabilizer)

## Décisions techniques
- Backend Elixir/Phoenix : NE PAS MODIFIER (dossier backend/)
- Frontend Vue 3 + Vite : REBUILD mobile-first (dossier frontend/)
- Tailwind CSS : enrichir, ne pas remplacer
- Radix Vue : garder, adapter responsive
- Pinia stores : garder, adapter si besoin
- API modules (frontend/src/api/) : garder tels quels
- router.ts : adapter avec nouvelles pages
- Nouvelle archi : layouts/, pages/, composables/, styles/

## Journal
(agents : ajoutez ici vos messages au fur et à mesure)

## US Terminées
(vide)
```

### 0.6 — Premier commit et push

```bash
cd /home/user/T-POO-700-STG_1
git add .claude/ scripts/ CLAUDE.md project.md
git commit -m "chore(setup): add mobile-first rebuild template and project definition"
git push -u origin rebuild/mobile-first
```

### 0.7 — Vérifier la stabilité initiale

```bash
cd /home/user/T-POO-700-STG_1/frontend
npm install
npm run build
```

Si le build échoue, corrige AVANT de continuer. Le projet doit être stable.

---

## PHASE 1+ : EXÉCUTION AUTONOME — BOUCLE DES 10 US

Maintenant tu passes en mode orchestrateur. Répète ce workflow pour chaque US, de 01 à 10, dans l'ordre.

### Pour chaque US :

#### 1. Vérifier l'éligibilité
Vérifie que les US dépendantes sont terminées (cf. `après:US-XX` dans project.md).
Tu peux aussi utiliser `bash scripts/check-us-eligibility.sh <numero>` si le script est adapté.

#### 2. Créer la branche feature
```bash
git checkout rebuild/mobile-first
git pull origin rebuild/mobile-first
git checkout -b feat/frontend/<description-kebab>
git push -u origin feat/frontend/<description-kebab>
```

Noms de branches :
- US-01 → `feat/frontend/design-system-mobile`
- US-02 → `feat/frontend/responsive-layout-nav`
- US-03 → `feat/frontend/clock-widget-wow`
- US-04 → `feat/frontend/dashboard-responsive`
- US-05 → `feat/frontend/team-management-mobile`
- US-06 → `feat/frontend/admin-panel-responsive`
- US-07 → `feat/frontend/auth-flow-mobile`
- US-08 → `feat/frontend/pwa-offline-first`
- US-09 → `feat/frontend/animations-micro-interactions`
- US-10 → `feat/frontend/polish-a11y-lighthouse`

#### 3. Mettre à jour board.md
Renseigne la US courante, la branche, le statut "in-progress", l'équipe.

#### 4. Implémenter avec `/forge` (mode team agents — OBLIGATOIRE)

**YOU MUST** utiliser `/forge` pour chaque US. C'est le mode team agents : le forge décompose la US, lance les agents spécialisés dans des panes tmux séparés, orchestre les boucles de feedback, et livre stable.

```bash
# Lancer le forge (il détecte automatiquement les agents à utiliser via board.md)
/forge
# Ou avec un numéro d'issue GitHub si les issues sont créées :
/forge <issue-number>
```

Le forge va automatiquement :
1. Décomposer la US en sous-tâches
2. Lancer les agents spécialisés (mobile-dev, responsive-tester, pwa-dev, etc.)
3. Dispatcher les tâches aux agents via `scripts/dispatch.sh`
4. Collecter les résultats via `scripts/collect.sh`
5. Gérer les boucles de feedback (test → fix → re-test)
6. Stabiliser avant de rendre la main

**Agents disponibles par US** (le forge les sélectionne automatiquement) :
- **mobile-dev** : Développeur mobile-first (toutes les US)
- **responsive-tester** : Testeur multi-viewports (US-02, US-05, US-10)
- **pwa-dev** : Spécialiste PWA (US-08)
- **reviewer** : Revue qualité (US-03, US-06, US-10)
- **stabilizer** : Build + lint + type-check (toutes les US)

**Boucles de feedback gérées par le forge** :
- Tester trouve un bug → retour au mobile-dev → max **3 boucles**
- Reviewer trouve un problème → retour au mobile-dev → max **2 boucles**
- Stabilizer échoue → fix et re-run → max **5 boucles**

**Si le forge n'est pas disponible** (fallback linéaire) :
Utilise les skills individuellement dans cet ordre : `/architect` → `/mobile-dev` → `/responsive-tester` → `/reviewer` → `/stabilizer`

#### 5. Commits atomiques au fur et à mesure
Format : `type(scope): description courte`

Exemples :
```
feat(ui): add responsive Button with 3 sizes and touch feedback
feat(ui): add Card component with hover and tap variants
feat(layout): add BottomTabBar with 5 tabs and active indicator
feat(layout): add MobileLayout with sticky header
feat(clock): add radial SVG clock widget with real-time animation
feat(clock): add one-tap clock button with ripple effect
feat(dashboard): add animated stat cards with count-up
feat(team): add responsive avatar grid with status badges
feat(admin): add adaptive table (cards mobile, table desktop)
feat(auth): add login form with floating labels
feat(pwa): add service worker with cache-first strategy
feat(pwa): add offline action queue with IndexedDB
perf(ui): add stagger animations on card lists
a11y(ui): add ARIA labels to all interactive elements
test(responsive): add multi-viewport Playwright tests
```

#### 6. Capturer des screenshots pour le portfolio

**YOU MUST** prendre des screenshots après chaque US visuelle (toutes sauf US-08 PWA).

Crée un script Playwright de capture dans `frontend/scripts/screenshots.ts` lors de la US-01, puis réutilise-le à chaque US. Les screenshots servent au portfolio du développeur.

**Setup (à faire une fois dans US-01)** :
```bash
cd /home/user/T-POO-700-STG_1/frontend
npx playwright install chromium
```

**Script de capture** (`frontend/scripts/screenshots.ts`) :
```typescript
import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'clock', path: '/clock' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'team', path: '/team' },
  { name: 'admin', path: '/admin' },
  { name: 'login', path: '/login' },
];

async function capture() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    for (const p of PAGES) {
      try {
        await page.goto(`http://localhost:5173${p.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000); // laisser les animations se jouer
        await page.screenshot({
          path: `screenshots/${p.name}-${vp.name}.png`,
          fullPage: false,
        });
        console.log(`✓ ${p.name}-${vp.name}.png`);
      } catch (e) {
        console.log(`✗ ${p.name}-${vp.path} — skipped (page not ready)`);
      }
    }
    await context.close();
  }
  // Vidéo de la feature principale (Clock) — mobile
  const videoCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    recordVideo: { dir: 'screenshots/videos/', size: { width: 375, height: 812 } },
  });
  const videoPage = await videoCtx.newPage();
  try {
    await videoPage.goto('http://localhost:5173/clock', { waitUntil: 'networkidle' });
    await videoPage.waitForTimeout(3000); // capturer l'animation du clock widget
    // Simuler un tap sur le bouton clock
    const clockBtn = videoPage.locator('[data-testid="clock-button"], button:has-text("Clock")').first();
    if (await clockBtn.isVisible()) {
      await clockBtn.click();
      await videoPage.waitForTimeout(2000);
    }
  } catch (e) {
    console.log('Video capture: clock page not ready, skipped interaction');
  }
  await videoCtx.close(); // la vidéo est sauvée automatiquement à la fermeture
  await browser.close();
  console.log('\n📸 Screenshots saved in screenshots/');
  console.log('🎥 Video saved in screenshots/videos/');
}

capture();
```

**Quand capturer** :
- Après chaque US visuelle terminée et stabilisée
- AVANT le rebase/push (comme ça les screenshots sont dans la PR)
- Le dev server doit tourner (`npm run dev` en background)

```bash
# Lancer le dev server en background
cd /home/user/T-POO-700-STG_1/frontend && npm run dev &
# Attendre que le serveur soit prêt
sleep 5
# Capturer
cd /home/user/T-POO-700-STG_1/frontend && npx tsx scripts/screenshots.ts
# Arrêter le dev server
kill %1
```

**Nommage des screenshots** (dans `frontend/screenshots/`) :
```
screenshots/
├── clock-mobile.png        ← Feature WOW sur iPhone
├── clock-tablet.png
├── clock-desktop.png
├── dashboard-mobile.png
├── dashboard-tablet.png
├── dashboard-desktop.png
├── team-mobile.png
├── ...
└── videos/
    └── clock-interaction.webm  ← Vidéo de l'interaction clock in/out
```

**Committer les screenshots** avec chaque US :
```
docs(screenshots): capture US-XX responsive screenshots
```

**Ajouter `screenshots/` au `.gitignore` si les fichiers sont trop lourds** — dans ce cas, les garder localement et ne committer qu'un `screenshots/README.md` listant les captures disponibles.

#### 7. Stabiliser
```bash
cd /home/user/T-POO-700-STG_1/frontend && npm run build && npx tsc --noEmit
```
Ou si le script est adapté : `bash scripts/stability-check.sh`

**NE PASSE PAS** à l'étape suivante si la stabilité échoue.

#### 8. Rebase + push
```bash
git fetch origin rebuild/mobile-first
git rebase origin/rebuild/mobile-first
# Re-vérifier la stabilité après rebase
cd /home/user/T-POO-700-STG_1/frontend && npm run build
git push --force-with-lease origin feat/frontend/<description>
```

#### 9. Créer la PR
```bash
gh pr create \
  --base rebuild/mobile-first \
  --title "feat(frontend): <description courte de la US>" \
  --body "## Summary
- <1-3 bullet points>

## Test plan
- [ ] Build passe sans erreur
- [ ] Type-check passe
- [ ] Responsive testé sur 375px, 768px, 1280px
- [ ] Touch targets ≥ 44x44px
- [ ] Animations fluides 60fps

## Stability
✓ npm run build — OK
✓ npx tsc --noEmit — OK"
```

#### 10. Merger la PR
```bash
gh pr merge --squash --delete-branch
```

#### 11. Mettre à jour board.md
- Déplace la US dans "US Terminées" avec la date et un résumé
- Ajoute une entrée dans "Journal"
- Vide la section "US Courante"

#### 12. Nettoyage contexte
Si le contexte devient lourd après 2-3 US, utilise `/compact`. Après un compact, relis en priorité :
1. `board.md` (ta mémoire persistante)
2. `project.md` (les US restantes)
3. Le fichier que tu étais en train de modifier

#### → Retour à l'étape 1 pour la US suivante.

---

## RÈGLES D'AUTONOMIE

### Mémoire persistante
- **`.claude/board.md`** est ta mémoire. Mets-le à jour SYSTÉMATIQUEMENT.
- Après chaque US terminée → résumé dans board.md
- Après chaque `/compact` → relis board.md en premier
- Le board.md est committé avec les changements de chaque US

### Gestion des erreurs

| Problème | Solution | Max tentatives |
|----------|----------|----------------|
| Build échoue | Lis les logs, corrige le code, re-build | 5 |
| Tests échouent | Corrige le CODE, pas le test | 3 |
| Type-check échoue | Corrige les types, ajoute les types manquants | 5 |
| Conflit rebase | Résous manuellement, `git add` + `git rebase --continue` | 2, sinon `--abort` et recommence |
| npm install échoue | Vérifie package.json, supprime node_modules et réessaie | 3 |
| gh CLI échoue | Vérifie l'auth, réessaie | 3 |
| CORS bloque les appels API | 1) proxy Vite, 2) si insuffisant → CORS headers backend | 2 |
| Endpoint API manquant | Mock les données frontend + TODO, ne crée PAS l'endpoint | — |
| Docker-compose bloque le dev | Ajuste la config, commit séparé `fix(docker): ...` | 2 |
| Backend incompréhensible | Lis les controllers/router Phoenix, trace les routes | — |

### INTERDIT ❌
- Refactorer ou ajouter des endpoints au backend (lire = OK, CORS = dernier recours)
- Modifier la logique métier backend
- Utiliser `git push --force` (uniquement `--force-with-lease`)
- Utiliser `git merge` (uniquement `rebase`)
- Désactiver un test ou une règle lint
- Ajouter `console.log` en production
- Utiliser `any` en TypeScript
- Committer des fichiers `.env` ou secrets
- Toucher au repo `setup-claude-code-mobile-first`

### OBLIGATOIRE ✅
- Tous les commits sur `Hakiick/T-POO-700-STG_1`
- Travailler dans `frontend/` uniquement
- Garder les API modules existants (`frontend/src/api/`)
- Garder les Pinia stores existants
- TypeScript strict — pas de `any`
- CSS mobile-first (base = mobile, `min-width` pour les breakpoints)
- Touch targets ≥ 44x44px
- Animations GPU-only (`transform`, `opacity`)
- Commits atomiques format `type(scope): description`
- Stability check AVANT chaque push
- board.md à jour à chaque changement d'état

---

## VISION WOW — Ce qui doit impressionner un recruteur

### Le Clock Widget (US-03) — Pièce maîtresse
C'est la première chose qu'on verra dans le portfolio. Il doit être SPECTACULAIRE :
- Cercle SVG radial animé montrant la progression de la journée
- Le cercle se remplit en temps réel (comme un progress ring)
- Gros bouton central (min 64px) avec animation ripple satisfying au tap
- Couleurs dynamiques : vert (normal) → orange (proche overtime) → rouge (overtime)
- Compteur digital animé des heures travaillées (count-up fluide)
- Les 5 derniers pointages affichés en dessous avec timestamps
- Le tout doit donner envie de cliquer

### Les transitions de page
- Sur mobile : slide horizontal naturel (comme une app iOS)
- Sur desktop : fade/crossfade élégant
- Stagger animation quand une liste de cards apparaît

### Le Dashboard
- Les chiffres s'animent de 0 à leur valeur (count-up)
- Les graphiques responsive s'adaptent parfaitement au viewport
- Cards avec subtle shadow qui change au hover/tap

### L'ensemble du design
- Palette moderne et cohérente (pas de couleurs random)
- Typographie fluid (clamp() pour le sizing)
- Espacement généreux sur mobile (pas de crampage)
- Composants arrondis, ombres douces, clean
- Dark mode = bonus impressionnant si le temps le permet

---

## CRITÈRES DE SUCCÈS FINAUX

Le projet est terminé quand TOUTES ces conditions sont remplies :

1. ✅ Les 10 US sont mergées dans `rebuild/mobile-first`
2. ✅ `npm run build` passe sans erreur
3. ✅ `npx tsc --noEmit` passe sans erreur
4. ✅ L'app est responsive de 375px à 1920px (pas de overflow, pas de layout cassé)
5. ✅ Touch targets ≥ 44x44px sur toutes les interactions
6. ✅ Animations fluides à 60fps (GPU-accelerated)
7. ✅ PWA installable avec mode offline basique
8. ✅ WCAG AA respecté (contraste, ARIA, focus visible)
9. ✅ Le board.md reflète les 10 US terminées avec résumés
10. ✅ Screenshots capturés pour les pages clés (mobile, tablet, desktop) dans `frontend/screenshots/`
11. ✅ Vidéo de l'interaction clock in/out capturée dans `frontend/screenshots/videos/`
12. ✅ L'effet WOW est là — le clock widget est spectaculaire

---

## RAPPEL FINAL

1. Exécute la Phase 0 (setup complet)
2. Lance la boucle des US (Phase 1+)
3. Travaille en autonomie totale — ne t'arrête pas
4. Mets à jour board.md après chaque US
5. Ne t'arrête que quand les 10 US sont done et les critères de succès validés

**Commence maintenant. Go.**
