// js/enemyWeapons.js

import { config } from '../config.js';
import { audio } from './audioManager.js';

function pointInPlayer(x, y, player) {
  return x >= player.x && x <= player.x + player.width && y >= player.y && y <= player.y + player.height;
}

export class EnemyWeapons {
  constructor(canvas, ctx, enemies) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.enemies = enemies;
    this.bullets = [];
    this.fireRate = config.enemyFireRate;
    this.bulletSpeed = config.enemyBulletSpeed;
    this.timeSinceLast = 0;
  }

  /**
   * @returns {number}
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
      const dy = this.bulletSpeed * delta;
      const steps = Math.max(1, Math.ceil(Math.abs(dy) / 10));
      const stepY = dy / steps;
      let removed = false;

      for (let step = 0; step < steps && !removed; step++) {
        b.y += stepY;

        if (pointInPlayer(b.x, b.y, player)) {
          hits += 1;
          removed = true;
          break;
        }

        if (b.y > this.canvas.height + 20) {
          removed = true;
        }
      }

      if (removed) {
        this.bullets.splice(i, 1);
      }
    }

    return hits;
  }

  _shootRandom() {
    const alive = this.enemies.enemies.filter((e) => e.alive);
    if (!alive.length) {
      return;
    }

    const shooter = alive[Math.floor(Math.random() * alive.length)];
    const x = shooter.x + shooter.width / 2;
    const y = shooter.y + shooter.height;
    this.bullets.push({ x, y, width: 4, height: 10 });
    audio.play('enemyShoot');
  }

  draw() {
    this.ctx.save();
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = '#ff00ff';
    this.ctx.fillStyle = '#ff00ff';
    this.bullets.forEach((b) => {
      this.ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
    });
    this.ctx.restore();
  }
}
