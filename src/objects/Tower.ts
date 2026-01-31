import Phaser from 'phaser';

const TOWER_SCALE = 0.14;
const RED_TINT = 0xff9999;
const BLUE_TINT = 0x9999ff;

const FRAME_HEALTHY = 0;
const FRAME_DAMAGED = 1;
const FRAME_DESTROYED = 2;

export class Tower extends Phaser.GameObjects.Container {
  public hp = 180;
  public maxHp = 180;
  public damage = 10;
  public range = 180;
  public cooldown = 0;
  public side: 'Blue' | 'Red';
  public radius = 30;

  private sprite: Phaser.GameObjects.Sprite;
  private hpBarGfx: Phaser.GameObjects.Graphics;
  private lastFrame = -1;

  constructor(scene: Phaser.Scene, x: number, y: number, side: 'Blue' | 'Red') {
    super(scene, x, y);
    this.side = side;

    // Shadow
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(0, 4, this.radius * 3, 20);
    this.add(shadow);

    // Tower sprite
    this.sprite = scene.add.sprite(0, -36, 'tower', FRAME_HEALTHY);
    this.sprite.setScale(TOWER_SCALE);
    this.sprite.setTint(side === 'Red' ? RED_TINT : BLUE_TINT);
    this.add(this.sprite);

    // HP bar
    this.hpBarGfx = scene.add.graphics();
    this.add(this.hpBarGfx);

    this.setDepth(20);
    this.redraw();
    scene.add.existing(this);
  }

  redraw() {
    this.hpBarGfx.clear();

    const hpRatio = this.hp / this.maxHp;
    let frame: number;

    if (this.hp <= 0) {
      frame = FRAME_DESTROYED;
    } else if (hpRatio <= 0.6) {
      frame = FRAME_DAMAGED;
    } else {
      frame = FRAME_HEALTHY;
    }

    if (frame !== this.lastFrame) {
      this.sprite.setFrame(frame);
      this.lastFrame = frame;
    }

    // No HP bar when destroyed
    if (this.hp <= 0) return;

    // HP bar sized to match sprite width
    const barW = 48;
    const barH = 6;
    const barX = -barW / 2;
    const barY = -110;
    this.hpBarGfx.fillStyle(0x0f172a, 1);
    this.hpBarGfx.fillRect(barX, barY, barW, barH);
    const hpColor = this.side === 'Blue' ? 0x3b82f6 : 0xef4444;
    this.hpBarGfx.fillStyle(hpColor, 1);
    this.hpBarGfx.fillRect(barX, barY, barW * hpRatio, barH);
  }
}
