// drops.js
import { config } from '../config.js';
import { audio }  from './audioManager.js';

export class DropManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.drops  = [];
  }

  trySpawn(x, y) {
    if (Math.random() > config.dropRate) return;
    let acc = 0, r = Math.random();
    for (const [type, weight] of Object.entries(config.dropWeights)) {
      acc += weight;
      if (r <= acc) {
        this.drops.push({ x, y, size: 20, type, vy: 100 });
        console.log('Drop spawned:', type);
        return;
      }
    }
  }

  /**
   * @param {number} delta
   * @param {Player} player
   * @returns {string[]} liste des types collectés
   */
  update(delta, player) {
    this.drops.forEach(d => d.y += d.vy * delta);
    const collected = [];

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      const hit = 
        d.x < player.x + player.width &&
        d.x + d.size > player.x &&
        d.y < player.y + player.height &&
        d.y + d.size > player.y;
      if (hit) {
        console.log('Drop collected:', d.type);
        audio.play('powerup');
        collected.push(d.type);
        this.drops.splice(i, 1);
      } else if (d.y > this.canvas.height) {
        this.drops.splice(i, 1);
      }
    }

    return collected;
  }

  draw() {
    this.drops.forEach(d => {
      this.ctx.fillStyle = config.dropColors[d.type] || '#0ff';
      this.ctx.fillRect(d.x, d.y, d.size, d.size);
    });
  }
}
