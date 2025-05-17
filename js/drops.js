// js/drops.js

import { config } from '../config.js';
import { audio }  from './audioManager.js';

export class DropManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.drops  = [];
  }

  /**
   * Tente de spawn un drop (emoji pistolet) si Math.random() < dropRate.
   * @param {number} x 
   * @param {number} y 
   * @param {string} [forcedType]
   */
  trySpawn(x, y, forcedType) {
    if (Math.random() > config.dropRate) return;
    let typeToDrop = forcedType;
    if (!typeToDrop) {
      const entries = Object.entries(config.weaponConfigs)
        .filter(([, cfg]) => cfg.dropWeight > 0);
      const total = entries.reduce((sum, [, cfg]) => sum + cfg.dropWeight, 0);
      let r = Math.random() * total;
      for (const [type, cfg] of entries) {
        r -= cfg.dropWeight;
        if (r <= 0) {
          typeToDrop = type;
          break;
        }
      }
    }
    if (typeToDrop) {
      this.drops.push({
        x, 
        y, 
        vy: 100,
        type: typeToDrop
      });
      audio.play('powerup');
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
        d.x + 32 > player.x &&   // emoji ~32px wide
        d.y < player.y + player.height &&
        d.y + 32 > player.y;
      if (hit) {
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
    const ctx = this.ctx;
    this.drops.forEach(d => {
      const wc = config.weaponConfigs[d.type];
      const cx = d.x;
      const cy = d.y;

      ctx.save();
      // glow important
      ctx.shadowBlur  = 20;
      ctx.shadowColor = wc.color;

      // emoji pistolet
      const size = 32;
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🔫', cx + size/2, cy + size/2);

      ctx.restore();
    });
  }
}
