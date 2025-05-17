// js/cheatMenu.js

import { config } from '../config.js';

export class CheatMenu {
  /**
   * @param {SceneGame} scene – instance de la scène de jeu
   */
  constructor(scene) {
    this.scene       = scene;
    this.active      = false;
    this.options     = [
      'Weapon Type',
      'Weapon Level',
      'God Mode',
      'Disable Drops',
      'Drop Equipped Only',
      'Set Level'
    ];
    this.index       = 0;
    // On prend désormais les types d'armes depuis config.weaponConfigs
    this.weaponTypes = Object.keys(config.weaponConfigs);
  }

  toggle() {
    this.active = !this.active;
  }

  handleKey(e) {
    if (!this.active) return;
    switch (e.code) {
      case 'ArrowUp':
        this.index = (this.index + this.options.length - 1) % this.options.length;
        break;
      case 'ArrowDown':
        this.index = (this.index + 1) % this.options.length;
        break;
      case 'ArrowLeft':
        this._adjustOption(-1);
        break;
      case 'ArrowRight':
        this._adjustOption(+1);
        break;
    }
  }

  _adjustOption(delta) {
    const opt = this.options[this.index];
    const sc  = this.scene;
    const pl  = sc.player;
    switch (opt) {
      case 'Weapon Type': {
        const i  = this.weaponTypes.indexOf(pl.weaponType);
        const ni = (i + delta + this.weaponTypes.length) % this.weaponTypes.length;
        pl.weaponType  = this.weaponTypes[ni];
        // reset level if explosive
        if (pl.weaponType === 'explosive') pl.weaponLevel = 1;
        break;
      }
      case 'Weapon Level':
        if (pl.weaponType !== 'explosive') {
          pl.weaponLevel = Math.max(
            1,
            Math.min(
              config.weaponConfigs[pl.weaponType].maxLevel,
              pl.weaponLevel + delta
            )
          );
        }
        break;
      case 'God Mode':
        sc.godMode = !sc.godMode;
        break;
      case 'Disable Drops':
        sc.disableDrops = !sc.disableDrops;
        break;
      case 'Drop Equipped Only':
        sc.onlyDropEquipped = !sc.onlyDropEquipped;
        break;
      case 'Set Level':
        sc.level = Math.max(1, sc.level + delta);
        sc._setupLevel();
        break;
    }
  }

  draw(ctx) {
    const w = 300;
    const h = this.options.length * 30 + 20;
    const x = 50;
    const y = this.scene.canvas.height - h - 20;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x, y, w, h);

    ctx.font      = '20px JetBrains Mono';
    ctx.textAlign = 'left';
    this.options.forEach((opt, i) => {
      const yy = y + 30 + i * 30;
      ctx.fillStyle = (i === this.index) ? '#ff0' : '#fff';
      let val;
      switch (opt) {
        case 'Weapon Type':
          val = this.scene.player.weaponType;
          break;
        case 'Weapon Level':
          val = this.scene.player.weaponLevel;
          break;
        case 'God Mode':
          val = this.scene.godMode ? 'ON' : 'OFF';
          break;
        case 'Disable Drops':
          val = this.scene.disableDrops ? 'ON' : 'OFF';
          break;
        case 'Drop Equipped Only':
          val = this.scene.onlyDropEquipped ? 'ON' : 'OFF';
          break;
        case 'Set Level':
          val = this.scene.level;
          break;
      }
      ctx.fillText(`${opt}: ${val}`, x + 10, yy);
    });
    ctx.restore();
  }
}
