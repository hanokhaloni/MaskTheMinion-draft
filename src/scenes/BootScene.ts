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
  }

  create() {
    this.scene.start('IntroScene');
  }
}
