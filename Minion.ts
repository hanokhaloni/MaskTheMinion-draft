
import { GameObject, Projectile } from './GameObject';
import { Tower } from './Tower';
import { MinionType, Lane, Position, MaskType } from './types';
import { audio } from './audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class Minion extends GameObject {
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

  constructor(x: number, y: number, side: 'Blue' | 'Red', type: MinionType, lane: Lane) {
    super(x, y, 14, side === 'Blue' ? '#60a5fa' : '#f87171');
    this.side = side;
    this.type = type;
    this.lane = lane;
    this.initStats(type);
    this.initWaypoints();
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
  }

  update(enemies: (Minion | Tower)[], projectiles: Projectile[], addDmg: (side: string, dmg: number) => void) {
    if (this.hp <= 0) {
      if (this.active) {
        this.active = false;
        audio.playDeath();
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

      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      this.x += vx;
      this.y += vy;
    }
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
      projectiles.push(new Projectile(this.x, this.y, target, finalDmg, color, () => {
        target.hp -= finalDmg;
        addDmg(this.side, finalDmg);
      }));
    }
  }
}
