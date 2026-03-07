# Space Invader - berthel.me

Jeu Space Invader en Canvas 2D utilise comme page ludique pour `berthel.me`.

## Etat actuel
- Stack: HTML/CSS + JavaScript ES modules (pas de bundler).
- Boucle de jeu principale: `js/sceneGame.js`.
- Menu / pause / reprise: `js/sceneOverlay.js`.
- Hooks de test exposes:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`

## Structure
```
/
├ assets/
│  ├ img/
│  └ sounds/
├ js/
│  ├ audioManager.js
│  ├ BootScene.js
│  ├ cheatMenu.js
│  ├ drops.js
│  ├ enemies.js
│  ├ enemyWeapons.js
│  ├ explosionManager.js
│  ├ GameScene.js
│  ├ hud.js
│  ├ main.js
│  ├ MenuScene.js
│  ├ particles-config.js
│  ├ player.js
│  ├ sceneBoot.js
│  ├ sceneGame.js
│  ├ sceneOverlay.js
│  ├ UIScene.js
│  └ weapons.js
├ .github/workflows/cloud-playwright.yml
├ AGENTS.md
├ CNAME
├ config.js
├ index.html
├ progress.md
└ style.css
```

## Controles
- Desktop:
  - `ArrowLeft` / `ArrowRight`: deplacement
  - `Space`: tir
  - `Escape`: pause/reprise menu
  - `Tab`: cheat menu
- Mobile:
  - Aucun controle tactile implemente actuellement.

## Gameplay
- 3 vies, score, record local persistant et niveaux progressifs.
- 4 types d'armes (`classic`, `spread`, `explosive`, `piercing`) avec niveaux max par arme.
- Drops probabilistes selon `config.weaponConfigs[*].dropWeight` et `config.dropRate`.

## Config
Toute la personnalisation passe par `config.js`:
- vitesses (`shipSpeed`, `baseEnemySpeed`, etc.)
- progression (`speedFactor`, `countFactor`)
- cadence de tir ennemis/joueur
- drop rate et poids des armes

## Developpement local
### Option simple
```sh
python3 -m http.server 4173
# puis ouvrir http://127.0.0.1:4173
```

### Tests smoke cloud (GitHub Actions)
Workflow disponible: `.github/workflows/cloud-playwright.yml`
- declenchement manuel: `workflow_dispatch`
- ou automatique sur push des fichiers de jeu
- artefacts publies:
  - screenshot gameplay
  - state JSON (`render_game_to_text`)
  - erreurs console

## Notes maintenance
- `js/sceneOver.js` a ete retire (flux game over gere directement dans `SceneGame`).
- `particles-config.js` desactive le fond particles en mode automation pour fiabiliser les captures de test.

## Licence
Projet sous licence MIT (si fichier `LICENSE` present dans le depot).

