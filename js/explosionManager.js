// js/explosionManager.js

export class ExplosionManager {
  constructor() {
    this.explosions = [];
  }

  /**
   * Crée un flash blanc à (x,y)
   * @param {number} x 
   * @param {number} y 
   */
  spawn(x, y) {
    // explosion simple : position + rayon initial + opacité
    this.explosions.push({ x, y, radius: 5, alpha: 0.8 });
  }

  update(delta) {
    // chaque flash s'étend et s'estompe très rapidement
    this.explosions.forEach(ex => {
      ex.radius += 100 * delta;   // expansion rapide
      ex.alpha  -= 4 * delta;     // fondu en ~0.2s
    });
    // on retire les flashes disparus
    this.explosions = this.explosions.filter(ex => ex.alpha > 0);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    this.explosions.forEach(ex => {
      ctx.globalAlpha = ex.alpha;
      ctx.beginPath();
      ctx.fillStyle = '#ffffff';
      ctx.arc(ex.x, ex.y, ex.radius, 0, 2 * Math.PI);
      ctx.fill();
    });
    ctx.restore();
  }
}
