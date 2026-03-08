# Space Invader - berthel.me

Jeu Space Invader en Canvas 2D utilise comme page ludique pour `berthel.me`.

## Etat actuel
- Stack principal: HTML/CSS + JavaScript ES modules (pas de bundler).
- Prototype migration: Phaser 3 dans `phaser/` (execution parallele, non destructive).
- Boucle de jeu Canvas: `js/sceneGame.js`.
- Hooks de test exposes (Canvas + Phaser):
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`

## Structure
```
/
├ assets/
├ js/
├ phaser/
│  ├ index.html
│  └ js/scenes/
├ scripts/cloud-smoke.mjs
├ .github/workflows/cloud-playwright.yml
├ AGENTS.md
├ progress.md
└ ...
```

## Controles
- Desktop:
  - `ArrowLeft` / `ArrowRight`: deplacement
  - `Space`: tir
  - `Escape`: pause/reprise menu
  - `M`: mute/unmute audio
  - `F`: fullscreen
  - `Tab`: cheat menu (Canvas)

## Statut migration Phaser
- Prototype disponible sur `/phaser/`.
- Scenes en place: Boot, Menu, Game.
- HUD + score + high score + pause/mute/fullscreen.
- Compatibilite smoke test cloud validee.

## Developpement local
```sh
python3 -m http.server 4173
# Canvas: http://127.0.0.1:4173
# Phaser: http://127.0.0.1:4173/phaser/
```

## CI Cloud
Workflow: `.github/workflows/cloud-playwright.yml`
- teste Canvas ET Phaser prototype
- publie screenshots + etats JSON + logs console

## Notes
- La prod actuelle reste la version Canvas (index racine).
- La migration Phaser est incrementale et reversible.

## Licence
Projet sous licence MIT (si fichier `LICENSE` present dans le depot).
