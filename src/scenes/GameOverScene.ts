import Phaser from 'phaser';
import { GameStats } from '../types';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { stats: GameStats }) {
    const stats = data.stats;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.cameras.main.setBackgroundColor('#020617');

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(cx - 350, cy - 250, 700, 500, 32);
    panel.lineStyle(2, 0x1e293b, 1);
    panel.strokeRoundedRect(cx - 350, cy - 250, 700, 500, 32);

    // "Victory Achieved"
    this.add.text(cx, cy - 210, 'VICTORY ACHIEVED', {
      fontSize: '12px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Winner text
    const winnerColor = stats.winner === 'Blue' ? '#3b82f6' : '#ef4444';
    const winnerText = this.add.text(cx, cy - 160, `TEAM ${stats.winner?.toUpperCase()}`, {
      fontSize: '56px', fontFamily: 'sans-serif', fontStyle: 'bold', color: winnerColor,
    }).setOrigin(0.5);
    winnerText.setAlpha(0);
    this.tweens.add({ targets: winnerText, alpha: 1, duration: 800, ease: 'Power2' });

    // Stats columns
    const colW = 280;
    const colY = cy - 70;

    // Red performance
    const redPanel = this.add.graphics();
    redPanel.fillStyle(0x020617, 1);
    redPanel.fillRoundedRect(cx - 330, colY, colW, 150, 20);
    redPanel.lineStyle(1, 0xdc2626, 0.2);
    redPanel.strokeRoundedRect(cx - 330, colY, colW, 150, 20);

    this.add.text(cx - 330 + 20, colY + 15, 'RED PERFORMANCE', {
      fontSize: '11px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#f87171',
      letterSpacing: 3,
    });

    this.add.text(cx - 330 + 20, colY + 50, 'Total Damage', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx - 330 + colW - 20, colY + 50, String(Math.floor(stats.redDamageDealt)), {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(1, 0);

    this.add.text(cx - 330 + 20, colY + 90, 'Army Size', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx - 330 + colW - 20, colY + 90, String(stats.redMinionsSpawned), {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(1, 0);

    // Blue performance
    const bluePanel = this.add.graphics();
    bluePanel.fillStyle(0x020617, 1);
    bluePanel.fillRoundedRect(cx + 50, colY, colW, 150, 20);
    bluePanel.lineStyle(1, 0x2563eb, 0.2);
    bluePanel.strokeRoundedRect(cx + 50, colY, colW, 150, 20);

    this.add.text(cx + 70, colY + 15, 'BLUE PERFORMANCE', {
      fontSize: '11px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#60a5fa',
      letterSpacing: 3,
    });

    this.add.text(cx + 70, colY + 50, 'Total Damage', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx + 50 + colW - 20, colY + 50, String(Math.floor(stats.blueDamageDealt)), {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(1, 0);

    this.add.text(cx + 70, colY + 90, 'Army Size', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx + 50 + colW - 20, colY + 90, String(stats.blueMinionsSpawned), {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(1, 0);

    // Match duration
    const mins = Math.floor(stats.matchTime / 60);
    const secs = stats.matchTime % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    this.add.text(cx - 60, cy + 120, 'MATCH DURATION', {
      fontSize: '11px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#64748b',
      letterSpacing: 4,
    });
    this.add.text(cx + 120, cy + 118, timeStr, {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1e293b',
      padding: { x: 8, y: 4 },
    });

    // Restart button
    const btnY = cy + 180;
    const btnContainer = this.add.container(cx, btnY + 25);

    const btnGfx = this.add.graphics();
    // Gradient simulation: left red, right blue
    btnGfx.fillStyle(0xdc2626, 1);
    btnGfx.fillRoundedRect(-200, -25, 200, 50, { tl: 16, bl: 16, tr: 0, br: 0 });
    btnGfx.fillStyle(0x2563eb, 1);
    btnGfx.fillRoundedRect(0, -25, 200, 50, { tl: 0, bl: 0, tr: 16, br: 16 });
    btnContainer.add(btnGfx);

    const btnText = this.add.text(0, 0, 'RE-ENTER THE ARENA', {
      fontSize: '18px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    btnContainer.add(btnText);

    const btnZone = this.add.zone(0, 0, 400, 50).setInteractive({ useHandCursor: true });
    btnContainer.add(btnZone);

    btnZone.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    btnZone.on('pointerout', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });
    btnZone.on('pointerdown', () => {
      this.scene.start('IntroScene');
    });
  }
}
