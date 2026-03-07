import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = process.env.PORT || '4173';
const URL = process.env.TEST_URL || `http://127.0.0.1:${PORT}`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts';

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.keyboard.press('Space');
  await page.waitForTimeout(600);

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(350);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);

  const stateText = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== 'function') {
      return null;
    }
    return window.render_game_to_text();
  });

  if (!stateText) {
    throw new Error('window.render_game_to_text is missing or returned empty output');
  }

  const screenshotPath = path.join(OUT_DIR, 'gameplay.png');
  const statePath = path.join(OUT_DIR, 'state.json');
  const consolePath = path.join(OUT_DIR, 'console-errors.json');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  await fs.writeFile(statePath, stateText, 'utf8');
  await fs.writeFile(consolePath, JSON.stringify({ errors: consoleErrors }, null, 2), 'utf8');

  await browser.close();

  console.log('Smoke test complete');
  console.log(`URL=${URL}`);
  console.log(`Screenshot=${screenshotPath}`);
  console.log(`State=${statePath}`);
  console.log(`ConsoleErrors=${consoleErrors.length}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
