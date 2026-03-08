const FIXED_DT = 1 / 60;

function getHighScore() {
  try {
    return Number(localStorage.getItem('invader:phaser:highScore') || 0);
  } catch {
    return 0;
  }
}

function setHighScore(score) {
  try {
    localStorage.setItem('invader:phaser:highScore', String(score));
  } catch {
    // Ignore storage errors.
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
    this.highScore = getHighScore();

    this.player = this.physics.add.image(width / 2, height - 80, 'ship').setDisplaySize(56, 56);
    this.player.setCollideWorldBounds(true);

    this.enemies = this.physics.add.group();
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.spawnEnemies();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      m: Phaser.Input.Keyboard.KeyCodes.M,
      f: Phaser.Input.Keyboard.KeyCodes.F,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.lastShotAt = 0;
    this.enemyShootTimer = this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => this.enemyShoot()
    });

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
    const cols = 6;
    const rows = 3;
    const startX = this.scale.width / 2 - ((cols - 1) * 72) / 2;
    const startY = 90;

    this.enemies.clear(true, true);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
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
    if (this.mode !== 'playing') return;
    if (this.paused) return;

    const speed = 330;
    if (this.cursors.left.isDown) this.player.x -= speed * dt;
    if (this.cursors.right.isDown) this.player.x += speed * dt;

    if (this.keys.space.isDown) {
      this.shoot();
    }

    this.playerBullets.children.iterate((b) => {
      if (!b) return;
      b.y -= 540 * dt;
      if (b.y < -20) b.destroy();
    });

    this.enemyBullets.children.iterate((b) => {
      if (!b) return;
      b.y += 260 * dt;
      if (b.y > this.scale.height + 20) b.destroy();
    });

    if (this.enemies.countActive(true) === 0) {
      this.level += 1;
      this.spawnEnemies();
      this.refreshHud();
    }
  }

  shoot() {
    const now = this.time.now;
    if (now - this.lastShotAt < 180) return;
    this.lastShotAt = now;

    const bullet = this.playerBullets.create(this.player.x, this.player.y - 26, null);
    bullet.body.setAllowGravity(false);
    bullet.setSize(4, 12);
    bullet.setDisplaySize(4, 12);
    bullet.setTint(0xffffff);

    this.sound.play('shoot', { volume: 0.4 });
  }

  enemyShoot() {
    if (this.mode !== 'playing' || this.paused) return;
    const active = this.enemies.getChildren().filter((e) => e.active);
    if (!active.length) return;

    const shooter = Phaser.Utils.Array.GetRandom(active);
    const bullet = this.enemyBullets.create(shooter.x, shooter.y + 18, null);
    bullet.body.setAllowGravity(false);
    bullet.setSize(4, 12);
    bullet.setDisplaySize(4, 12);
    bullet.setTint(0xff00ff);
  }

  handleBulletEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.score += 1;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      setHighScore(this.highScore);
    }
    this.sound.play('enemyKilled', { volume: 0.5 });
    this.refreshHud();
  }

  handleEnemyBullet(bullet) {
    bullet.destroy();
    this.lives -= 1;
    if (this.lives <= 0) {
      this.lives = 0;
      this.mode = 'game_over';
      if (this.score > this.highScore) {
        this.highScore = this.score;
        setHighScore(this.highScore);
      }
      this.sound.play('gameOver', { volume: 0.6 });
      this.gameOverText.setText(`GAME OVER\nScore: ${this.score}\nBest: ${this.highScore}\nPress SPACE`);
      this.gameOverText.setVisible(true);
    }
    this.refreshHud();
  }

  restart() {
    this.mode = 'playing';
    this.paused = false;
    this.level = 1;
    this.score = 0;
    this.lives = 3;
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
      enemies: this.enemies.getChildren().filter((e) => e.active).map((e) => ({ x: Math.round(e.x), y: Math.round(e.y), w: 42, h: 42 })),
      playerBullets: this.playerBullets.getChildren().filter((b) => b.active).map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
      enemyBullets: this.enemyBullets.getChildren().filter((b) => b.active).map((b) => ({ x: Math.round(b.x), y: Math.round(b.y) })),
      drops: []
    };
  }
}
