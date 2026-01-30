
import { MinionType, MaskType, Position, GameStats } from './types';
import { audio } from './audioService';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
export const PATH_WIDTH = 220; // Original lane width for minions
export const HERO_MOVE_WIDTH = 850; // Larger roaming area for heroes and masks

class GameObject {
  constructor(public x: number, public y: number, public radius: number, public color: string) {}
}

export class Projectile extends GameObject {
  public active = true;
  public speed = 8;
  constructor(x: number, y: number, public target: Minion | Tower, public damage: number, color: string, public onHit: () => void) {
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

export class Mask extends GameObject {
  public active = true;
  constructor(x: number, y: number, public type: MaskType) {
    super(x, y, 12, '#ffffff');
  }
}

export class Tower extends GameObject {
  public hp = 180;
  public maxHp = 180;
  public damage = 8;
  public range = 180;
  public cooldown = 0;
  public side: 'Blue' | 'Red';

  constructor(x: number, y: number, side: 'Blue' | 'Red') {
    super(x, y, 30, side === 'Blue' ? '#1e40af' : '#991b1b');
    this.side = side;
  }
}

export class Hero extends GameObject {
  // Movement speed reduced by 30% from 5.5 to 3.85
  public speed = 3.5;
  public currentMask: MaskType | null = null;
  public keys: Record<string, boolean> = {};

  constructor(x: number, y: number, public side: 'Blue' | 'Red') {
    super(x, y, 22, side === 'Blue' ? '#2563eb' : '#dc2626');
  }

  update(minions: Minion[], masks: Mask[], walls: { x1: number; y1: number; x2: number; y2: number }[]) {
    let nextX = this.x;
    let nextY = this.y;

    if (this.side === 'Red') {
      if (this.keys['w']) nextY -= this.speed;
      if (this.keys['s']) nextY += this.speed;
      if (this.keys['a']) nextX -= this.speed;
      if (this.keys['d']) nextX += this.speed;
    } else {
      if (this.keys['ArrowUp']) nextY -= this.speed;
      if (this.keys['ArrowDown']) nextY += this.speed;
      if (this.keys['ArrowLeft']) nextX -= this.speed;
      if (this.keys['ArrowRight']) nextX += this.speed;
    }

    nextX = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, nextX));
    nextY = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, nextY));

    // Heroes use the larger HERO_MOVE_WIDTH
    if (isPointInDiagonalPath(nextX, nextY, HERO_MOVE_WIDTH)) {
        this.x = nextX;
        this.y = nextY;
    }

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

export class Minion extends GameObject {
  public hp = 0;
  public maxHp = 0;
  public damage = 0;
  public range = 0;
  public speed = 0.8;
  public type: MinionType;
  public side: 'Blue' | 'Red';
  public targetPos: Position;
  public active = true;
  public cooldown = 0;
  public hasMask = false;
  public deathTimer = 0;

  constructor(x: number, y: number, side: 'Blue' | 'Red', type: MinionType) {
    super(x, y, 14, side === 'Blue' ? '#60a5fa' : '#f87171');
    this.side = side;
    this.type = type;
    this.targetPos = side === 'Blue' ? { x: 50, y: 750 } : { x: 1150, y: 50 };
    this.initStats(type);
  }

