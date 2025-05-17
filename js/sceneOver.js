// sceneOver.js
import { audio } from './audioManager.js';
import { SceneGame } from './sceneGame.js';

export class SceneOver {
  constructor(canvas, ctx, finalScore) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.finalScore = finalScore;
    this.title = 'GAME OVER';
    this.prompt = 'Press SPACE to restart';
    this.tick = 0;
    this.showPrompt = true;
    console.log('SceneOver constructed with score', finalScore);
  }

  start() {
    audio.play('gameOver');
    console.log('SceneOver start: displaying Game Over');
    window.addEventListener('keydown', this.onKeyDown);
    this.loop();
  }

  loop = () => {
    this.update();
    this.draw();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  update() {
    this.tick++;
    if (this.tick % 60 === 0) this.showPrompt = !this.showPrompt;
  }

  draw() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.font = '48px JetBrains Mono';
    this.ctx.fillStyle = '#f00';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.title, width / 2, height / 2 - 20);
    if (this.showPrompt) {
      this.ctx.font = '24px JetBrains Mono';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(this.prompt, width / 2, height / 2 + 30);
    }
  }

  onKeyDown = async (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      console.log('Space pressed, restarting game');
      window.removeEventListener('keydown', this.onKeyDown);
      cancelAnimationFrame(this.animationFrame);
      const { SceneGame } = await import('./sceneGame.js');
      const gameScene = new SceneGame(this.canvas, this.ctx);
      gameScene.start();
    }
  }
}
