import { SceneBoot } from './sceneBoot.js';

function resizeCanvasForFooter(canvas) {
  const footer = document.getElementById('footer');
  const footerHeight = footer ? footer.offsetHeight : 0;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight - footerHeight;
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  resizeCanvasForFooter(canvas);

  window.addEventListener('resize', () => {
    resizeCanvasForFooter(canvas);
  });

  const ctx = canvas.getContext('2d');
  console.log('Canvas initialized:', canvas.width, canvas.height);

  const bootScene = new SceneBoot(canvas, ctx);
  bootScene.start();
});
