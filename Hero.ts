
import { GameObject } from './GameObject';
import { Minion } from './Minion';
import { Mask } from './Mask';
import { MaskType } from './types';
import { audio } from './audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class Hero extends GameObject {
  public speed = 4.2;
  public currentMask: MaskType | null = null;
  public keys: Record<string, boolean> = {};

  constructor(x: number, y: number, public side: 'Blue' | 'Red') {
    super(x, y, 22, side === 'Blue' ? '#2563eb' : '#dc2626');
  }

  update(minions: Minion[], masks: Mask[]) {
    let moveX = 0;
    let moveY = 0;

    if (this.side === 'Red') {
      if (this.keys['w']) moveY -= this.speed;
      if (this.keys['s']) moveY += this.speed;
      if (this.keys['a']) moveX -= this.speed;
      if (this.keys['d']) moveX += this.speed;
    } else {
      if (this.keys['ArrowUp']) moveY -= this.speed;
      if (this.keys['ArrowDown']) moveY += this.speed;
      if (this.keys['ArrowLeft']) moveX -= this.speed;
      if (this.keys['ArrowRight']) moveX += this.speed;
    }

    let nextX = this.x + moveX;
    let nextY = this.y + moveY;

    // Canvas bounds
    nextX = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, nextX));
    nextY = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, nextY));

    // HERO-MINION COLLISION
    for (const minion of minions) {
      if (!minion.active) continue;
      const dx = nextX - minion.x;
      const dy = nextY - minion.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = this.radius + minion.radius;
      if (dist < minDist) {
        // Push hero back outside the minion radius
        const overlap = minDist - dist;
        const nx = dx / (dist || 0.1);
        const ny = dy / (dist || 0.1);
        nextX += nx * overlap;
        nextY += ny * overlap;
      }
    }

    this.x = nextX;
    this.y = nextY;

    // MASK PICKUP
    masks.forEach(mask => {
      if (mask.active && !this.currentMask) {
        const dx = this.x - mask.x;
        const dy = this.y - mask.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.radius + mask.radius) {
          this.currentMask = mask.type;
          mask.active = false;
          audio.playPickup();
        }
      }
    });

    // MASK DELIVERY
    if (this.currentMask) {
      minions.forEach(minion => {
        if (minion.side === this.side && minion.active) {
          const dx = this.x - minion.x;
          const dy = this.y - minion.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius + minion.radius) {
            minion.applyMask(this.currentMask!);
            this.currentMask = null;
            audio.playPickup();
          }
        }
      });
    }
  }
}
