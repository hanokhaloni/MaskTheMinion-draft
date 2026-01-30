
export class GameObject {
  constructor(public x: number, public y: number, public radius: number, public color: string) {}
}

export interface ProjectileTarget {
  x: number;
  y: number;
  hp: number;
}

export class Projectile extends GameObject {
  public active = true;
  public speed = 8;
  constructor(
    x: number, 
    y: number, 
    public target: ProjectileTarget, 
    public damage: number, 
    color: string, 
    public onHit: () => void
  ) {
    super(x, y, 4, color);
  }
  update() {
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) {
      this.onHit();
      this.active = false;
      return;
    }
    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
  }
}
