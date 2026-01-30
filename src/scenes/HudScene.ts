import Phaser from 'phaser';
import { GameEngine } from '../engine/GameEngine';

export class HudScene extends Phaser.Scene {
  private engine!: GameEngine;

  private redHPTexts: Phaser.GameObjects.Text[] = [];
  private blueHPTexts: Phaser.GameObjects.Text[] = [];
  private timerText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super('HudScene');
  }

  create(data: { engine: GameEngine }) {
    this.engine = data.engine;
    this.redHPTexts = [];
    this.blueHPTexts = [];

    const w = this.cameras.main.width;

    // --- Red HP panel (top-left) ---
    const redPanel = this.add.graphics();
    redPanel.fillStyle(0x0f172a, 0.9);
    redPanel.fillRoundedRect(20, 20, 180, 70, 12);
    redPanel.lineStyle(2, 0xdc2626, 1);
    redPanel.strokeRoundedRect(20, 20, 180, 70, 12);

    this.add.text(30, 28, 'P1 - RED CORE', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#f87171',
      letterSpacing: 3,
    });

    for (let i = 0; i < 3; i++) {
      const t = this.add.text(36 + i * 50, 52, '\u2764\uFE0F', {
        fontSize: '24px',
      });
      this.redHPTexts.push(t);
    }

    // --- Timer (top-center) ---
    const timerPanel = this.add.graphics();
    timerPanel.fillStyle(0x0f172a, 0.95);
    timerPanel.fillRoundedRect(w / 2 - 80, 20, 160, 44, 22);
    timerPanel.lineStyle(2, 0x334155, 1);
    timerPanel.strokeRoundedRect(w / 2 - 80, 20, 160, 44, 22);

    this.timerText = this.add.text(w / 2, 42, '0:00', {
      fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);

    // Wave countdown
    const wavePanel = this.add.graphics();
    wavePanel.fillStyle(0x1e293b, 0.9);
    wavePanel.fillRoundedRect(w / 2 - 50, 70, 100, 24, 12);
    wavePanel.lineStyle(1, 0x475569, 1);
    wavePanel.strokeRoundedRect(w / 2 - 50, 70, 100, 24, 12);

    this.waveText = this.add.text(w / 2, 82, 'WAVE: 5s', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#e2e8f0',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // --- Blue HP panel (top-right) ---
    const bluePanel = this.add.graphics();
    bluePanel.fillStyle(0x0f172a, 0.9);
    bluePanel.fillRoundedRect(w - 200, 20, 180, 70, 12);
    bluePanel.lineStyle(2, 0x2563eb, 1);
    bluePanel.strokeRoundedRect(w - 200, 20, 180, 70, 12);

    this.add.text(w - 190, 28, 'P2 - BLUE CORE', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#60a5fa',
      letterSpacing: 3,
    });

    for (let i = 0; i < 3; i++) {
      const t = this.add.text(w - 184 + i * 50, 52, '\u2764\uFE0F', {
        fontSize: '24px',
      });
      this.blueHPTexts.push(t);
    }

    // --- Control hint (bottom-left) ---
    this.hintText = this.add.text(30, this.cameras.main.height - 30, 'P1 RED (WASD) \u2022 P2 BLUE (ARROWS)', {
      fontSize: '10px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff',
      letterSpacing: 3,
    }).setAlpha(0.4);
  }

  update() {
    if (!this.engine) return;

    // Update Red HP
    for (let i = 0; i < 3; i++) {
      if (i < this.engine.redBaseHP) {
        this.redHPTexts[i].setText('\u2764\uFE0F');
        this.redHPTexts[i].setAlpha(1);
      } else {
        this.redHPTexts[i].setText('\uD83D\uDC80');
        this.redHPTexts[i].setAlpha(0.3);
      }
    }

    // Update Blue HP
    for (let i = 0; i < 3; i++) {
      if (i < this.engine.blueBaseHP) {
        this.blueHPTexts[i].setText('\u2764\uFE0F');
        this.blueHPTexts[i].setAlpha(1);
      } else {
        this.blueHPTexts[i].setText('\uD83D\uDC80');
        this.blueHPTexts[i].setAlpha(0.3);
      }
    }

    // Timer
    const secs = Math.floor(this.engine.matchTime / 60);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    this.timerText.setText(`${mins}:${s.toString().padStart(2, '0')}`);

    // Wave
    const waveSecs = Math.max(0, Math.ceil(this.engine.waveTimer / 60));
    this.waveText.setText(`WAVE: ${waveSecs}s`);
  }
}
