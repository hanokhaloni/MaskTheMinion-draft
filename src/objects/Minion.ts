import Phaser from 'phaser';
import { MinionType, Lane, Position, MaskType, getMinionIcon } from '../types';
import { audio } from '../audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { Projectile, ProjectileTarget } from './Projectile';
import { Tower } from './Tower';

export class Minion extends Phaser.GameObjects.Container {
  public hp = 0;
  public maxHp = 0;
  public damage = 0;
  public range = 0;
  public speed = 0.8;
  public type: MinionType;
  public side: 'Blue' | 'Red';
  public lane: Lane;
  public waypoints: Position[] = [];
  public currentWaypointIndex = 0;
  public active = true;
  public cooldown = 0;
  public hasMask = false;
  public deathTimer = 0;
  public radius = 14;

  private bodyGfx: Phaser.GameObjects.Graphics;
  private hpBarGfx: Phaser.GameObjects.Graphics;
  private iconText: Phaser.GameObjects.Text;
  private dying = false;

  constructor(scene: Phaser.Scene, x: number, y: number, side: 'Blue' | 'Red', type: MinionType, lane: Lane) {
    super(scene, x, y);
    this.side = side;
    this.type = type;
    this.lane = lane;

    this.bodyGfx = scene.add.graphics();
    this.add(this.bodyGfx);

    this.iconText = scene.add.text(0, 0, getMinionIcon(type), {
      fontSize: '18px',
      fontFamily: 'serif',
    }).setOrigin(0.5);
    this.add(this.iconText);

    this.hpBarGfx = scene.add.graphics();
    this.add(this.hpBarGfx);

    this.setDepth(30);
    this.initStats(type);
    this.initWaypoints();
    this.redraw();
    scene.add.existing(this);
  }

  initWaypoints() {
    const redBase = { x: 80, y: CANVAS_HEIGHT - 80 };
    const blueBase = { x: CANVAS_WIDTH - 80, y: 80 };
    const topLeft = { x: 80, y: 80 };
    const botRight = { x: CANVAS_WIDTH - 80, y: CANVAS_HEIGHT - 80 };

    if (this.side === 'Red') {
      if (this.lane === Lane.TOP) this.waypoints = [topLeft, blueBase];
      else if (this.lane === Lane.BOT) this.waypoints = [botRight, blueBase];
      else this.waypoints = [blueBase];
    } else {
      if (this.lane === Lane.TOP) this.waypoints = [topLeft, redBase];
      else if (this.lane === Lane.BOT) this.waypoints = [botRight, redBase];
      else this.waypoints = [redBase];
    }
  }

  initStats(type: MinionType) {
    this.type = type;
    this.iconText?.setText(getMinionIcon(type));
    switch (type) {
      case MinionType.FIGHTER:
        this.hp = this.maxHp = 80;
        this.damage = 15;
        this.range = 45;
        this.speed = 1.0;
        break;
      case MinionType.MAGE:
        this.hp = this.maxHp = 45;
        this.damage = 14;
        this.range = 170;
        this.speed = 0.8;
        break;
      case MinionType.ARCHER:
        this.hp = this.maxHp = 35;
        this.damage = 11;
        this.range = 250;
        this.speed = 0.9;
        break;
    }
  }

  applyMask(mask: MaskType) {
    this.hasMask = true;
    switch (mask) {
      case MaskType.CONVERT_MAGE: this.initStats(MinionType.MAGE); break;
      case MaskType.CONVERT_FIGHTER: this.initStats(MinionType.FIGHTER); break;
      case MaskType.CONVERT_ARCHER: this.initStats(MinionType.ARCHER); break;
      case MaskType.BUFF_HP: this.hp += 60; this.maxHp += 60; break;
      case MaskType.BUFF_DAMAGE: this.damage += 10; break;
      case MaskType.BUFF_SPEED: this.speed *= 1.4; break;
    }
    this.redraw();
  }

  updateMinion(enemies: (Minion | Tower)[], projectiles: Projectile[], addDmg: (side: string, dmg: number) => void) {
    if (this.hp <= 0) {
      if (this.active) {
        this.active = false;
        audio.playDeath();
        this.startDeathAnim();
      }
      return;
    }

    if (this.cooldown > 0) this.cooldown--;

    let target: (Minion | Tower) | null = null;
    let minDist = this.range;

    for (const enemy of enemies) {
      if ('hp' in enemy && enemy.hp > 0) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= minDist) {
          minDist = dist;
          target = enemy;
        }
      }
    }

    if (target) {
      if (this.cooldown <= 0) {
        this.attack(target, projectiles, addDmg);
        this.cooldown = 60;
      }
    } else {
      const wp = this.waypoints[this.currentWaypointIndex];
      const dx = wp.x - this.x;
      const dy = wp.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 20 && this.currentWaypointIndex < this.waypoints.length - 1) {
        this.currentWaypointIndex++;
      }

      if (dist > 0.1) {
        const vx = (dx / dist) * this.speed;
        const vy = (dy / dist) * this.speed;
        this.x += vx;
        this.y += vy;
      }
    }

    this.redraw();
  }

  attack(target: Minion | Tower, projectiles: Projectile[], addDmg: (side: string, dmg: number) => void) {
    let multiplier = 1;
    if (target instanceof Minion) {
      if (this.type === MinionType.FIGHTER && target.type === MinionType.MAGE) multiplier = 2;
      if (this.type === MinionType.MAGE && target.type === MinionType.ARCHER) multiplier = 2;
      if (this.type === MinionType.ARCHER && target.type === MinionType.FIGHTER) multiplier = 2;
    }
    const finalDmg = this.damage * multiplier;

    if (this.type === MinionType.FIGHTER) {
      audio.playSword();
      target.hp -= finalDmg;
      addDmg(this.side, finalDmg);
    } else {
      const color = this.type === MinionType.MAGE ? '#d8b4fe' : '#fef08a';
      if (this.type === MinionType.MAGE) audio.playSpell(); else audio.playArrow();
      projectiles.push(new Projectile(this.scene!, this.x, this.y, target as unknown as ProjectileTarget, finalDmg, color, () => {
        target.hp -= finalDmg;
        addDmg(this.side, finalDmg);
      }));
    }
  }

  private startDeathAnim() {
    if (this.dying) return;
    this.dying = true;
    this.scene?.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  redraw() {
    this.bodyGfx.clear();
    this.hpBarGfx.clear();

    const r = this.radius;
    const bodyColor = this.side === 'Blue' ? 0x60a5fa : 0xf87171;

    // Shadow
    this.bodyGfx.fillStyle(0x000000, 0.3);
    this.bodyGfx.fillEllipse(0, r - 2, r * 1.6, 8);

    // Body circle
    this.bodyGfx.fillStyle(bodyColor, 1);
    this.bodyGfx.fillCircle(0, 0, r);

    // Stroke
    const strokeColor = this.hasMask ? 0xfacc15 : 0xffffff;
    const strokeWidth = this.hasMask ? 3 : 1.5;
    this.bodyGfx.lineStyle(strokeWidth, strokeColor, 1);
    this.bodyGfx.strokeCircle(0, 0, r);

    // HP bar (only if active)
    if (this.active) {
      this.hpBarGfx.fillStyle(0x0f172a, 1);
      this.hpBarGfx.fillRect(-15, -25, 30, 5);
      const hpColor = this.side === 'Blue' ? 0x60a5fa : 0xf87171;
      this.hpBarGfx.fillStyle(hpColor, 1);
      this.hpBarGfx.fillRect(-15, -25, 30 * (this.hp / this.maxHp), 5);
    }
  }
}
