import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#07182a',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [BootScene, MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(gameConfig);
window.phaserGame = game;

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

