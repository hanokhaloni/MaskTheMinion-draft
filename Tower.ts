
import { GameObject } from './GameObject';

export class Tower extends GameObject {
  public hp = 180;
  public maxHp = 180;
  public damage = 10;
  public range = 180;
  public cooldown = 0;
  public side: 'Blue' | 'Red';

  constructor(x: number, y: number, side: 'Blue' | 'Red') {
    super(x, y, 30, side === 'Blue' ? '#1e40af' : '#991b1b');
    this.side = side;
  }
}
