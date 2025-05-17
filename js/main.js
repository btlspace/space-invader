import { SceneBoot } from './sceneBoot.js';

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = 800;  // Debug: dimensions fixes pour tests
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  console.log('Canvas initialized:', canvas.width, canvas.height);

  const bootScene = new SceneBoot(canvas, ctx);
  bootScene.start();
});