import { test } from '@playwright/test';

// Helper: click a board square by file (a-h) and rank (1-8)
async function clickSquare(page: import('@playwright/test').Page, file: string, rank: number) {
  const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - rank;
  const square = page.locator(`button[data-row="${row}"][data-col="${col}"]`);
  await square.click();
  await page.waitForTimeout(150);
}

async function makeMove(
  page: import('@playwright/test').Page,
  fromFile: string,
  fromRank: number,
  toFile: string,
  toRank: number,
) {
  await clickSquare(page, fromFile, fromRank);
  await clickSquare(page, toFile, toRank);
  await page.waitForTimeout(400);
}

// Helper: set theme
async function setTheme(page: import('@playwright/test').Page, themeId: string) {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(new RegExp(`Select ${themeId}`, 'i')).click();
  await page.waitForTimeout(500);
}

// Helper: start a game
async function startGame(page: import('@playwright/test').Page) {
  await page.goto('/play');
  await page.waitForLoadState('networkidle');

  const whiteInput = page.getByLabel(/white/i);
  const blackInput = page.getByLabel(/black/i);

  if (await whiteInput.isVisible()) {
    await whiteInput.fill('Alice');
    await blackInput.fill('Bob');

    const timeButton = page.getByRole('radio', { name: /5/i });
    if (await timeButton.isVisible()) {
      await timeButton.click();
    }

    const startButton = page.getByRole('button', { name: /start|play/i });
    await startButton.click();
    await page.waitForTimeout(800);
  }
}

/*
 * Each test = one video clip.
 * Playwright records the entire browser context as a .webm video.
 * We then assemble clips with FFmpeg in scripts/generate-demo.ts.
 *
 * Run with: npx playwright test e2e/demo-video.spec.ts --project=demo
 */

// Scene 1: Landing page with animations (~5s)
test('scene-01-landing', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const playBtn = page.getByRole('link', { name: /play now/i });
  await playBtn.hover();
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
  await page.waitForTimeout(2000);
});

// Scene 2: Settings - cycle through themes (~8s)
test('scene-02-themes', async ({ page }) => {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2500);

  const marvel = page.getByLabel(/select marvel/i);
  if (await marvel.isVisible()) {
    await marvel.click();
    await page.waitForTimeout(1500);
  }

  const pokemon = page.getByLabel(/select pokemon/i);
  if (await pokemon.isVisible()) {
    await pokemon.click();
    await page.waitForTimeout(1500);
  }

  const neon = page.getByLabel(/select neon/i);
  if (await neon.isVisible()) {
    await neon.click();
    await page.waitForTimeout(1500);
  }

  const classic = page.getByLabel(/select classic/i);
  if (await classic.isVisible()) {
    await classic.click();
    await page.waitForTimeout(1000);
  }
});

// Scene 3: Game setup (~4s)
test('scene-03-setup', async ({ page }) => {
  await page.goto('/play');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const whiteInput = page.getByLabel(/white/i);
  const blackInput = page.getByLabel(/black/i);

  if (await whiteInput.isVisible()) {
    await whiteInput.click();
    await whiteInput.pressSequentially('Alice', { delay: 80 });
    await page.waitForTimeout(300);
    await blackInput.click();
    await blackInput.pressSequentially('Bob', { delay: 80 });
    await page.waitForTimeout(300);

    const timeButton = page.getByRole('radio', { name: /5/i });
    if (await timeButton.isVisible()) {
      await timeButton.click();
      await page.waitForTimeout(500);
    }
  }
  await page.waitForTimeout(1000);
});

