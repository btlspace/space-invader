export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    window.render_game_to_text = () => JSON.stringify({
      coordinateSystem: 'origin top-left; +x right; +y down',
      mode: 'menu',
      paused: false,
      level: 0,
      score: 0,
      highScore: 0,
      lives: 0,
      muted: this.sound.mute,
      player: null,
      enemies: [],
      playerBullets: [],
      enemyBullets: [],
      drops: []
    });
    window.advanceTime = async () => {};

    this.add.text(width / 2, height / 2 - 40, 'Space Invader (Phaser)', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '42px',
      color: '#00dbe8'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20, 'Space: start  |  Esc: pause  |  M: mute  |  F: fullscreen', {
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '18px',
      color: '#dbe9f4'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
    if (navigator.webdriver) {
      this.time.delayedCall(250, () => this.scene.start('GameScene'));
    }
  }
}

