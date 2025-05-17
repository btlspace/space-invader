// weapons.js
import { config } from '../config.js';
import { audio }  from './audioManager.js';

export class WeaponManager {
  constructor(canvas, ctx) {
    this.canvas        = canvas;
    this.ctx           = ctx;
    this.bullets       = [];
    this.timeSinceLast = 0;
    const ws           = config.weaponSettings;
    // préchargement des réglages
    this.ws            = ws;
  }

  update(delta, player, enemies) {
    const ws = this.ws;
    const typeSettings = ws[player.weaponType];

    // 1) calcul dynamique de la cadence de tir
    if (player.weaponType === 'explosive') {
      this.fireRate = ws[typeSettings.fireRateKey];
    } else {
      const evenLvls = Math.floor(player.weaponLevel / 2);
      this.fireRate = ws.baseFireRate * Math.pow(ws.fireRateDecreaseFactor, evenLvls);
    }

    // 2) tir si ready
    this.timeSinceLast += delta;
    if (player.shooting && this.timeSinceLast >= this.fireRate) {
      this.shoot(player);
      this.timeSinceLast = 0;
    }

    // 3) update des projectiles
    let hits = 0;
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * delta;
      b.y += b.vy * delta;

      // 4) collision avec ennemis
      for (const e of enemies.enemies) {
        if (e.alive &&
            b.x > e.x && b.x < e.x + e.width &&
            b.y > e.y && b.y < e.y + e.height) {

          // explosive : détruit la cible + voisins
          if (b.explodeRadius) {
            const idx = enemies.enemies.indexOf(e);
            // cible
            e.alive = false; hits++; audio.play('enemyKilled');
            // voisin gauche
            if (idx % enemies.cols > 0) {
              const l = enemies.enemies[idx - 1];
              if (l.alive) { l.alive = false; hits++; audio.play('enemyKilled'); }
            }
            // voisin droit
            if (idx % enemies.cols < enemies.cols - 1) {
              const r = enemies.enemies[idx + 1];
              if (r.alive) { r.alive = false; hits++; audio.play('enemyKilled'); }
            }

          } else {
            // simple hit (classic, spread, piercing)
            e.alive = false; hits++; audio.play('enemyKilled');
          }

          // 5) ralentissement global des ennemis
          enemies.moveDelay = Math.max(
            enemies.minMoveDelay,
            enemies.moveDelay - enemies.decrementPerKill
          );

          // 6) gestion piercing
          if (b.remainingPierce > 1) {
            b.remainingPierce--;
          } else {
            this.bullets.splice(i, 1);
          }
          break;
        }
      }

      // 7) suppression hors-écran
      if (b.y < 0 || b.y > this.canvas.height) {
        this.bullets.splice(i, 1);
      }
    }

    return hits;
  }

  shoot(player) {
    const ws    = this.ws;
    const type  = player.weaponType;
    const lvl   = player.weaponLevel;
    const speed = ws.projectileSpeed;
    const cfg   = ws[type];

    switch (type) {
      case 'classic': {
        const count = cfg.baseCount + Math.floor((lvl - 1) / cfg.levelInterval);
        const spacing = cfg.spacing;
        for (let i = 0; i < count; i++) {
          const offset = (i - (count - 1)/2) * spacing;
          this._spawnBullet(
            player.x + player.width/2 + offset,
            player.y,
            0, -speed,
            1, 0,
            type
          );
        }
        break;
      }

      case 'spread': {
        const count = cfg.baseCount + 2 * Math.floor((lvl - 1) / cfg.levelInterval);
        const range = cfg.spreadAngle;
        for (let i = 0; i < count; i++) {
          const angle = (count === 1)
            ? 0
            : -range/2 + (range/(count - 1)) * i;
          this._spawnBullet(
            player.x + player.width/2,
            player.y,
            Math.sin(angle)*speed,
            -Math.cos(angle)*speed,
            1, 0,
            type
          );
        }
        break;
      }

      case 'explosive':
        this._spawnBullet(
          player.x + player.width/2,
          player.y,
          0, -speed,
          1,
          cfg.radiusUnits,
          type
        );
        break;

      case 'piercing':
        this._spawnBullet(
          player.x + player.width/2,
          player.y,
          0, -speed,
          Math.min(lvl, cfg.maxPierce),
          0,
          type
        );
        break;
    }

    audio.play('shoot');
  }

  _spawnBullet(x, y, vx, vy, remainingPierce, explodeRadius, type) {
    this.bullets.push({
      x, y, vx, vy,
      width: 4, height: 10,
      remainingPierce,
      explodeRadius,
      type
    });
  }

  draw() {
    this.ctx.save();
    this.bullets.forEach(b => {
      // style selon type
      this.ctx.fillStyle = config.projectileColors[b.type];
      if (b.type === 'spread') {
        // cercle pour spread
        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, 3, 0, 2*Math.PI);
        this.ctx.fill();
      } else {
        // rectangle pour les autres
        this.ctx.fillRect(b.x - b.width/2, b.y, b.width, b.height);
      }
    });
    this.ctx.restore();
  }
}
