import Phaser from 'phaser';
import { MaskType, getMaskIcon } from '../types';
import { audio } from '../audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { Minion } from './Minion';
import { GameMask } from './Mask';

const HERO_FRAME = 2;
const HERO_SCALE = 0.12;
const RED_TINT = 0xff9999;
const BLUE_TINT = 0x9999ff;

export class Hero extends Phaser.GameObjects.Container {
  public speed = 4.2;
  public currentMask: MaskType | null = null;
  public side: 'Blue' | 'Red';
  public radius = 22;

  private sprite: Phaser.GameObjects.Sprite;
  private labelText: Phaser.GameObjects.Text;
  private maskText: Phaser.GameObjects.Text;
  private auraGfx: Phaser.GameObjects.Graphics;

  public keys: Record<string, boolean> = {};

  constructor(scene: Phaser.Scene, x: number, y: number, side: 'Blue' | 'Red') {
    super(scene, x, y);
    this.side = side;

    // Shadow
    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillEllipse(0, this.radius - 2, this.radius * 1.8, 12);
    this.add(shadow);

    // Character sprite
    this.sprite = scene.add.sprite(0, -8, 'characters', HERO_FRAME);
    this.sprite.setScale(HERO_SCALE);
    this.sprite.setTint(side === 'Red' ? RED_TINT : BLUE_TINT);
    this.add(this.sprite);

    // Label
    this.labelText = scene.add.text(0, 14, side === 'Red' ? 'P1' : 'P2', {
      fontSize: '12px',
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.add(this.labelText);

    // Mask icon (above head)
    this.maskText = scene.add.text(0, -55, '', {
      fontSize: '32px',
      fontFamily: 'serif',
    }).setOrigin(0.5).setVisible(false);
    this.add(this.maskText);

    // Aura for when carrying mask
    this.auraGfx = scene.add.graphics();
    this.add(this.auraGfx);

    this.setDepth(40);
    scene.add.existing(this);
  }

  updateHero(minions: Minion[], masks: GameMask[]) {
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

    // Flip sprite to face movement direction
    if (moveX < 0) this.sprite.setFlipX(true);
    else if (moveX > 0) this.sprite.setFlipX(false);

    let nextX = this.x + moveX;
    let nextY = this.y + moveY;

    // Canvas bounds
    nextX = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, nextX));
    nextY = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, nextY));

    // Hero-minion push-back
    for (const minion of minions) {
      if (!minion.active) continue;
      const dx = nextX - minion.x;
      const dy = nextY - minion.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = this.radius + minion.radius;
      if (dist < minDist) {
        const overlap = minDist - dist;
        const nx = dx / (dist || 0.1);
        const ny = dy / (dist || 0.1);
        nextX += nx * overlap;
        nextY += ny * overlap;
      }
    }

    this.x = nextX;
    this.y = nextY;

    // Mask pickup
    for (const mask of masks) {
      if (mask.active && !this.currentMask) {
        const dx = this.x - mask.x;
        const dy = this.y - mask.y;
        if (Math.sqrt(dx * dx + dy * dy) < this.radius + mask.radius) {
          this.currentMask = mask.type;
          mask.active = false;
          mask.setVisible(false);
          mask.destroy();
          audio.playPickup();
        }
      }
    }

    // Mask delivery
    if (this.currentMask) {
      for (const minion of minions) {
        if (minion.side === this.side && minion.active) {
          const dx = this.x - minion.x;
          const dy = this.y - minion.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.radius + minion.radius) {
            minion.applyMask(this.currentMask);
            this.currentMask = null;
            audio.playPickup();
            break;
          }
        }
      }
    }

    // Update mask display
    this.updateMaskDisplay();
  }

  private updateMaskDisplay() {
    if (this.currentMask) {
      this.maskText.setText(getMaskIcon(this.currentMask));
      this.maskText.setVisible(true);
      this.maskText.y = -55 + Math.sin(Date.now() / 150) * 8;

      this.auraGfx.clear();
      this.auraGfx.lineStyle(1, 0xffffff, 0.3);
      this.auraGfx.strokeCircle(0, 0, this.radius + 10);
    } else {
      this.maskText.setVisible(false);
      this.auraGfx.clear();
    }
  }
}
