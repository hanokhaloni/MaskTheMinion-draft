import Phaser from 'phaser';
import { MaskType, getMaskIcon } from '../types';

export class GameMask extends Phaser.GameObjects.Container {
  public active = true;
  public type: MaskType;
  public radius = 12;

  private iconText: Phaser.GameObjects.Text;
  private auraGfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, type: MaskType) {
    super(scene, x, y);
    this.type = type;

    // Shadow
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 10, 24, 12);
    this.add(shadow);

    // Aura
    this.auraGfx = scene.add.graphics();
    this.add(this.auraGfx);

    // Icon
    this.iconText = scene.add.text(0, 0, getMaskIcon(type), {
      fontSize: '32px',
      fontFamily: 'serif',
    }).setOrigin(0.5);
    this.add(this.iconText);

    this.setDepth(10);
    scene.add.existing(this);

    // Floating sine tween
    scene.tweens.add({
      targets: this.iconText,
      y: { from: -5, to: 5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pulsing aura
    this.drawAura(18);
    scene.tweens.add({
      targets: this,
      _auraRadius: { from: 18, to: 22 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (_tween: Phaser.Tweens.Tween, target: any) => {
        this.drawAura(target._auraRadius ?? 18);
      },
    });
  }

  private _auraRadius = 18;

  private drawAura(radius: number) {
    this.auraGfx.clear();
    this.auraGfx.lineStyle(2, 0xffffff, 0.4);
    this.auraGfx.strokeCircle(0, this.iconText.y, radius);
  }
}
