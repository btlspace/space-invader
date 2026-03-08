export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('ship', '../assets/img/baseshipa.ico');
    this.load.image('enemy', '../assets/img/saucer2a.ico');

    this.load.audio('shoot', '../assets/sounds/shoot.wav');
    this.load.audio('enemyKilled', '../assets/sounds/invaderkilled.wav');
    this.load.audio('gameOver', '../assets/sounds/game_over.mp3');
    this.load.audio('levelUp', '../assets/sounds/level_up.mp3');
    this.load.audio('lifeLost', '../assets/sounds/life_lost.mp3');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
