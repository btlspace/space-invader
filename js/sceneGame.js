// js/sceneGame.js

import { config } from '../config.js';
import { Player } from './player.js';
import { Enemies } from './enemies.js';
import { WeaponManager } from './weapons.js';
import { EnemyWeapons } from './enemyWeapons.js';
import { DropManager } from './drops.js';
import { ExplosionManager } from './explosionManager.js';
import { audio } from './audioManager.js';
import { CheatMenu } from './cheatMenu.js';
import { drawHUD } from './hud.js';

const FIXED_DT = 1 / 60;
const HIGH_SCORE_KEY = 'invader:highScore';

function readHighScore() {
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    const value = Number(raw || 0);
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  } catch {
    return 0;
  }
}

function writeHighScore(value) {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    // Ignore storage errors.
  }
}

export class SceneGame {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.level = 1;
    this.score = 0;
    this.highScore = readHighScore();
    this.lives = config.maxLives;

    this.mode = 'playing';
    this.godMode = false;
    this.disableDrops = false;
    this.onlyDropEquipped = false;
    this.paused = false;

    this.explosions = new ExplosionManager();
    this.cheatMenu = new CheatMenu(this);
    this.gameOverBlinkTick = 0;

    this._bindGlobalKeys();
    this._setupLevel();

    window.sceneGame = this;
  }

  async _toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen permission or browser capability errors.
    }
  }

  _updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      writeHighScore(this.highScore);
    }
  }

  _bindGlobalKeys() {
    this.onKeyDown = (e) => {
      if (e.key === 'Tab') {
        this.cheatMenu.toggle();
        e.preventDefault();
      }

      if (e.code === 'KeyM') {
        audio.toggleMuted();
        e.preventDefault();
      }

      if (e.code === 'KeyF') {
        this._toggleFullscreen();
        e.preventDefault();
      }

      this.cheatMenu.handleKey(e);

      if (this.mode === 'game_over' && e.code === 'Space') {
        e.preventDefault();
        this.restart();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);
  }

  _setupLevel() {
    const prevType = this.player?.weaponType || 'classic';
    const prevLevel = this.player?.weaponLevel || 1;

    this.player = new Player(this.canvas, this.ctx, prevType, prevLevel);
    this.enemies = new Enemies(this.canvas, this.ctx, this.level);
    this.weaponManager = new WeaponManager(this.canvas, this.ctx, this.explosions);
    this.enemyWeapons = new EnemyWeapons(this.canvas, this.ctx, this.enemies);
    this.dropManager = new DropManager(this.canvas, this.ctx);
  }

  start() {
    this.mode = 'playing';
    this.lastTime = performance.now();
    this._startRaf();
  }

  _startRaf() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  loop = (timestamp) => {
    const elapsed = Math.max(0, timestamp - this.lastTime);
    this.lastTime = timestamp;

    this.advanceTime(elapsed);

    this.animationFrame = requestAnimationFrame(this.loop);
  }

  advanceTime(ms) {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i++) {
      if (this.mode === 'playing' && !this.paused && !this.cheatMenu.active) {
        this.update(FIXED_DT);
      }
      this.draw();
      if (this.cheatMenu.active) {
        this.cheatMenu.draw(this.ctx);
      }
    }
  }

  update(delta) {
    this.player.update(delta);

    const playerHits = this.enemyWeapons.update(delta, this.player);
    if (playerHits > 0) {
      audio.play('playerExplosion');
      this._loseLife();
      if (this.mode === 'game_over') {
        return;
      }
    }

    this.enemies.update(delta);

    const hitScore = this.weaponManager.update(delta, this.player, this.enemies);
    this.explosions.update(delta);
    this.score += hitScore;

    this.enemies.enemies.forEach((e) => {
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

    const collected = this.dropManager.update(delta, this.player);
    collected.forEach((type) => {
      this.score += this.player.upgradeWeapon(type);
    });

    this._updateHighScore();

    if (this.enemies.enemies.every((e) => !e.alive)) {
      audio.play('levelUp');
      this.level += 1;
      this._setupLevel();
      return;
    }

    const reachedBottom = this.enemies.enemies.some(
      (e) => e.alive && e.y + e.height >= this.canvas.height
    );
    if (reachedBottom) {
      this._loseLife();
    }
  }

  _loseLife() {
    if (this.godMode || this.mode === 'game_over') {
      return;
    }

    this.lives -= 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.mode = 'game_over';
      this.paused = false;
      this._updateHighScore();
      audio.play('gameOver');
      return;
    }

    audio.play('lifeLost');
    this._setupLevel();
  }

  restart() {
    this._updateHighScore();
    this.level = 1;
    this.score = 0;
    this.lives = config.maxLives;
    this.mode = 'playing';
    this.paused = false;
    this._setupLevel();
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  getDebugState() {
    const aliveEnemies = this.enemies.enemies
      .filter((e) => e.alive)
      .map((e) => ({ x: Math.round(e.x), y: Math.round(e.y), w: e.width, h: e.height }));

    return {
      coordinateSystem: 'origin top-left; +x right; +y down',
      mode: this.mode,
      paused: this.paused,
      level: this.level,
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      muted: audio.isMuted,
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        w: this.player.width,
        h: this.player.height,
        weaponType: this.player.weaponType,
        weaponLevel: this.player.weaponLevel
      },
      enemies: aliveEnemies,
      enemyBullets: this.enemyWeapons.bullets.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
      playerBullets: this.weaponManager.bullets.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y), type: b.type })),
      drops: this.dropManager.drops.map((d) => ({ x: Math.round(d.x), y: Math.round(d.y), type: d.type }))
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.draw();
    this.enemies.draw();
    this.weaponManager.draw();
    this.enemyWeapons.draw();
    this.dropManager.draw();
    this.explosions.draw(this.ctx);

    drawHUD(
      this.score,
      this.level,
      { type: this.player.weaponType, level: this.player.weaponLevel },
      this.lives,
      this.highScore
    );

    if (this.mode === 'game_over') {
      this._drawGameOverOverlay();
    }
  }

  _drawGameOverOverlay() {
    this.gameOverBlinkTick += 1;
    const showPrompt = Math.floor(this.gameOverBlinkTick / 30) % 2 === 0;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ff3b3b';
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 48px JetBrains Mono';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px JetBrains Mono';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 50);

    if (showPrompt) {
      this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 86);
    }

    this.ctx.restore();
  }
}
