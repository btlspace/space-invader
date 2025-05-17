// js/sceneGame.js

import { config }           from '../config.js';
import { Player }           from './player.js';
import { Enemies }          from './enemies.js';
import { WeaponManager }    from './weapons.js';
import { EnemyWeapons }     from './enemyWeapons.js';
import { DropManager }      from './drops.js';
import { ExplosionManager } from './explosionManager.js';
import { SceneOver }        from './sceneOver.js';
import { audio }            from './audioManager.js';
import { CheatMenu }        from './cheatMenu.js';
import { drawHUD }          from './hud.js';

export class SceneGame {
  constructor(canvas, ctx) {
    this.canvas           = canvas;
    this.ctx              = ctx;
    this.level            = 1;
    this.score            = 0;
    this.lives            = config.maxLives;
    this.gameOver         = false;
    this.godMode          = false;
    this.disableDrops     = false;
    this.onlyDropEquipped = false;
    this.paused           = false;

    this.explosions       = new ExplosionManager();
    this.cheatMenu        = new CheatMenu(this);

    // Cheat menu toggle
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
    // conserve score, lives et arme
    const prevType  = this.player?.weaponType  || 'classic';
    const prevLevel = this.player?.weaponLevel || 1;

    this.player        = new Player(this.canvas, this.ctx, prevType, prevLevel);
    this.enemies       = new Enemies(this.canvas, this.ctx, this.level);
    this.weaponManager = new WeaponManager(this.canvas, this.ctx, this.explosions);
    this.enemyWeapons  = new EnemyWeapons(this.canvas, this.ctx, this.enemies);
    this.dropManager   = new DropManager(this.canvas, this.ctx);
    this.lastTime      = performance.now();
    this.gameOver      = false;
  }

  start() {
    this.gameOver = false;
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  loop = timestamp => {
    // update only if not paused, not in cheat menu, and not game over
    if (!this.cheatMenu.active && !this.paused && !this.gameOver) {
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

    // enemy bullets → player
    const pHits = this.enemyWeapons.update(delta, this.player);
    if (pHits > 0) {
      audio.play('playerExplosion');
      this._loseLife();
      return;
    }

    // move enemies
    this.enemies.update(delta);

    // player bullets → enemies & spawn explosion
    const hits = this.weaponManager.update(delta, this.player, this.enemies);

    // update explosion visuals
    this.explosions.update(delta);

    // spawn drops for killed enemies
    this.enemies.enemies.forEach(e => {
      if (!e.alive && !e._dropDone && !this.disableDrops) {
        const x = e.x + e.width / 2 - 10;
        const y = e.y;
        this.dropManager.trySpawn(
          x,
          y,
          this.onlyDropEquipped ? this.player.weaponType : undefined
        );
        e._dropDone = true;
      }
    });

    // collect drops & apply bonuses
    const collected = this.dropManager.update(delta, this.player);
    collected.forEach(type => {
      const bonus = this.player.upgradeWeapon(type);
      if (bonus) this.score += bonus;
    });

    this.score += hits;

    // level clear
    if (this.enemies.enemies.every(e => !e.alive)) {
      audio.play('levelUp');
      this.level++;
      this._setupLevel();
      return;  // avoid triggering _loseLife after level up
    }

    // enemies reached bottom
    const reached = this.enemies.enemies.some(
      e => e.alive && e.y + e.height >= this.canvas.height
    );
    if (reached) {
      audio.play('lifeLost');
      this._loseLife();
    }
  }

  _loseLife() {
    if (this.godMode || this.gameOver) return;
    this.lives--;
    if (this.lives <= 0) {
      this.lives    = 0;
      this.gameOver = true;
      cancelAnimationFrame(this.animationFrame);
      audio.play('gameOver');
      new SceneOver(this.canvas, this.ctx, this.score).start();
    } else {
      audio.play('lifeLost');
      this._setupLevel();
    }
  }


draw() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // dessin des entités
  this.player.draw();
  this.enemies.draw();
  this.weaponManager.draw();
  this.enemyWeapons.draw();
  this.dropManager.draw();
  this.explosions.draw(this.ctx);

  // HUD
  drawHUD(
    this.score,
    this.level,
    { type: this.player.weaponType, level: this.player.weaponLevel },
    this.lives
  );
}



}
