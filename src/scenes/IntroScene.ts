import Phaser from 'phaser';
import { MaskType, getMaskIcon } from '../types';

const maskIntros = [
  { type: MaskType.CONVERT_FIGHTER, name: 'THE BRAWLER', nickname: '"VANGUARD"', effect: 'TRANSFORMS TO FIGHTER' },
  { type: MaskType.CONVERT_MAGE, name: 'THE ARCANE', nickname: '"ENCHANTER"', effect: 'TRANSFORMS TO MAGE' },
  { type: MaskType.CONVERT_ARCHER, name: 'THE SNIPER', nickname: '"DEADEYE"', effect: 'TRANSFORMS TO ARCHER' },
  { type: MaskType.BUFF_HP, name: 'THE VITALITY', nickname: '"BEHEMOTH"', effect: 'GRANT +60 MAX HP' },
  { type: MaskType.BUFF_DAMAGE, name: 'THE RAGE', nickname: '"SLAYER"', effect: 'GRANT +10 DAMAGE' },
  { type: MaskType.BUFF_SPEED, name: 'THE HASTE', nickname: '"STREAK"', effect: 'GRANT 1.4x SPEED' },
];

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    const cx = this.cameras.main.width / 2;

    // Background
    this.cameras.main.setBackgroundColor('#020617');

    // Title
    const title = this.add.text(cx, 70, 'MASK THE MINION', {
      fontSize: '64px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold italic',
      color: '#ffffff',
    }).setOrigin(0.5);
    title.setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, y: 80, duration: 700, ease: 'Back.easeOut' });

    // Mask emoji top-right of title
    const maskEmoji = this.add.text(cx + 300, 40, '\uD83C\uDFAD', {
      fontSize: '48px',
    }).setOrigin(0.5).setAngle(12);
    this.tweens.add({ targets: maskEmoji, alpha: { from: 0.6, to: 1 }, duration: 1200, yoyo: true, repeat: -1 });

    // Subtitle
    const subtitle = this.add.text(cx, 140, 'HEROES OF THE MOBA MASK LEAGUE', {
      fontSize: '16px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#94a3b8',
      letterSpacing: 8,
    }).setOrigin(0.5);
    subtitle.setAlpha(0);
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 700, delay: 200 });

    // P1 / P2 instruction boxes
    const boxY = 210;
    const boxW = 340;
    const boxH = 80;

    // Red team box
    const redGfx = this.add.graphics();
    redGfx.fillStyle(0xdc2626, 0.08);
    redGfx.fillRoundedRect(cx - boxW - 20, boxY, boxW, boxH, 16);
    redGfx.lineStyle(1, 0xdc2626, 0.3);
    redGfx.strokeRoundedRect(cx - boxW - 20, boxY, boxW, boxH, 16);

    this.add.text(cx - boxW + 10, boxY + 14, 'P1  RED TEAM (WASD)', {
      fontSize: '14px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ef4444',
    });
    this.add.text(cx - boxW + 10, boxY + 40, 'Starts at Bottom-Left. Collect masks\nand deliver them to your minions!', {
      fontSize: '11px', fontFamily: 'sans-serif', color: '#94a3b8', lineSpacing: 4,
    });

    // Blue team box
    const blueGfx = this.add.graphics();
    blueGfx.fillStyle(0x2563eb, 0.08);
    blueGfx.fillRoundedRect(cx + 20, boxY, boxW, boxH, 16);
    blueGfx.lineStyle(1, 0x2563eb, 0.3);
    blueGfx.strokeRoundedRect(cx + 20, boxY, boxW, boxH, 16);

    this.add.text(cx + 50, boxY + 14, 'P2  BLUE TEAM (ARROWS)', {
      fontSize: '14px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#3b82f6',
    });
    this.add.text(cx + 50, boxY + 40, 'Starts at Top-Right. Defend your base!\nEnemy minions at your corner = lost heart.', {
      fontSize: '11px', fontFamily: 'sans-serif', color: '#94a3b8', lineSpacing: 4,
    });

    // Mask parade panel
    const paradeY = 330;
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0f172a, 0.6);
    panelGfx.fillRoundedRect(cx - 480, paradeY, 960, 250, 24);
    panelGfx.lineStyle(1, 0xffffff, 0.05);
    panelGfx.strokeRoundedRect(cx - 480, paradeY, 960, 250, 24);

    // Staggered mask reveals
    const startX = cx - 400;
    const spacing = 160;

    maskIntros.forEach((item, i) => {
      const mx = startX + i * spacing;
      const my = paradeY + 70;

      // Icon
      const icon = this.add.text(mx, my, getMaskIcon(item.type), {
        fontSize: '40px', fontFamily: 'serif',
      }).setOrigin(0.5).setAlpha(0).setScale(0.5);

      // Name
      const name = this.add.text(mx, my + 40, item.name, {
        fontSize: '12px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setAlpha(0);

      // Nickname
      const nickname = this.add.text(mx, my + 58, item.nickname, {
        fontSize: '9px', fontFamily: 'monospace', fontStyle: 'bold', color: '#fbbf24',
        letterSpacing: 3,
      }).setOrigin(0.5).setAlpha(0);

      // Effect
      const effect = this.add.text(mx, my + 80, item.effect, {
        fontSize: '9px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#94a3b8',
      }).setOrigin(0.5).setAlpha(0);

      const delay = i * 400;
      this.tweens.add({ targets: icon, alpha: 1, scale: 1, duration: 600, delay, ease: 'Back.easeOut' });
      this.tweens.add({ targets: [name, nickname, effect], alpha: 1, duration: 400, delay: delay + 200 });

      // Bounce icon
      this.tweens.add({
        targets: icon, y: my - 8, duration: 600, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut', delay: delay + i * 150,
      });
    });

    // Battle Start button
    const btnY = 640;
    const btnContainer = this.add.container(cx, btnY + 30);

    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0xffffff, 1);
    btnGfx.fillRoundedRect(-160, -30, 320, 60, 30);
    btnContainer.add(btnGfx);

    const btnText = this.add.text(0, 0, 'BATTLE START', {
      fontSize: '28px', fontFamily: 'sans-serif', fontStyle: 'bold', color: '#0f172a',
    }).setOrigin(0.5);
    btnContainer.add(btnText);

    const btnZone = this.add.zone(0, 0, 320, 60).setInteractive({ useHandCursor: true });
    btnContainer.add(btnZone);

    btnZone.on('pointerover', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 150 });
    });
    btnZone.on('pointerout', () => {
      this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 150 });
    });
    btnZone.on('pointerdown', () => {
      this.scene.start('PlayScene');
    });

    // Button appear animation
    btnContainer.setAlpha(0);
    this.tweens.add({ targets: btnContainer, alpha: 1, duration: 600, delay: 2600 });
  }
}
