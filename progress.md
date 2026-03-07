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
