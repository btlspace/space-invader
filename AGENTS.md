# AGENTS.md - Space Invader (berthel.me)

## Mission
- Maintain and stabilize the Space Invader game served on `berthel.me`.
- Prioritize gameplay debugging, reliability, and user experience.
- Keep deployment simple (HTML/CSS/JS). Consider framework migration only if ROI is clear.

## Technical Context
- Current stack: Canvas 2D + ES modules, no bundler.
- Main game loop: [js/sceneGame.js](/C:/src/space-invader/js/sceneGame.js).
- Boot/menu flow: [js/sceneBoot.js](/C:/src/space-invader/js/sceneBoot.js), [js/sceneOverlay.js](/C:/src/space-invader/js/sceneOverlay.js), [js/main.js](/C:/src/space-invader/js/main.js).
- Test hooks already exposed:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
- Current blocker: Node.js is missing locally, so Playwright validation is blocked.

## Priority Issues
### P0 - Reliability blockers
- Install Node.js and run reproducible browser automation tests.
- Validate full start/pause/restart/game-over flows end-to-end.
- Recheck collision behavior under variable frame timings.

### P1 - Functional and UX bugs
- `powerup` sound triggers both on spawn and pickup in [js/drops.js](/C:/src/space-invader/js/drops.js).
- [js/sceneOver.js](/C:/src/space-invader/js/sceneOver.js) looks obsolete (game-over is rendered by `SceneGame`).
- Overlay typewriter strips rich text (`<kbd>`) from subtitles.
- Enemy grid scaling can overflow canvas at higher levels.

### P2 - Maintainability
- Clean duplicated CSS blocks in [style.css](/C:/src/space-invader/style.css).
- Align README claims with actual implementation (mobile controls currently not present).
- Add optional deterministic seed for random gameplay tests.

## Recommended Execution Plan
1. Tooling baseline
- Install Node LTS.
- Run local static server and Playwright client from `develop-web-game` skill.
- Capture screenshots and `render_game_to_text` for start, gameplay, game-over, restart.

2. Fix P0/P1 issues
- Fix drop sound behavior in `drops.js` (pickup only).
- Fix overlay typewriter to preserve intended display text formatting.
- Cap enemy generation based on canvas dimensions.
- Remove/archive `sceneOver.js` if confirmed unused.

3. Hardening pass
- Run a manual regression matrix: movement, shooting, pause, resume, restart, level-up, game-over.
- Keep hooks (`render_game_to_text`, `advanceTime`) stable after each change.
- Resolve first new console error before moving to next issue.

4. Product improvements
- Add local high score persistence.
- Add mute toggle and fullscreen toggle (`f`).
- Improve landing polish (clear CTA and links to email/GitHub identity).

## Migration Decision (Phaser 3)
- Stay on Canvas if scope stays compact and maintenance simplicity is the goal.
- Migrate to Phaser 3 if at least two apply:
  - multi-scene complexity increases,
  - advanced collisions/physics needed,
  - richer animation/content pipeline needed,
  - frequent feature expansion expected.

Current recommendation: stabilize Canvas first, then reassess migration with actual bug/load metrics.

## Definition of Done for Next Iteration
- Critical scenarios pass 3 consecutive runs without console errors.
- Visual screenshots and `render_game_to_text` stay consistent.
- README and runtime behavior are aligned.