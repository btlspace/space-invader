const FIXED_DT = 1 / 60;
const HIGH_SCORE_KEY = 'invader:highScore';
const MUTE_KEY = 'invader:muted';

const PLAYER_SPEED = 330;
const PLAYER_SHOT_COOLDOWN_MS = 180;
const PLAYER_BULLET_SPEED = 540;
const ENEMY_BULLET_SPEED = 260;
const ENEMY_STEP_X = 24;
const ENEMY_DROP_Y = 26;
const BASE_ENEMY_STEP_DELAY = 0.48;
const MIN_ENEMY_STEP_DELAY = 0.14;

function getStorageNumber(key, fallback = 0) {
  try {
    const value = Number(localStorage.getItem(key) || fallback);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function setStorageNumber(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures.
  }
}

function getMutedPreference() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function setMutedPreference(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Ignore storage failures.
  }
}

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.manualStep = false;
  }

  create() {
    const { width, height } = this.scale;

    this.mode = 'playing';
    this.paused = false;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.highScore = Math.max(0, Math.floor(getStorageNumber(HIGH_SCORE_KEY, 0)));

    this.sound.mute = getMutedPreference();

    this.player = this.physics.add.image(width / 2, height - 80, 'ship').setDisplaySize(56, 56);
    this.player.setCollideWorldBounds(true);

    this.enemies = this.physics.add.group();
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.enemyDirection = 1;
    this.enemyMoveAcc = 0;
    this.enemyShotAcc = 0;

    this.spawnEnemies();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      m: Phaser.Input.Keyboard.KeyCodes.M,
      f: Phaser.Input.Keyboard.KeyCodes.F,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.lastShotAt = 0;

    this.physics.add.overlap(this.playerBullets, this.enemies, this.handleBulletEnemy, null, this);
    this.physics.add.overlap(this.enemyBullets, this.player, this.handleEnemyBullet, null, this);

    this.hud = this.add.text(12, 12, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#dbe9f4'
    }).setDepth(10);

    this.gameOverText = this.add.text(width / 2, height / 2, '', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '44px',
      color: '#ff5a5a',
      align: 'center'
    }).setOrigin(0.5).setDepth(20).setVisible(false);

    this.bindGlobalKeys();
    this.installAutomationHooks();
    this.refreshHud();
  }

  bindGlobalKeys() {
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.mode !== 'playing') return;
      this.paused = !this.paused;
      this.refreshHud();
    });

    this.input.keyboard.on('keydown-M', () => {
      this.sound.mute = !this.sound.mute;
      setMutedPreference(this.sound.mute);
      this.refreshHud();
    });

    this.input.keyboard.on('keydown-F', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.mode === 'game_over') {
        this.restart();
      }
    });
  }

  installAutomationHooks() {
    window.phaserSceneGame = this;

    window.render_game_to_text = () => JSON.stringify(this.getDebugState());
    window.advanceTime = (ms) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      this.manualStep = true;
      for (let i = 0; i < steps; i++) {
        this.tick(FIXED_DT);
      }
      this.manualStep = false;
    };
  }

  spawnEnemies() {
    const { width, height } = this.scale;

    const scaledRows = 3 + Math.floor((this.level - 1) / 2);
    const scaledCols = 6 + Math.floor((this.level - 1) / 3);

    const maxCols = Math.max(4, Math.floor((width - 120) / 72));
    const maxRows = Math.max(2, Math.floor((Math.max(180, height * 0.45) - 90) / 64));

    this.enemyRows = Math.min(scaledRows, maxRows);
    this.enemyCols = Math.min(scaledCols, maxCols);

    this.enemyStepDelay = Math.max(
      MIN_ENEMY_STEP_DELAY,
      BASE_ENEMY_STEP_DELAY * Math.pow(0.93, this.level - 1)
    );
    this.enemyFireDelay = Math.max(0.34, 0.9 - (this.level - 1) * 0.05);

    const startX = width / 2 - ((this.enemyCols - 1) * 72) / 2;
    const startY = 90;

    this.enemies.clear(true, true);
    this.enemyDirection = 1;
    this.enemyMoveAcc = 0;
    this.enemyShotAcc = 0;

    for (let r = 0; r < this.enemyRows; r++) {
      for (let c = 0; c < this.enemyCols; c++) {
        const enemy = this.enemies.create(startX + c * 72, startY + r * 64, 'enemy');
        enemy.setDisplaySize(42, 42);
      }
    }
  }

  update(_, deltaMs) {
    if (this.manualStep) return;
    this.tick(Math.max(0.001, deltaMs / 1000));
  }

  tick(dt) {
    if (this.mode !== 'playing' || this.paused) {
      return;
    }

    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemyFormation(dt);
    this.updateEnemyFire(dt);
    this.checkEnemyReachedBottom();

    if (this.enemies.countActive(true) === 0) {
      this.level += 1;
      this.spawnEnemies();
      this.playSound('levelUp', { volume: 0.6 });
      this.refreshHud();
    }
  }

  updatePlayer(dt) {
    if (this.cursors.left.isDown) this.player.x -= PLAYER_SPEED * dt;
    if (this.cursors.right.isDown) this.player.x += PLAYER_SPEED * dt;

    if (this.keys.space.isDown) {
      this.shoot();
    }
  }

  updateBullets(dt) {
    this.playerBullets.children.iterate((b) => {
      if (!b) return;
      b.y -= PLAYER_BULLET_SPEED * dt;
      if (b.y < -20) b.destroy();
    });

    this.enemyBullets.children.iterate((b) => {
      if (!b) return;
      b.y += ENEMY_BULLET_SPEED * dt;
      if (b.y > this.scale.height + 20) b.destroy();
    });
  }

  updateEnemyFormation(dt) {
    this.enemyMoveAcc += dt;
    if (this.enemyMoveAcc < this.enemyStepDelay) {
      return;
    }

    this.enemyMoveAcc = 0;

    const active = this.enemies.getChildren().filter((e) => e.active);
    if (!active.length) {
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    active.forEach((e) => {
      minX = Math.min(minX, e.x - 21);
      maxX = Math.max(maxX, e.x + 21);
    });

    const nextMin = minX + ENEMY_STEP_X * this.enemyDirection;
    const nextMax = maxX + ENEMY_STEP_X * this.enemyDirection;

    if (nextMin < 24 || nextMax > this.scale.width - 24) {
      active.forEach((e) => {
        e.y += ENEMY_DROP_Y;
      });
      this.enemyDirection *= -1;
      return;
    }

    active.forEach((e) => {
      e.x += ENEMY_STEP_X * this.enemyDirection;
    });
  }

  updateEnemyFire(dt) {
    this.enemyShotAcc += dt;
    if (this.enemyShotAcc < this.enemyFireDelay) {
      return;
    }

    this.enemyShotAcc = 0;
    const active = this.enemies.getChildren().filter((e) => e.active);
    if (!active.length) return;

    const shooter = Phaser.Utils.Array.GetRandom(active);
    const bullet = this.enemyBullets.create(shooter.x, shooter.y + 18, null);
    bullet.body.setAllowGravity(false);
    bullet.setSize(4, 12);
    bullet.setDisplaySize(4, 12);
    bullet.setTint(0xff00ff);
  }

  checkEnemyReachedBottom() {
    const active = this.enemies.getChildren().filter((e) => e.active);
    const limitY = this.scale.height - 120;
    if (active.some((e) => e.y >= limitY)) {
      this.loseLifeAndResetWave();
    }
  }

  loseLifeAndResetWave() {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.enterGameOver();
      return;
    }

    this.playSound('lifeLost', { volume: 0.65 });
    this.playerBullets.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
    this.spawnEnemies();
    this.refreshHud();
  }

  shoot() {
    const now = this.time.now;
    if (now - this.lastShotAt < PLAYER_SHOT_COOLDOWN_MS) return;
    this.lastShotAt = now;

    const bullet = this.playerBullets.create(this.player.x, this.player.y - 26, null);
    bullet.body.setAllowGravity(false);
    bullet.setSize(4, 12);
    bullet.setDisplaySize(4, 12);
    bullet.setTint(0xffffff);

    this.playSound('shoot', { volume: 0.4 });
  }

  handleBulletEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();

    this.score += 1;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      setStorageNumber(HIGH_SCORE_KEY, this.highScore);
    }

    this.playSound('enemyKilled', { volume: 0.5 });
    this.refreshHud();
  }

  handleEnemyBullet(bullet) {
    bullet.destroy();
    this.loseLifeAndResetWave();
  }

  enterGameOver() {
    this.mode = 'game_over';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      setStorageNumber(HIGH_SCORE_KEY, this.highScore);
    }

    this.playSound('gameOver', { volume: 0.6 });
    this.gameOverText.setText(`GAME OVER\nScore: ${this.score}\nBest: ${this.highScore}\nPress SPACE`);
    this.gameOverText.setVisible(true);
    this.refreshHud();
  }

  restart() {
    this.mode = 'playing';
    this.paused = false;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.lastShotAt = 0;

    this.gameOverText.setVisible(false);
    this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
    this.playerBullets.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.spawnEnemies();
    this.refreshHud();
  }

  refreshHud() {
    const pauseFlag = this.paused ? 'PAUSED' : 'LIVE';
    const muteFlag = this.sound.mute ? 'MUTED' : 'SFX ON';
    this.hud.setText(
      `Score: ${this.score}  Best: ${this.highScore}  Lives: ${this.lives}  Lvl: ${this.level}  ${pauseFlag}  ${muteFlag}`
    );
  }

  playSound(key, config = {}) {
    if (!this.sound || !this.sound.get(key)) {
      return;
    }

    this.sound.play(key, config);
  }

  getDebugState() {
    return {
      coordinateSystem: 'origin top-left; +x right; +y down',
      mode: this.mode,
      paused: this.paused,
      level: this.level,
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      muted: this.sound.mute,
      player: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        w: 56,
        h: 56
      },
      enemies: this.enemies
        .getChildren()
        .filter((e) => e.active)
        .map((e) => ({ x: Math.round(e.x), y: Math.round(e.y), w: 42, h: 42 })),
      playerBullets: this.playerBullets
        .getChildren()
        .filter((b) => b.active)
        .map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
      enemyBullets: this.enemyBullets
        .getChildren()
        .filter((b) => b.active)
        .map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
      drops: []
    };
  }
}
