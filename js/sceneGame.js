// sceneGame.js
import { config }        from '../config.js';
import { Player }        from './player.js';
import { Enemies }       from './enemies.js';
import { WeaponManager } from './weapons.js';
import { EnemyWeapons }  from './enemyWeapons.js';
import { DropManager }   from './drops.js';
import { HUD }           from './hud.js';
import { SceneOver }     from './sceneOver.js';
import { audio }         from './audioManager.js';
import { CheatMenu }     from './cheatMenu.js';

export class SceneGame {
  constructor(canvas, ctx) {
    this.canvas           = canvas;
    this.ctx              = ctx;
    this.level            = 1;
    this.score            = 0;
    this.lives            = 3;
    this.gameOver         = false;
    this.godMode          = false;
    this.disableDrops     = false;
    this.onlyDropEquipped = false;
    this.cheatMenu        = new CheatMenu(this);

    window.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        this.cheatMenu.toggle();
        e.preventDefault();
      }
      this.cheatMenu.handleKey(e);
    });

    this._setupLevel();
  }

  _setupLevel() {
    const prevType  = this.player?.weaponType  || 'classic';
    const prevLevel = this.player?.weaponLevel || 1;

    this.player        = new Player(this.canvas, this.ctx, prevType, prevLevel);
    this.enemies       = new Enemies(this.canvas, this.ctx, this.level);
    this.weaponManager = new WeaponManager(this.canvas, this.ctx);
    this.enemyWeapons  = new EnemyWeapons(this.canvas, this.ctx, this.enemies);
    this.dropManager   = new DropManager(this.canvas, this.ctx);
    this.hud           = new HUD(this.canvas, this.ctx);
    this.lastTime      = performance.now();
    this.gameOver      = false;  // Réactive la boucle si on reload niveau après perte de vie

    console.log(`Level ${this.level} setup → ${this.enemies.enemies.length} enemies`);
  }

  start() {
    this.gameOver = false;
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  loop = (timestamp) => {
    // Si le cheat menu est actif, on n'update pas mais on continue le draw
    if (!this.cheatMenu.active && !this.gameOver) {
      const delta = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      this.update(delta);
    }

    this.draw();

    if (this.cheatMenu.active) {
      this.cheatMenu.draw(this.ctx);
    }

    if (!this.gameOver) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  }

  update(delta) {
    this.player.update(delta);

    // 1) Tirs ennemis
    const pHits = this.enemyWeapons.update(delta, this.player);
    if (pHits > 0) {
      audio.play('playerExplosion');
      this._loseLife();
      return;
    }

    // 2) Déplacement ennemis
    this.enemies.update(delta);

    // 3) Tirs joueur & collisions
    const hits = this.weaponManager.update(delta, this.player, this.enemies);

    // 4) Spawn drops
    this.enemies.enemies.forEach(e => {
      if (!e.alive && !e._dropDone) {
        if (!this.disableDrops) {
          const dropX = e.x + e.width / 2 - 10;
          const dropY = e.y;
          if (this.onlyDropEquipped) {
            this.dropManager.drops.push({
              x: dropX, y: dropY, size: 20,
              type: this.player.weaponType, vy: 100
            });
          } else {
            this.dropManager.trySpawn(dropX, dropY);
          }
        }
        e._dropDone = true;
      }
    });

    // 5) Collecte drops & bonus score
    const collected = this.dropManager.update(delta, this.player);
    collected.forEach(type => {
      const bonus = this.player.upgradeWeapon(type);
      if (bonus) this.score += bonus;
    });

    // 6) Score hits
    this.score += hits;

    // 7) Clear de niveau ?
    if (this.enemies.enemies.every(e => !e.alive)) {
      audio.play('levelUp');
      this.level++;
      this._setupLevel();
      return;
    }

    // 8) Ennemis au bas
    const reached = this.enemies.enemies.some(
      e => e.alive && e.y + e.height >= this.canvas.height
    );
    if (reached) {
      audio.play('lifeLost');
      this._loseLife();
    }
  }

  _loseLife() {
    // Si godMode activé, on ignore la perte de vie
    if (this.godMode) return;

    // Si on a déjà déclenché le Game Over, on ne fait rien
    if (this.gameOver) return;

    this.lives--;
    console.log('Life lost! Lives remaining:', this.lives);

    if (this.lives <= 0) {
      // Bloquer à 0 et afficher Game Over
      this.lives    = 0;
      this.gameOver = true;
      cancelAnimationFrame(this.animationFrame);
      audio.play('gameOver');
      new SceneOver(this.canvas, this.ctx, this.score).start();
    } else {
      console.log(`Restarting level ${this.level}`);
      this._setupLevel();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Joueur toujours visible (même en godMode)
    this.player.draw();

    this.enemies.draw();
    this.weaponManager.draw();
    this.enemyWeapons.draw();
    this.dropManager.draw();
    this.hud.draw(
      this.score,
      this.lives,
      this.level,
      this.player.weaponType,
      this.player.weaponLevel
    );
  }
}