// Scene 4: Gameplay - Scholar's Mate with effects (~15s)
test('scene-04-gameplay', async ({ page }) => {
  await startGame(page);
  await page.waitForTimeout(1000);

  // 1. e4
  await makeMove(page, 'e', 2, 'e', 4);
  await page.waitForTimeout(500);
  // 1... e5
  await makeMove(page, 'e', 7, 'e', 5);
  await page.waitForTimeout(500);
  // 2. Bc4
  await makeMove(page, 'f', 1, 'c', 4);
  await page.waitForTimeout(500);
  // 2... Nc6
  await makeMove(page, 'b', 8, 'c', 6);
  await page.waitForTimeout(500);
  // 3. Qh5
  await makeMove(page, 'd', 1, 'h', 5);
  await page.waitForTimeout(500);
  // 3... Nf6?? (blunder)
  await makeMove(page, 'g', 8, 'f', 6);
  await page.waitForTimeout(500);
  // 4. Qxf7# (checkmate!)
  await makeMove(page, 'h', 5, 'f', 7);
  await page.waitForTimeout(4000);
});

// Scene 5: Neon theme game (~10s)
test('scene-05-neon-game', async ({ page }) => {
  await setTheme(page, 'neon');
  await startGame(page);
  await page.waitForTimeout(800);

  await makeMove(page, 'd', 2, 'd', 4);
  await page.waitForTimeout(400);
  await makeMove(page, 'd', 7, 'd', 5);
  await page.waitForTimeout(400);
  await makeMove(page, 'c', 2, 'c', 4);
  await page.waitForTimeout(400);
  await makeMove(page, 'e', 7, 'e', 6);
  await page.waitForTimeout(400);
  await makeMove(page, 'b', 1, 'c', 3);
  await page.waitForTimeout(400);
  await makeMove(page, 'g', 8, 'f', 6);
  await page.waitForTimeout(2000);
});

// Scene 6: Marvel theme game (~8s)
test('scene-06-marvel-game', async ({ page }) => {
  await setTheme(page, 'marvel');
  await startGame(page);
  await page.waitForTimeout(800);

  await makeMove(page, 'e', 2, 'e', 4);
  await page.waitForTimeout(400);
  await makeMove(page, 'c', 7, 'c', 5);
  await page.waitForTimeout(400);
  await makeMove(page, 'g', 1, 'f', 3);
  await page.waitForTimeout(400);
  await makeMove(page, 'd', 7, 'd', 6);
  await page.waitForTimeout(400);
  await makeMove(page, 'd', 2, 'd', 4);
  await page.waitForTimeout(2000);
});

// Scene 7: Move history & replay (~8s)
test('scene-07-replay', async ({ page }) => {
  await startGame(page);
  await page.waitForTimeout(500);

  await makeMove(page, 'e', 2, 'e', 4);
  await makeMove(page, 'e', 7, 'e', 5);
  await makeMove(page, 'g', 1, 'f', 3);
  await makeMove(page, 'b', 8, 'c', 6);
  await makeMove(page, 'f', 1, 'b', 5);
  await makeMove(page, 'a', 7, 'a', 6);

  await page.waitForTimeout(800);

  const firstBtn = page.getByRole('button', { name: /first/i });
  const nextBtn = page.getByRole('button', { name: /next/i });

  if (await firstBtn.isVisible()) {
    await firstBtn.click();
    await page.waitForTimeout(800);

    for (let i = 0; i < 6; i++) {
      await nextBtn.click();
      await page.waitForTimeout(600);
    }
  }

  await page.waitForTimeout(1000);
});

// Scene 8: Mobile viewport (~6s)
test('scene-08-mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.goto('/play');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const whiteInput = page.getByLabel(/white/i);
  if (await whiteInput.isVisible()) {
    await whiteInput.fill('Alice');
    const blackInput = page.getByLabel(/black/i);
    await blackInput.fill('Bob');
    const timeButton = page.getByRole('radio', { name: /5/i });
    if (await timeButton.isVisible()) {
      await timeButton.click();
    }
    const startButton = page.getByRole('button', { name: /start|play/i });
    await startButton.click();
    await page.waitForTimeout(1500);
  }

  await makeMove(page, 'e', 2, 'e', 4);
  await makeMove(page, 'e', 7, 'e', 5);
  await page.waitForTimeout(1500);
});
