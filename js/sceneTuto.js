import { SceneGame } from './sceneGame.js';

export class SceneTuto {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.tick = 0;
    this.showText = true;
    this.text = 'Press SPACE to start';
    console.log('SceneTuto constructed');
  }

  start() {
    console.log('SceneTuto start: displaying tutorial overlay');
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
    if (this.tick % 60 === 0) {
      this.showText = !this.showText;
    }
  }

  draw() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    if (this.showText) {
      this.ctx.font = '24px JetBrains Mono';
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.text, width / 2, height / 2);
    }
  }

  onKeyDown = (e) => {
    if (e.code === 'Space') {
      console.log('Space pressed, starting game');
      window.removeEventListener('keydown', this.onKeyDown);
      cancelAnimationFrame(this.animationFrame);
      const gameScene = new SceneGame(this.canvas, this.ctx);
      gameScene.start();
    }
  }
}