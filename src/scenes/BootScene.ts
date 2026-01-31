import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.spritesheet('characters', 'characters.png', {
      frameWidth: 341,
      frameHeight: 512,
    });
    this.load.spritesheet('tower', 'tower.png', {
      frameWidth: 341,
      frameHeight: 1024,
    });
    this.load.image('background', 'background.png');
    this.load.image('redCastle', 'redCastle.png');
    this.load.image('blueCastle', 'blueCastle.png');

    // Sound effects
    this.load.audio('blueCastleHit', 'sounds/blue castle was hit.mp3');
    this.load.audio('blueTowerDestroyed', 'sounds/blue tower has been destroyed.mp3');
    this.load.audio('blueWins', 'sounds/blue wins.mp3');
    this.load.audio('goWaveGo', 'sounds/go wave go.mp3');
    this.load.audio('redCastleHit', 'sounds/red castle was  hit.mp3');
    this.load.audio('redTowerDestroyed', 'sounds/red tower has been destroyed.mp3');
    this.load.audio('redWins', 'sounds/red wins.mp3');
    this.load.audio('battleBegins', 'sounds/the battle begins.mp3');
    this.load.audio('statsBlabber', 'sounds/statistics screen blabber.mp3');
  }

  create() {
    this.scene.start('IntroScene');
  }
}
