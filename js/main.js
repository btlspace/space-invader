import { BootScene } from './BootScene.js';

function resizeCanvasForFooter(canvas) {
  const footer = document.getElementById('footer');
  const footerHeight = footer ? footer.offsetHeight : 0;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - footerHeight;
}

function getCurrentMode() {
  const overlay = document.getElementById('overlay');
  if (window.sceneGame) {
    return window.sceneGame.mode;
  }
  if (overlay && overlay.style.display === 'flex') {
    return 'menu';
  }
  return 'boot';
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  resizeCanvasForFooter(canvas);

  window.addEventListener('resize', () => {
    resizeCanvasForFooter(canvas);
  });

  const ctx = canvas.getContext('2d');

  const bootScene = new BootScene(canvas, ctx);
  bootScene.start();

  window.render_game_to_text = () => {
    if (window.sceneGame) {
      return JSON.stringify(window.sceneGame.getDebugState());
    }

    return JSON.stringify({
      coordinateSystem: 'origin top-left; +x right; +y down',
      mode: getCurrentMode(),
      score: 0,
      level: 0,
      lives: 0,
      player: null,
      enemies: [],
      playerBullets: [],
      enemyBullets: [],
      drops: []
    });
  };

  window.advanceTime = (ms) => {
    if (window.sceneGame && typeof window.sceneGame.advanceTime === 'function') {
      window.sceneGame.advanceTime(ms);
    }
  };
});
