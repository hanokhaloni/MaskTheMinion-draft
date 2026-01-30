import Phaser from 'phaser';

export class Tower extends Phaser.GameObjects.Container {
  public hp = 180;
  public maxHp = 180;
  public damage = 10;
  public range = 180;
  public cooldown = 0;
  public side: 'Blue' | 'Red';
  public radius = 30;

  private bodyGfx: Phaser.GameObjects.Graphics;
  private iconText: Phaser.GameObjects.Text;
  private hpBarGfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, side: 'Blue' | 'Red') {
    super(scene, x, y);
    this.side = side;

    this.bodyGfx = scene.add.graphics();
    this.add(this.bodyGfx);

    this.iconText = scene.add.text(0, 7, '\u265C', {
      fontSize: '20px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add(this.iconText);

    this.hpBarGfx = scene.add.graphics();
    this.add(this.hpBarGfx);

    this.setDepth(20);
    this.redraw();
    scene.add.existing(this);
  }

  redraw() {
    this.bodyGfx.clear();
    this.hpBarGfx.clear();

    const r = this.radius;
    const color = this.side === 'Blue' ? 0x1e40af : 0x991b1b;

    if (this.hp <= 0) {
      this.setVisible(false);
      return;
    }

    this.iconText.setVisible(true);

    // Shadow
    this.bodyGfx.fillStyle(0x000000, 0.4);
    this.bodyGfx.fillEllipse(0, 10, r * 2, 14);

    // Body
    this.bodyGfx.fillStyle(color, 1);
    this.bodyGfx.fillRoundedRect(-r, -r, r * 2, r * 2, 12);
    this.bodyGfx.lineStyle(1, 0xffffff, 0.3);
    this.bodyGfx.strokeRoundedRect(-r, -r, r * 2, r * 2, 12);

    // HP bar
    this.hpBarGfx.fillStyle(0x0f172a, 1);
    this.hpBarGfx.fillRect(-30, -45, 60, 8);
    const hpColor = this.side === 'Blue' ? 0x3b82f6 : 0xef4444;
    this.hpBarGfx.fillStyle(hpColor, 1);
    this.hpBarGfx.fillRect(-30, -45, 60 * (this.hp / this.maxHp), 8);
  }
}
