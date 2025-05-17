// js/enemies.js

import { config } from '../config.js';

export class Enemies {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} level – niveau courant (1-based)
   */
  constructor(canvas, ctx, level = 1) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.level  = level;

    // Sprite d’ennemi préchargé dans sceneBoot.js
    this.sprite = window.assets.images.enemy;

    // Calcul dynamique des rangées/colonnes et vitesse selon le niveau
    this.rows  = Math.max(1, Math.round(config.baseRows  * Math.pow(config.countFactor, level - 1)));
    this.cols  = Math.max(1, Math.round(config.baseCols  * Math.pow(config.countFactor, level - 1)));
    this.speed = config.baseEnemySpeed * Math.pow(config.speedFactor, level - 1);

    // Paramètres de cadence de déplacement
    this.moveDelay        = Math.max(config.minMoveDelay,
                                     config.baseMoveDelay - config.delayStepPerLevel * (level - 1));
    this.minMoveDelay     = config.minMoveDelay;
    this.decrementPerKill = config.decrementPerKill;
    this.timeSinceLastMove= 0;

    this.hSpacing  = 60;
    this.vSpacing  = 60;
    this.direction = 1; // 1 = droite, -1 = gauche

    this.enemies = [];
    this.initEnemies();

    console.log(`Enemies level ${level} : count=${this.enemies.length}, initial delay=${this.moveDelay}s`);
  }

  initEnemies() {
    const totalW = (this.cols - 1) * this.hSpacing;
    const startX = (this.canvas.width - totalW) / 2;
    const startY = 50;
    const w = 40, h = 40;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const x = startX + col * this.hSpacing;
        const y = startY + row * this.vSpacing;
        this.enemies.push({ x, y, width: w, height: h, alive: true });
      }
    }
  }

  update(delta) {
    this.timeSinceLastMove += delta;
    if (this.timeSinceLastMove < this.moveDelay) return;
    this.timeSinceLastMove = 0;

    // Calcul des bornes vivantes
    let minX = Infinity, maxX = -Infinity;
    this.enemies.forEach(e => {
      if (e.alive) {
        minX = Math.min(minX, e.x);
        maxX = Math.max(maxX, e.x + e.width);
      }
    });

    const moveX = this.speed * this.moveDelay;
    // Si on atteint un bord : descendre puis inversion
    if (maxX + moveX > this.canvas.width || minX + moveX < 0) {
      this.enemies.forEach(e => { if (e.alive) e.y += this.vSpacing; });
      this.direction *= -1;
    }
    // Déplacement horizontal
    this.enemies.forEach(e => { if (e.alive) e.x += moveX * this.direction; });
  }

  draw() {
    this.enemies.forEach(e => {
      if (!e.alive) return;
      // Dessine le sprite centré dans le bounding box
      this.ctx.drawImage(
        this.sprite,
        e.x, e.y,
        e.width, e.height
      );
    });
  }
}
