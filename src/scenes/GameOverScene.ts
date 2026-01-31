import Phaser from 'phaser';
import { GameStats } from '../types';
import { audio } from '../audioService';

export class GameOverScene extends Phaser.Scene {
  private blabberSound: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('GameOverScene');
  }

  create(data: { stats: GameStats }) {
    const stats = data.stats;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.cameras.main.setBackgroundColor('#020617');

    // Play win announcement
    this.sound.play(stats.winner === 'Blue' ? 'blueWins' : 'redWins');

    // Panel background (expanded for silly stats)
    const panel = this.add.graphics();
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(cx - 380, cy - 260, 760, 560, 32);
    panel.lineStyle(2, 0x1e293b, 1);
    panel.strokeRoundedRect(cx - 380, cy - 260, 760, 560, 32);

    // "Victory Achieved"
    this.add.text(cx, cy - 235, 'VICTORY ACHIEVED', {
      fontSize: '29px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Winner text
    const winnerColor = stats.winner === 'Blue' ? '#3b82f6' : '#ef4444';
    const winnerText = this.add.text(cx, cy - 185, `TEAM ${stats.winner?.toUpperCase()}`, {
      fontSize: '104px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: winnerColor,
    }).setOrigin(0.5);
    winnerText.setAlpha(0);
    this.tweens.add({ targets: winnerText, alpha: 1, duration: 800, ease: 'Power2' });

    // Stats columns
    const colW = 280;
    const colY = cy - 85;

    // Red performance
    const redPanel = this.add.graphics();
    redPanel.fillStyle(0x020617, 1);
    redPanel.fillRoundedRect(cx - 350, colY, colW, 130, 20);
    redPanel.lineStyle(1, 0xdc2626, 0.2);
    redPanel.strokeRoundedRect(cx - 350, colY, colW, 130, 20);

    this.add.text(cx - 330, colY + 12, 'RED PERFORMANCE', {
      fontSize: '27px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#f87171',
      letterSpacing: 3,
    });

    this.add.text(cx - 330, colY + 42, 'Total Damage', {
      fontSize: '24px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx - 350 + colW - 20, colY + 42, String(Math.floor(stats.redDamageDealt)), {
      fontSize: '48px', fontFamily: 'LifeCraft', color: '#ffffff',
    }).setOrigin(1, 0);

    this.add.text(cx - 330, colY + 80, 'Army Size', {
      fontSize: '24px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx - 350 + colW - 20, colY + 80, String(stats.redMinionsSpawned), {
      fontSize: '48px', fontFamily: 'LifeCraft', color: '#ffffff',
    }).setOrigin(1, 0);

    // Blue performance
    const bluePanel = this.add.graphics();
    bluePanel.fillStyle(0x020617, 1);
    bluePanel.fillRoundedRect(cx + 70, colY, colW, 130, 20);
    bluePanel.lineStyle(1, 0x2563eb, 0.2);
    bluePanel.strokeRoundedRect(cx + 70, colY, colW, 130, 20);

    this.add.text(cx + 90, colY + 12, 'BLUE PERFORMANCE', {
      fontSize: '27px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#60a5fa',
      letterSpacing: 3,
    });

    this.add.text(cx + 90, colY + 42, 'Total Damage', {
      fontSize: '24px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx + 70 + colW - 20, colY + 42, String(Math.floor(stats.blueDamageDealt)), {
      fontSize: '48px', fontFamily: 'LifeCraft', color: '#ffffff',
    }).setOrigin(1, 0);

    this.add.text(cx + 90, colY + 80, 'Army Size', {
      fontSize: '24px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
    });
    this.add.text(cx + 70 + colW - 20, colY + 80, String(stats.blueMinionsSpawned), {
      fontSize: '48px', fontFamily: 'LifeCraft', color: '#ffffff',
    }).setOrigin(1, 0);

    // Match duration
    const mins = Math.floor(stats.matchTime / 60);
    const secs = stats.matchTime % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

    this.add.text(cx - 60, cy + 65, 'MATCH DURATION', {
      fontSize: '27px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#64748b',
      letterSpacing: 4,
    });
    this.add.text(cx + 150, cy + 63, timeStr, {
      fontSize: '38px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#1e293b',
      padding: { x: 8, y: 4 },
    });

    // --- Silly Statistics ---
    const sillyStats = [
      { label: 'Time Spent Masking', value: Math.floor(stats.matchTime * 0.3 + Math.random() * 30) },
      { label: 'Total Masks Ignored', value: Math.floor(Math.random() * 47) + 3 },
      { label: 'Excuses Count', value: Math.floor(Math.random() * 200) + 10 },
      { label: 'Points', value: Math.floor(Math.random() * 99999) + 1000 },
      { label: 'Hidden Areas Found', value: Math.floor(Math.random() * 3) },
      { label: 'Distance Walked Backwards', value: Math.floor(Math.random() * 5000) + 100 },
      { label: 'Rage-Quit Probability (%)', value: Math.floor(Math.random() * 98) + 1 },
      { label: 'Achievements Almost Earned', value: Math.floor(Math.random() * 12) + 1 },
    ];

    const sillyY = cy + 100;
    const sillyColW = 340;

    const sillyPanel = this.add.graphics();
    sillyPanel.fillStyle(0x020617, 0.6);
    sillyPanel.fillRoundedRect(cx - 350, sillyY, 700, 180, 16);
    sillyPanel.lineStyle(1, 0xfbbf24, 0.15);
    sillyPanel.strokeRoundedRect(cx - 350, sillyY, 700, 180, 16);

    // 4 rows x 2 columns
    sillyStats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = cx - 330 + col * sillyColW;
      const sy = sillyY + 12 + row * 42;

      this.add.text(sx, sy, stat.label, {
        fontSize: '21px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#94a3b8',
      });

      const valueText = this.add.text(sx + sillyColW - 40, sy, '0', {
        fontSize: '35px', fontFamily: 'LifeCraft', color: '#fbbf24',
      }).setOrigin(1, 0);

      // Count-up animation with casino ding
      const counter = { val: 0 };
      const delay = 500 + i * 400;

      // Ding timer that fires during count-up
      const dingTimer = this.time.addEvent({
        delay: 80,
        loop: true,
        paused: true,
        callback: () => { audio.playDing(); },
      });

      this.time.delayedCall(delay, () => { dingTimer.paused = false; });

      this.tweens.add({
        targets: counter,
        val: stat.value,
        duration: 1200,
        delay,
        ease: 'Power2',
        onUpdate: () => {
          valueText.setText(String(Math.floor(counter.val)));
        },
        onComplete: () => {
          dingTimer.remove();
          valueText.setText(String(stat.value));
          this.cameras.main.shake(150, 0.003);
          this.spawnConfetti(valueText.x - 20, valueText.y + 10);
        },
      });
    });

    // Blabber sound after 10 seconds
    this.time.delayedCall(10000, () => {
      if (this.scene.isActive()) {
        this.blabberSound = this.sound.add('statsBlabber', { loop: true });
        this.blabberSound.play();
      }
    });

    // Restart button
    const btnContainer = this.add.container(cx, cy + 315);

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0xdc2626, 1);
    btnGfx.fillRoundedRect(-200, -25, 200, 50, { tl: 16, bl: 16, tr: 0, br: 0 });
    btnGfx.fillStyle(0x2563eb, 1);
    btnGfx.fillRoundedRect(0, -25, 200, 50, { tl: 0, bl: 0, tr: 16, br: 16 });
    btnContainer.add(btnGfx);

    const btnText = this.add.text(0, 0, 'RE-ENTER THE ARENA', {
      fontSize: '43px', fontFamily: 'LifeCraft', fontStyle: 'bold', color: '#ffffff',
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
      if (this.blabberSound) {
        this.blabberSound.stop();
        this.blabberSound = null;
      }
      this.scene.start('IntroScene');
    });
  }

  private spawnConfetti(x: number, y: number) {
    const colors = [0xfbbf24, 0xef4444, 0x3b82f6, 0x22c55e, 0xa855f7, 0xf97316];
    for (let i = 0; i < 12; i++) {
      const confetti = this.add.graphics();
      confetti.setDepth(50);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 3 + Math.random() * 4;
      confetti.fillStyle(color, 1);
      confetti.fillRect(-size / 2, -size / 2, size, size);
      confetti.setPosition(x, y);

      this.tweens.add({
        targets: confetti,
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 60 - 20,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        angle: Math.random() * 360,
        duration: 500 + Math.random() * 400,
        ease: 'Quad.easeOut',
        onComplete: () => confetti.destroy(),
      });
    }
  }
}
