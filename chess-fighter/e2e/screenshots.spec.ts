import { test, expect } from '@playwright/test';

const THEMES = ['classic', 'marvel', 'pokemon', 'neon'] as const;

const SCREENSHOT_DIR = 'screenshots';

// Helper: take a named screenshot
async function screenshot(page: import('@playwright/test').Page, name: string) {
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: false,
  });
}

// Helper: set theme via settings page
async function setTheme(page: import('@playwright/test').Page, themeId: string) {
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(new RegExp(`Select ${themeId}`, 'i')).click();
  await page.waitForTimeout(300); // Wait for theme transition
}

// Helper: start a game with default players
async function startGame(page: import('@playwright/test').Page) {
  await page.goto('/play');
  await page.waitForLoadState('networkidle');

  // Fill player names
  const whiteInput = page.getByLabel(/white/i);
  const blackInput = page.getByLabel(/black/i);

  if (await whiteInput.isVisible()) {
    await whiteInput.fill('Alice');
    await blackInput.fill('Bob');

    // Select 5 min time
    const timeButton = page.getByRole('radio', { name: /5/i });
    if (await timeButton.isVisible()) {
      await timeButton.click();
    }

    // Click start/play
    const startButton = page.getByRole('button', { name: /start|play/i });
    await startButton.click();
    await page.waitForTimeout(500);
  }
}

// Helper: make a move by clicking squares
async function clickSquare(page: import('@playwright/test').Page, file: string, rank: number) {
  const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - rank;
  const square = page.locator(`button[data-row="${row}"][data-col="${col}"]`);
  await square.click();
  await page.waitForTimeout(200);
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
  await page.waitForTimeout(300);
}

test.describe('Screenshot Capture', () => {
  // Scene 1: Landing page / Menu
  test('landing-page', async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations
    await screenshot(page, `01-landing-${viewport}`);
  });

  // Scene 2: Settings page with all themes
  for (const theme of THEMES) {
    test(`settings-${theme}`, async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;
      await setTheme(page, theme);
      await screenshot(page, `02-settings-${theme}-${viewport}`);
    });
  }

  // Scene 3: Game start (setup phase)
  test('game-setup', async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    await page.goto('/play');
    await page.waitForLoadState('networkidle');
    await screenshot(page, `03-game-setup-${viewport}`);
  });

  // Scene 4: Game in progress (initial position)
  test('game-start', async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    await startGame(page);
    await screenshot(page, `04-game-start-${viewport}`);
  });

  // Scene 5: Mid-game position
  test('mid-game', async ({ page }, testInfo) => {
    const viewport = testInfo.project.name;
    await startGame(page);

    // Play a few moves (Italian Game opening)
    await makeMove(page, 'e', 2, 'e', 4); // 1. e4
    await makeMove(page, 'e', 7, 'e', 5); // 1... e5
    await makeMove(page, 'g', 1, 'f', 3); // 2. Nf3
    await makeMove(page, 'b', 8, 'c', 6); // 2... Nc6
    await makeMove(page, 'f', 1, 'c', 4); // 3. Bc4
    await makeMove(page, 'f', 8, 'c', 5); // 3... Bc5

    await screenshot(page, `05-midgame-${viewport}`);
  });

  // Scene 6: Each theme with a game in progress
  for (const theme of THEMES) {
    test(`theme-game-${theme}`, async ({ page }, testInfo) => {
      const viewport = testInfo.project.name;
      await setTheme(page, theme);
      await startGame(page);

      // Play opening moves
      await makeMove(page, 'e', 2, 'e', 4);
      await makeMove(page, 'e', 7, 'e', 5);
      await makeMove(page, 'g', 1, 'f', 3);
      await makeMove(page, 'b', 8, 'c', 6);

      await screenshot(page, `06-theme-${theme}-game-${viewport}`);
    });
  }
});
