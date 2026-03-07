// js/enemies.js

import { config } from '../config.js';

export class Enemies {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} level
   */
  constructor(canvas, ctx, level = 1) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.level = level;
    this.sprite = window.assets.images.enemy;

    const scaledRows = Math.max(1, Math.round(config.baseRows * Math.pow(config.countFactor, level - 1)));
    const scaledCols = Math.max(1, Math.round(config.baseCols * Math.pow(config.countFactor, level - 1)));

    // Keep the initial grid inside visible bounds on high levels.
    const maxColsByWidth = Math.max(1, Math.floor((this.canvas.width - 40) / 60) + 1);
    const maxRowsByHeight = Math.max(1, Math.floor((Math.max(160, this.canvas.height * 0.45) - 40) / 60) + 1);

    this.rows = Math.min(scaledRows, maxRowsByHeight);
    this.cols = Math.min(scaledCols, maxColsByWidth);
    this.speed = config.baseEnemySpeed * Math.pow(config.speedFactor, level - 1);

    this.moveDelay = Math.max(config.minMoveDelay, config.baseMoveDelay - config.delayStepPerLevel * (level - 1));
    this.minMoveDelay = config.minMoveDelay;
    this.decrementPerKill = config.decrementPerKill;
    this.timeSinceLastMove = 0;

    this.hSpacing = 60;
    this.vSpacing = 60;
    this.direction = 1;

    this.enemies = [];
    this.initEnemies();
  }

  initEnemies() {
    const totalW = (this.cols - 1) * this.hSpacing;
    const startX = (this.canvas.width - totalW) / 2;
    const startY = 50;
    const w = 40;
    const h = 40;

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
    if (this.timeSinceLastMove < this.moveDelay) {
      return;
    }
    this.timeSinceLastMove = 0;

    let minX = Infinity;
    let maxX = -Infinity;
    this.enemies.forEach((e) => {
      if (!e.alive) return;
      minX = Math.min(minX, e.x);
      maxX = Math.max(maxX, e.x + e.width);
    });

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      return;
    }

    const step = this.speed * this.moveDelay;
    const proposedDx = step * this.direction;
    const nextMin = minX + proposedDx;
    const nextMax = maxX + proposedDx;

    if (nextMin < 0 || nextMax > this.canvas.width) {
      this.enemies.forEach((e) => {
        if (e.alive) {
          e.y += this.vSpacing;
        }
      });
      this.direction *= -1;
    }

    const clampedStep = step * this.direction;
    this.enemies.forEach((e) => {
      if (!e.alive) return;
      e.x += clampedStep;
      e.x = Math.max(0, Math.min(e.x, this.canvas.width - e.width));
    });
  }

  draw() {
    this.enemies.forEach((e) => {
      if (!e.alive) return;
      this.ctx.drawImage(this.sprite, e.x, e.y, e.width, e.height);
    });
  }
}
