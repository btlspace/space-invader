// js/weapons.js

import { config } from '../config.js';
import { audio }  from './audioManager.js';

export class WeaponManager {
  constructor(canvas, ctx, explosionManager) {
    this.canvas        = canvas;
    this.ctx           = ctx;
    this.explosions    = explosionManager;
    this.bullets       = [];
    this.timeSinceLast = 0;
  }

  update(delta, player, enemies) {
    const wc     = config.weaponConfigs[player.weaponType];
    const lvl    = player.weaponLevel;
    const params = wc.params;
    const ws     = config.weaponSettings;

    // 1) Calcul du fireRate
    if (Array.isArray(wc.mode) && wc.mode.includes('explosive')) {
      this.fireRate = ws[wc.fireRateKey];
    } else if (wc.mode === 'explosive') {
      this.fireRate = ws[wc.fireRateKey];
    } else {
      const even = Math.floor((lvl - 1) / 2);
      this.fireRate = ws[wc.fireRateKey] *
                      Math.pow(ws.fireRateDecreaseFactor, even);
    }

    // 2) Tir si possible
    this.timeSinceLast += delta;
    if (player.shooting && this.timeSinceLast >= this.fireRate) {
      this._shootMode(wc, lvl, ws.projectileSpeed, player);
      this.timeSinceLast = 0;
    }

    // 3) Update des projectiles et collisions
    let hits = 0;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // collision avec ennemis
      for (const e of enemies.enemies) {
        if (e.alive &&
            b.x > e.x && b.x < e.x + e.width &&
            b.y > e.y && b.y < e.y + e.height) {

          // spawn explosion visuelle
          this.explosions.spawn(b.x, b.y);

          hits += this._applyHit(b, e, enemies);
          break;
        }
      }

      // suppression hors écran
      if (b.y < 0 || b.y > this.canvas.height) {
        this.bullets.splice(i, 1);
      }
    }

    return hits;
  }

  /** Sélectionne et exécute les sous-modes de tir */
  _shootMode(wc, lvl, speed, player) {
    const modes = Array.isArray(wc.mode) ? wc.mode : [wc.mode];
    modes.forEach(mode => {
      switch (mode) {
        case 'projectile':
          this._shootProjectile(wc.params, lvl, speed, player);
          break;
        case 'spread':
          this._shootSpread(wc.params, lvl, speed, player);
          break;
        case 'explosive':
          this._shootExplosive(wc.params, speed, player);
          break;
        case 'piercing':
          this._shootPiercing(wc.params, lvl, speed, player);
          break;
      }
    });
    audio.play('shoot');
  }

  _shootProjectile({ baseCount, levelInterval, spacing }, lvl, speed, player) {
    const count = baseCount + Math.floor((lvl - 1) / levelInterval);
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spacing;
      this._spawn(player, 0, -speed, 1, 0, offset);
    }
  }

  _shootSpread({ baseCount, levelInterval, spreadAngle }, lvl, speed, player) {
    const count = baseCount + 2 * Math.floor((lvl - 1) / levelInterval);
    for (let i = 0; i < count; i++) {
      const angle = count === 1
        ? 0
        : -spreadAngle / 2 + (spreadAngle / (count - 1)) * i;
      this._spawn(
        player,
        Math.sin(angle) * speed,
        -Math.cos(angle) * speed,
        1,
        0,
        0
      );
    }
  }

  _shootExplosive({ radiusUnits }, speed, player) {
    this._spawn(player, 0, -speed, 1, radiusUnits, 0);
  }

  _shootPiercing({ maxPierce }, lvl, speed, player) {
    const pierce = Math.min(lvl, maxPierce);
    this._spawn(player, 0, -speed, pierce, 0, 0);
  }

  /** Applique l’impact selon explodeRadius et remainingPierce */
  _applyHit(b, e, enemies) {
    let hits = 0;

    if (b.explodeRadius) {
      const idx = enemies.enemies.indexOf(e);
      [0, -1, +1].forEach(off => {
        const n = enemies.enemies[idx + off];
        if (n && n.alive) {
          n.alive = false;
          hits++;
          audio.play('enemyKilled');
        }
      });
    } else {
      e.alive = false;
      hits++;
      audio.play('enemyKilled');
    }

    // ajuste moveDelay
    enemies.moveDelay = Math.max(
      enemies.minMoveDelay,
      enemies.moveDelay - enemies.decrementPerKill
    );

    // gestion perçage
    if (b.remainingPierce > 1) {
      b.remainingPierce--;
    } else {
      this.bullets = this.bullets.filter(x => x !== b);
    }

    return hits;
  }

  /** Crée un projectile */
  _spawn(player, vx, vy, remainingPierce, explodeRadius, xOffset) {
    this.bullets.push({
      x:                 player.x + player.width / 2 + xOffset,
      y:                 player.y,
      vx,
      vy,
      remainingPierce,
      explodeRadius,
      type:              player.weaponType,
      width:             4,
      height:            10
    });
  }

  /** Dessine tous les projectiles avec un effet de glow */
  draw() {
    this.ctx.save();
    this.bullets.forEach(b => {
      const wc = config.weaponConfigs[b.type];
      this.ctx.fillStyle = wc.color;
      this.ctx.shadowBlur  = 8;
      this.ctx.shadowColor = wc.color;

      if (wc.mode === 'spread' || (Array.isArray(wc.mode) && wc.mode.includes('spread'))) {
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
      }

      // reset shadow for next iteration
      this.ctx.shadowBlur  = 0;
      this.ctx.shadowColor = 'transparent';
    });
    this.ctx.restore();
  }
}
