// hud.js
import { config } from '../config.js';

export class HUD {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.font   = '18px JetBrains Mono';
  }

  draw(score, lives, level, weaponType, weaponLevel) {
    this.ctx.font      = this.font;
    this.ctx.textAlign = 'left';

    // Score, Vies, Niveau (en blanc)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Score: ${score}`, 10, 20);
    this.ctx.fillText(`Lives: ${lives}`, 10, 40);
    this.ctx.fillText(`Level: ${level}`, 10, 60);

    // Arme courante (dans sa couleur)
    const color = config.dropColors[weaponType] || '#ffffff';
    this.ctx.fillStyle = color;
    this.ctx.fillText(`Weapon: ${weaponType} (lvl ${weaponLevel})`, 10, 80);
  }
}
