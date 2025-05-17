// js/sceneBoot.js

import { showMenu } from './sceneOverlay.js';
import { audio }    from './audioManager.js';

export class SceneBoot {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {CanvasRenderingContext2D} ctx 
   */
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    // contiendra tous les assets (images, sprites, etc.)
    window.assets = {
      images: {}
    };
    console.log('SceneBoot constructed');
  }

  /** Lance le préchargement puis affiche le menu overlay */
  async start() {
    console.log('SceneBoot start: preloading assets');
    await this.preload();
    console.log('Assets loaded, showing menu');
    showMenu();
  }
  
  preload() {
    const loadImage = (key, src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => {
        window.assets.images[key] = img;
        resolve();
      };
      img.onerror = reject;
      img.src     = src;
    });

    // Charger tous les sons et images
    return Promise.all([
      // sons
      audio.load('shoot',            'assets/sounds/shoot.wav'),
      audio.load('enemyKilled',      'assets/sounds/invaderkilled.wav'),
      audio.load('playerExplosion',  'assets/sounds/explosion.wav'),
      audio.load('lifeLost',         'assets/sounds/life_lost.mp3'),
      audio.load('powerup',          'assets/sounds/power_up.mp3'),
      audio.load('gameOver',         'assets/sounds/game_over.mp3'),
      audio.load('levelUp',          'assets/sounds/level_up.mp3'),
      audio.load('enemyShoot',       'assets/sounds/fastinvader1.wav'),

      // images
      loadImage('ship',       'assets/img/baseshipa.ico'),
      loadImage('enemy',      'assets/img/saucer2a.ico')
    ]).then(() => {
      console.log('Audio & image assets loaded');
    });
  }
}
