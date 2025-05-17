// js/player.js

import { config } from '../config.js';

export class Player {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} prevType   – type d’arme conservé
   * @param {number} prevLevel  – niveau d’arme conservé
   */
  constructor(canvas, ctx, prevType = 'classic', prevLevel = 1) {
    this.canvas = canvas;
    this.ctx    = ctx;
    this.width  = 50;
    this.height = 50;
    this.x      = (canvas.width - this.width) / 2;
    this.y      = canvas.height - this.height - 10;
    this.speed  = config.shipSpeed;

    this.movingLeft  = false;
    this.movingRight = false;
    this.shooting    = false;

    // conserver l’arme entre niveaux
    this.weaponType  = prevType;
    this.weaponLevel = prevLevel;

    // Sprite préchargé dans sceneBoot.js
    this.sprite = window.assets.images.ship;

    this.setupControls();
  }

  setupControls() {
    window.addEventListener('keydown', e => {
      if (e.code === 'ArrowLeft')  this.movingLeft  = true;
      if (e.code === 'ArrowRight') this.movingRight = true;
      if (e.code === 'Space')      this.shooting    = true;
    });
    window.addEventListener('keyup', e => {
      if (e.code === 'ArrowLeft')  this.movingLeft  = false;
      if (e.code === 'ArrowRight') this.movingRight = false;
      if (e.code === 'Space')      this.shooting    = false;
    });
  }

  update(delta) {
    if (this.movingLeft)  this.x -= this.speed * delta;
    if (this.movingRight) this.x += this.speed * delta;
    // bornes du canvas
    this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.width));
  }

  draw() {
    // dessine le sprite du vaisseau
    this.ctx.drawImage(
      this.sprite,
      this.x, this.y,
      this.width, this.height
    );
  }

  /**
   * Gère la montée de niveau de l’arme ou le switch d’arme.
   * @param {string} type
   * @returns {number} bonus score si déjà au max, sinon 0
   */
  upgradeWeapon(type) {
    let bonus = 0;
    if (type === 'explosive') {
      // arme rare, pas de montée de niveau
      if (this.weaponType !== 'explosive') {
        this.weaponType  = 'explosive';
        this.weaponLevel = 1;
      }
    } else {
      if (this.weaponType === type) {
        if (this.weaponLevel < config.maxUpgradeLevel) {
          this.weaponLevel++;
        } else {
          // déjà au max → bonus de score
          bonus = config.maxLevelBonus ?? 0;
        }
      } else {
        this.weaponType  = type;
        this.weaponLevel = 1;
      }
    }
    console.log('Weapon now', this.weaponType, 'lvl', this.weaponLevel);
    return bonus;
  }
}
