import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('characters', 'src/characters.png', {
      frameWidth: 341,
      frameHeight: 512,
    });
    this.load.spritesheet('tower', 'src/tower.png', {
      frameWidth: 341,
      frameHeight: 1024,
    });
    this.load.image('background', 'src/background.png');
  }

  create() {
    this.scene.start('IntroScene');
  }
}
