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
    this.load.image('redCastle', 'src/redCastle.png');
    this.load.image('blueCastle', 'src/blueCastle.png');

    // Sound effects
    this.load.audio('blueCastleHit', 'src/sounds/blue castle was hit.mp3');
    this.load.audio('blueTowerDestroyed', 'src/sounds/blue tower has been destroyed.mp3');
    this.load.audio('blueWins', 'src/sounds/blue wins.mp3');
    this.load.audio('goWaveGo', 'src/sounds/go wave go.mp3');
    this.load.audio('redCastleHit', 'src/sounds/red castle was  hit.mp3');
    this.load.audio('redTowerDestroyed', 'src/sounds/red tower has been destroyed.mp3');
    this.load.audio('redWins', 'src/sounds/red wins.mp3');
    this.load.audio('battleBegins', 'src/sounds/the battle begins.mp3');
  }

  create() {
    this.scene.start('IntroScene');
  }
}
