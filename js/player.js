// js/player.js

import { config } from '../config.js';

const inputState = {
  movingLeft: false,
  movingRight: false,
  shooting: false
};

let controlsBound = false;

function bindControlsOnce() {
  if (controlsBound) {
    return;
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') inputState.movingLeft = true;
    if (e.code === 'ArrowRight') inputState.movingRight = true;
    if (e.code === 'Space') inputState.shooting = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') inputState.movingLeft = false;
    if (e.code === 'ArrowRight') inputState.movingRight = false;
    if (e.code === 'Space') inputState.shooting = false;
  });

  controlsBound = true;
}

export class Player {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} prevType
   * @param {number} prevLevel
   */
  constructor(canvas, ctx, prevType = 'classic', prevLevel = 1) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = 50;
    this.height = 50;
    this.x = (canvas.width - this.width) / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = config.shipSpeed;

    this.weaponType = prevType;
    this.weaponLevel = prevLevel;
    this.sprite = window.assets.images.ship;

    bindControlsOnce();
  }

  get movingLeft() {
    return inputState.movingLeft;
  }

  get movingRight() {
    return inputState.movingRight;
  }

  get shooting() {
    return inputState.shooting;
  }

  update(delta) {
    if (this.movingLeft) this.x -= this.speed * delta;
    if (this.movingRight) this.x += this.speed * delta;
    this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width));
  }

  draw() {
    this.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
  }

  /**
   * @param {string} type
   * @returns {number}
   */
  upgradeWeapon(type) {
    const weaponCfg = config.weaponConfigs[type];
    if (!weaponCfg) {
      return 0;
    }

    const maxLevel = weaponCfg.maxLevel ?? 1;
    const maxLevelBonus = config.maxLevelBonus ?? 250;

    if (this.weaponType === type) {
      if (this.weaponLevel < maxLevel) {
        this.weaponLevel += 1;
        return 0;
      }
      return maxLevelBonus;
    }

    this.weaponType = type;
    this.weaponLevel = 1;
    return 0;
  }
}