  initStats(type: MinionType) {
    this.type = type;
    switch (type) {
      case MinionType.FIGHTER:
        this.hp = this.maxHp = 70;
        this.damage = 14;
        this.range = 45;
        this.speed = 0.91; // 1.3 * 0.7
        break;
      case MinionType.MAGE:
        this.hp = this.maxHp = 40;
        this.damage = 12;
        this.range = 160;
        this.speed = 0.77; // 1.1 * 0.7
        break;
      case MinionType.ARCHER:
        this.hp = this.maxHp = 30;
        this.damage = 9;
        this.range = 260;
        this.speed = 0.84; // 1.2 * 0.7
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
      case MaskType.BUFF_DAMAGE: this.damage += 8; break;
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
      const dx = this.targetPos.x - this.x;
      const dy = this.targetPos.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      
      let nextX = this.x + vx;
      let nextY = this.y + vy;

      // Minions remain restricted to the original PATH_WIDTH
      if (isPointInDiagonalPath(nextX, nextY, PATH_WIDTH)) {
        this.x = nextX;
        this.y = nextY;
      } else {
        const pathCenter = getPathCenterAt(nextY);
        if (nextX < pathCenter - PATH_WIDTH / 2) this.x += 1;
        if (nextX > pathCenter + PATH_WIDTH / 2) this.x -= 1;
        this.y = nextY;
      }
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

export function isPointInDiagonalPath(x: number, y: number, width: number = PATH_WIDTH): boolean {
  const pathCenter = getPathCenterAt(y);
  return x >= pathCenter - width / 2 && x <= pathCenter + width / 2;
}

function getPathCenterAt(y: number): number {
  return 1200 * (1 - y / 800);
}

export class GameEngine {
  public minions: Minion[] = [];
  public heroes: Hero[] = [];
  public towers: Tower[] = [];
  public masks: Mask[] = [];
  public projectiles: Projectile[] = [];
  public blueBaseHP = 3;
  public redBaseHP = 3;
  public matchTime = 0;
  public waveTimer = 300;
  public stats: GameStats = {
    blueDamageDealt: 0,
    redDamageDealt: 0,
    blueMinionsSpawned: 0,
    redMinionsSpawned: 0,
    matchTime: 0,
    winner: null
  };
  private onGameOver: (stats: GameStats) => void;

  constructor(onGameOver: (stats: GameStats) => void) {
    this.onGameOver = onGameOver;
    this.heroes.push(new Hero(80, CANVAS_HEIGHT - 80, 'Red'));
    this.heroes.push(new Hero(CANVAS_WIDTH - 80, 80, 'Blue'));
    
    this.towers.push(new Tower(350, 566, 'Red'));
    this.towers.push(new Tower(500, 466, 'Red'));
    this.towers.push(new Tower(CANVAS_WIDTH - 350, 233, 'Blue'));
    this.towers.push(new Tower(CANVAS_WIDTH - 500, 333, 'Blue'));

    window.addEventListener('keydown', (e) => this.handleKey(e.key, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.key, false));
  }

  handleKey(key: string, pressed: boolean) {
    this.heroes.forEach(h => h.keys[key] = pressed);
  }

  resolveMinionCollisions() {
    // Basic separation logic to prevent overlapping
    for (let i = 0; i < this.minions.length; i++) {
      for (let j = i + 1; j < this.minions.length; j++) {
        const m1 = this.minions[i];
        const m2 = this.minions[j];
        if (!m1.active || !m2.active) continue;

        const dx = m2.x - m1.x;
        const dy = m2.y - m1.y;
        const distSq = dx * dx + dy * dy;
        const minDist = m1.radius + m2.radius;
        const minDistSq = minDist * minDist;

        if (distSq < minDistSq) {
          const dist = Math.sqrt(distSq) || 0.1;
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          
          // Push both away from each other
          const pushX = nx * overlap * 0.5;
          const pushY = ny * overlap * 0.5;
          
          m1.x -= pushX;
          m1.y -= pushY;
          m2.x += pushX;
          m2.y += pushY;

          // Re-clamp to path to prevent push-out (Minions stay in narrow lane)
          if (!isPointInDiagonalPath(m1.x, m1.y, PATH_WIDTH)) {
             const center = getPathCenterAt(m1.y);
             m1.x = Math.max(center - PATH_WIDTH/2, Math.min(center + PATH_WIDTH/2, m1.x));
          }
          if (!isPointInDiagonalPath(m2.x, m2.y, PATH_WIDTH)) {
             const center = getPathCenterAt(m2.y);
             m2.x = Math.max(center - PATH_WIDTH/2, Math.min(center + PATH_WIDTH/2, m2.x));
          }
        }
      }
    }
  }

  update() {
    this.matchTime++;
    this.waveTimer--;

    if (this.waveTimer <= 0) {
      this.spawnWave();
      this.waveTimer = 25 * 60;
    }

    if (this.matchTime % 400 === 0) {
      this.spawnMask();
    }

    this.projectiles.forEach(p => p.update());
    this.projectiles = this.projectiles.filter(p => p.active);

    const addDmg = (side: string, dmg: number) => {
      if (side === 'Blue') this.stats.blueDamageDealt += dmg;
      else this.stats.redDamageDealt += dmg;
    };

    this.minions.forEach(m => {
      const enemyMinions = this.minions.filter(e => e.side !== m.side && e.active);
      const enemyTowers = this.towers.filter(t => t.side !== m.side && t.hp > 0);
      m.update([...enemyMinions, ...enemyTowers], this.projectiles, addDmg);
      
      const enemyBasePos = m.side === 'Blue' ? { x: 80, y: CANVAS_HEIGHT - 80 } : { x: CANVAS_WIDTH - 80, y: 80 };
      const distToBase = Math.sqrt((m.x - enemyBasePos.x) ** 2 + (m.y - enemyBasePos.y) ** 2);
      
      if (m.active && distToBase < 40) {
        if (m.side === 'Blue') {
          this.redBaseHP = Math.max(0, this.redBaseHP - 1);
        } else {
          this.blueBaseHP = Math.max(0, this.blueBaseHP - 1);
        }
        m.hp = 0;
        m.active = false;
        audio.playDeath();
      }
    });

    // Resolve minion overlaps
    this.resolveMinionCollisions();

    this.minions = this.minions.filter(m => m.active || m.deathTimer < 30);
    this.minions.forEach(m => { if(!m.active) m.deathTimer++ });

    this.towers.forEach(t => {
      if (t.hp <= 0) return;
      if (t.cooldown > 0) t.cooldown--;
      if (t.cooldown <= 0) {
        const target = this.minions.find(m => m.side !== t.side && m.active && Math.sqrt((m.x - t.x)**2 + (m.y - t.y)**2) < t.range);
        if (target) {
          audio.playArrow();
          this.projectiles.push(new Projectile(t.x, t.y, target, t.damage, '#fde047', () => {
             target.hp -= t.damage;
             addDmg(t.side, t.damage);
          }));
          t.cooldown = 90;
        }
      }
    });

    this.heroes.forEach(h => h.update(this.minions, this.masks, []));

    if (this.blueBaseHP <= 0 || this.redBaseHP <= 0) {
      this.stats.winner = this.blueBaseHP <= 0 ? 'Red' : 'Blue';
      this.stats.matchTime = Math.floor(this.matchTime / 60);
      this.onGameOver(this.stats);
    }
  }

  spawnWave() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.minions.push(new Minion(CANVAS_WIDTH - 80, 80, 'Blue', MinionType.FIGHTER));
        this.minions.push(new Minion(80, CANVAS_HEIGHT - 80, 'Red', MinionType.FIGHTER));
        this.stats.blueMinionsSpawned++;
        this.stats.redMinionsSpawned++;
      }, i * 500);
    }
  }

  spawnMask() {
    const allMasks = Object.values(MaskType);
    
    // Create a weighted pool to make Brawler (CONVERT_FIGHTER) rarer.
    // Weighted 1:10 compared to other masks.
    const weightedPool: MaskType[] = [];
    allMasks.forEach(m => {
      const weight = m === MaskType.CONVERT_FIGHTER ? 1 : 10;
      for (let i = 0; i < weight; i++) {
        weightedPool.push(m);
      }
    });

    const type = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    let x, y;
    let attempts = 0;
    do {
      x = 100 + Math.random() * (CANVAS_WIDTH - 200);
      y = 100 + Math.random() * (CANVAS_HEIGHT - 200);
      attempts++;
    } while (!isPointInDiagonalPath(x, y, HERO_MOVE_WIDTH) && attempts < 50);
    this.masks.push(new Mask(x, y, type));
  }
}
