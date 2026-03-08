Original prompt: PLEASE IMPLEMENT THIS PLAN: Plan d’amélioration + débuggage Space Invader (Phaser 3) with gameplay bug fixes, deterministic test hooks, and reproducible validation loop.

## 2026-03-07 - Baseline
- Repository cloned in `C:\src\space-invader` because `C:\Users\alanb\Documents\Git` is not writable in this environment.
- Existing codebase uses vanilla Canvas modules (not Phaser runtime yet).

## 2026-03-07 - Implemented
- Added stable scene naming wrappers: `BootScene`, `GameScene`, `MenuScene`, `UIScene`.
- Added deterministic automation/test hooks in `js/main.js`:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Promoted `SceneGame` as canonical state source with explicit mode transitions:
  - `playing`, `paused`, `game_over`
  - restart path with full state reset (`level`, `score`, `lives`, entities)
- Fixed duplicated input listeners by binding player keyboard controls only once.
- Fixed weapon upgrade logic using per-weapon `maxLevel` (previously compared against undefined config key).
- Hardened projectile collision against tunneling using sub-step movement updates.
- Hardened enemy bullet collision similarly.
- Improved enemy boundary behavior to avoid out-of-bounds drift and direction jitter at edges.
- Updated overlay/menu flow to use the new mode model and reliable reset/resume behavior.

## Current blockers
- Node.js is not available in shell (`node` command not found), so automated Playwright run could not be executed.
- Because of missing Node runtime, no scripted browser validation artifacts were generated yet.

## TODO (next pass)
- Install Node.js + Playwright, then run deterministic smoke scenarios 3 times.
- Capture screenshot + `render_game_to_text` snapshots for:
  - start menu
  - in-game shooting/collision
  - game over + restart
- Migrate runtime fully to Phaser 3 scene system if still required after stabilization pass.

## 2026-03-07 - Full repo audit and agent file update
- Read all source files in repository root and `js/` modules to build a full technical audit.
- Created `AGENTS.md` with:
  - priority bug list (P0/P1/P2),
  - execution roadmap for debug and improvements,
  - migration decision criteria for Phaser 3.
- Confirmed blocker remains: Node.js missing in environment (`node` command not found), so Playwright loop is still blocked.
- Recommended sequence remains: tooling baseline -> P0/P1 fixes -> hardening -> product polish.

## 2026-03-07 - Immediate P1 fixes (no Node runtime)
- `js/drops.js`: removed power-up sound trigger on drop spawn; kept sound only on pickup.
- `js/sceneOverlay.js`: subtitle typewriter now preserves rich HTML subtitles (ex: `<kbd>`) instead of stripping formatting.
- `js/enemies.js`: clamped generated row/column counts to viewport-derived bounds to avoid off-screen enemy grids at higher levels.
- Validation note: no Playwright/browser automation run possible yet because Node.js is still missing.

## 2026-03-07 - WSL runtime validation executed
- WSL runtime confirmed functional with Node.js (`v22.22.0`).
- Installed project Playwright runtime in WSL and downloaded Chromium.
- Ran skill Playwright client against local server (`output/web-game`):
  - state snapshots generated for 3 iterations,
  - no `errors-*.json` generated (no console/page errors),
  - state confirms active gameplay and score progression up to 3 in one run.
- Known artifact caveat: skill client screenshot helper captured the particle/background canvas in this app setup.
- Ran secondary full-page Playwright smoke script (`scripts/cloud-smoke.mjs`) for visual verification:
  - screenshot captured gameplay UI + enemies + player,
  - `artifacts/console-errors.json` empty,
  - `artifacts/state.json` valid and mode=`playing`.

## 2026-03-07 - Capture fix and cleanup
- Added automation-aware guard in `js/particles-config.js` to skip particles during automated runs (`navigator.webdriver` or test query flag), ensuring a single gameplay canvas for screenshot tooling.
- Added `.gitignore` entries for local test/runtime artifacts (`node_modules`, `output`, `artifacts`, temp action file, logs).
- Cleaned local generated files via WSL: removed `node_modules`, `output`, `artifacts`, `test-actions.json`, `package.json`, `package-lock.json`.

## 2026-03-07 - Continue plan: debt cleanup pass
- Removed unused `js/sceneOver.js` (game-over flow is handled in `SceneGame`).
- Reworked `style.css` to remove duplicated/contradictory blocks while preserving visual design.
- Updated `README.md` to reflect real behavior and current architecture:
  - removed non-implemented mobile controls claim,
  - updated module tree,
  - documented cloud smoke workflow.
- Ran WSL Playwright smoke validation after cleanup changes:
  - `ConsoleErrors=0`, screenshot/state generated.
- Cleaned local test dependencies/artifacts again (`node_modules`, `artifacts`, `output`, `package*.json`).

## 2026-03-07 - Hardening regression matrix
- Upgraded `scripts/cloud-smoke.mjs` from single smoke step to 5-scenario regression flow with assertions:
  - start from menu,
  - move + shoot,
  - pause,
  - resume,
  - restart reset checks.
- Added per-scenario screenshot/state artifacts and a `summary.json` report.
- WSL validation run passed: `Scenarios=5`, `ConsoleErrors=0`.
- Cleaned local test artifacts/dependencies after run.

## 2026-03-07 - Product polish pass (high score, mute, fullscreen)
- Added persistent high score (`localStorage`) and surfaced it in HUD + game-over overlay.
- Added audio mute support with persistence:
  - `M` keyboard shortcut,
  - `Mute/Unmute` HUD button.
- Added fullscreen toggle on `F` and canvas resize sync on `fullscreenchange`.
- Extended debug output with `highScore` and `muted` fields.
- WSL regression smoke re-run passed (`Scenarios=5`, no console errors).

## 2026-03-08 - Phaser migration phase started
- Added parallel Phaser 3 prototype under `phaser/`:
  - `phaser/index.html`
  - `phaser/js/main.js`
  - `phaser/js/scenes/{BootScene,MenuScene,GameScene}.js`
- Implemented baseline gameplay parity features in prototype:
  - movement/shooting, enemy waves, score/lives/high score,
  - pause, mute, fullscreen,
  - deterministic hooks (`render_game_to_text`, `advanceTime`).
- Updated regression script compatibility to support both runtimes.
- Validated WSL regression on both endpoints:
  - Canvas root URL: pass
  - Phaser `/phaser/`: pass
- Updated cloud workflow to run both Canvas + Phaser smoke checks.

## 2026-03-08 - Phaser parity phase 1
- Improved Phaser prototype gameplay behavior toward Canvas parity:
  - enemy formation horizontal stepping + edge descent,
  - bottom reach -> life loss + wave reset,
  - level progression scales enemy count/speed/fire delay,
  - game-over flow with restart.
- Aligned persistence keys with Canvas (`invader:highScore`, `invader:muted`).
- Updated boot assets for additional SFX (`lifeLost`, `levelUp`).
- Re-validated dual runtime regression (Canvas + Phaser) in WSL: pass, no console errors.
