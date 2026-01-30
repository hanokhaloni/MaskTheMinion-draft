import Phaser from 'phaser';

export interface ProjectileTarget {
  x: number;
  y: number;
  hp: number;
}

export class Projectile extends Phaser.GameObjects.Container {
  public speed = 8;
  public active = true;
  public target: ProjectileTarget;
  public color: string;
  public onHit: () => void;

  private gfx: Phaser.GameObjects.Graphics;
  private prevX: number;
  private prevY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, target: ProjectileTarget, damage: number, color: string, onHit: () => void) {
    super(scene, x, y);
    this.target = target;
    this.color = color;
    this.onHit = onHit;
    this.prevX = x;
    this.prevY = y;

    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    this.setDepth(50);
    scene.add.existing(this);
  }

  update() {
    if (!this.active) return;

    this.prevX = this.x;
    this.prevY = this.y;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      this.onHit();
      this.active = false;
      this.destroy();
      return;
    }

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    this.redraw();
  }

  private redraw() {
    this.gfx.clear();
    const col = Phaser.Display.Color.HexStringToColor(this.color).color;

    // Glow circle at (0,0) since gfx is child of container
    this.gfx.fillStyle(col, 1);
    this.gfx.fillCircle(0, 0, 5);

    // Trail line
    const trailDx = this.prevX - this.x;
    const trailDy = this.prevY - this.y;
    this.gfx.lineStyle(4, col, 0.4);
    this.gfx.beginPath();
    this.gfx.moveTo(0, 0);
    this.gfx.lineTo(trailDx, trailDy);
    this.gfx.strokePath();
  }

  destroy(fromScene?: boolean) {
    this.active = false;
    if (this.gfx) this.gfx.destroy();
    super.destroy(fromScene);
  }
}
