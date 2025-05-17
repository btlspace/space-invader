// js/enemyWeapons.js

import { config } from '../config.js';
import { audio }  from './audioManager.js';

export class EnemyWeapons {
  constructor(canvas, ctx, enemies) {
    this.canvas       = canvas;
    this.ctx          = ctx;
    this.enemies      = enemies;
    this.bullets      = [];
    this.fireRate     = config.enemyFireRate;
    this.bulletSpeed  = config.enemyBulletSpeed;
    this.timeSinceLast = 0;
  }

  /**
   * @returns {number} hits – nombre de tirs ennemis ayant atteint le joueur
   */
  update(delta, player) {
    this.timeSinceLast += delta;
    if (this.timeSinceLast >= this.fireRate) {
      this._shootRandom();
      this.timeSinceLast = 0;
    }

    let hits = 0;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y += this.bulletSpeed * delta;

      // collision avec le joueur
      if (
        b.x > player.x &&
        b.x < player.x + player.width &&
        b.y > player.y &&
        b.y < player.y + player.height
      ) {
        hits++;
        this.bullets.splice(i, 1);
        console.log('Player hit by enemy bullet at', b.x, b.y);
      } else if (b.y > this.canvas.height) {
        this.bullets.splice(i, 1);
      }
    }
    return hits;
  }

  _shootRandom() {
    const alive = this.enemies.enemies.filter(e => e.alive);
    if (!alive.length) return;
    const shooter = alive[Math.floor(Math.random() * alive.length)];
    const x = shooter.x + shooter.width / 2;
    const y = shooter.y + shooter.height;
    this.bullets.push({ x, y, width: 4, height: 10 });
    audio.play('enemyShoot');
    console.log('Enemy shot at', x, y);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    // glow important en magenta
    ctx.shadowBlur  = 12;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle   = '#ff00ff';
    this.bullets.forEach(b => {
      ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
    });
    ctx.restore();
  }
}
