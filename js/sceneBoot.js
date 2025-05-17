// sceneBoot.js
import { SceneTuto } from './sceneTuto.js';
import { audio } from './audioManager.js';

export class SceneBoot {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    console.log('SceneBoot constructed');
  }

  async start() {
    console.log('SceneBoot start: preloading assets');
    await this.preload();
    console.log('Assets loaded, transitioning to tutorial');
    new SceneTuto(this.canvas, this.ctx).start();
  }

  preload() {
    // Charger tous les sons
    return Promise.all([
      audio.load('shoot',             'assets/sounds/shoot.wav'),
      audio.load('enemyKilled',      'assets/sounds/invaderkilled.wav'),
      audio.load('playerExplosion',  'assets/sounds/explosion.wav'),
      audio.load('lifeLost',         'assets/sounds/life_lost.mp3'),
      audio.load('powerup',          'assets/sounds/power_up.mp3'),
      audio.load('gameOver',         'assets/sounds/game_over.mp3'),
      audio.load('levelUp',          'assets/sounds/level_up.mp3'),
      audio.load('enemyShoot',      'assets/sounds/fastinvader1.wav'),
    ]).then(() => {
      console.log('Audio assets loaded');
    });
  }
}
