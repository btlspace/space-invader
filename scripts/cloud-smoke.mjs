import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const PORT = process.env.PORT || '4173';
const URL = process.env.TEST_URL || `http://127.0.0.1:${PORT}`;
const OUT_DIR = process.env.OUT_DIR || 'artifacts';

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getState(page) {
  const stateText = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== 'function') {
      return null;
    }
    return window.render_game_to_text();
  });

  if (!stateText) {
    throw new Error('window.render_game_to_text is missing or returned empty output');
  }

  return JSON.parse(stateText);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function captureScenario(page, name, summary, consoleErrors) {
  const screenshotPath = path.join(OUT_DIR, `${name}.png`);
  const statePath = path.join(OUT_DIR, `${name}.state.json`);

  const state = await getState(page);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf8');

  summary.push({ name, state, screenshotPath, consoleErrorCount: consoleErrors.length });
  return state;
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const summary = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Scenario 1: start game from menu.
  await page.click('body');
  let s1 = null;
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Space');
    await wait(350);
    s1 = await getState(page);
    if (s1.mode === 'playing') {
      break;
    }
  }

  if (!s1 || s1.mode !== 'playing') {
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    });
    await wait(350);
    s1 = await getState(page);
  }

  if (!s1 || s1.mode !== 'playing') {
    await page.evaluate(() => {
      const game = window.phaserGame;
      if (game && game.scene && game.scene.keys && game.scene.keys.MenuScene) {
        game.scene.start('GameScene');
      }
    });
    await wait(350);
    s1 = await getState(page);
  }

  await captureScenario(page, '01-started', summary, consoleErrors);
  assert(s1.mode === 'playing', `Expected mode=playing after start, got ${s1.mode}`);

  // Scenario 2: move and shoot.
  const startX = s1.player?.x ?? 0;
  await page.keyboard.down('ArrowRight');
  await wait(350);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Space');
  await wait(450);
  const s2 = await captureScenario(page, '02-move-shoot', summary, consoleErrors);
  assert((s2.player?.x ?? 0) > startX, 'Expected player to move right after ArrowRight input');

  // Scenario 3: pause and resume.
  await page.keyboard.press('Escape');
  await wait(300);
  const pausedState = await getState(page);
  assert(pausedState.paused === true, 'Expected paused=true after Escape');
  await captureScenario(page, '03-paused', summary, consoleErrors);

  await page.keyboard.press('Escape');
  await wait(300);
  const resumedState = await getState(page);
  assert(resumedState.paused === false, 'Expected paused=false after second Escape');
  await captureScenario(page, '04-resumed', summary, consoleErrors);

  // Scenario 4: restart path.
  await page.evaluate(() => {
    if (window.sceneGame && typeof window.sceneGame.restart === 'function') {
      window.sceneGame.restart();
      return;
    }
    if (window.phaserSceneGame && typeof window.phaserSceneGame.restart === 'function') {
      window.phaserSceneGame.restart();
    }
  });
  await wait(250);
  const s4 = await captureScenario(page, '05-restarted', summary, consoleErrors);
  assert(s4.level === 1, `Expected level reset to 1, got ${s4.level}`);
  assert(s4.score === 0, `Expected score reset to 0, got ${s4.score}`);

  const summaryPath = path.join(OUT_DIR, 'summary.json');
  const consolePath = path.join(OUT_DIR, 'console-errors.json');

  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  await fs.writeFile(consolePath, JSON.stringify({ errors: consoleErrors }, null, 2), 'utf8');

  await browser.close();

  if (consoleErrors.length) {
    throw new Error(`Console errors detected: ${consoleErrors.length}`);
  }

  console.log('Regression smoke test complete');
  console.log(`URL=${URL}`);
  console.log(`OutDir=${OUT_DIR}`);
  console.log(`Scenarios=${summary.length}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});



