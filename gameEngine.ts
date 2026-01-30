
import { MinionType, MaskType, GameStats, Lane } from './types';
import { audio } from './audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Projectile } from './GameObject';
import { Hero } from './Hero';
import { Minion } from './Minion';
import { Tower } from './Tower';
import { Mask } from './Mask';

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
    
    // MID LANE TOWERS
    this.towers.push(new Tower(350, 566, 'Red'));
    this.towers.push(new Tower(CANVAS_WIDTH - 350, 233, 'Blue'));

    // TOP LANE TOWERS
    this.towers.push(new Tower(80, 400, 'Red'));
    this.towers.push(new Tower(400, 80, 'Blue'));

    // BOT LANE TOWERS
    this.towers.push(new Tower(800, 720, 'Red'));
    this.towers.push(new Tower(1120, 400, 'Blue'));

    window.addEventListener('keydown', (e) => this.handleKey(e.key, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.key, false));
  }

  handleKey(key: string, pressed: boolean) {
    this.heroes.forEach(h => h.keys[key] = pressed);
  }

  resolveMinionCollisions() {
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
          
          const pushX = nx * overlap * 0.5;
          const pushY = ny * overlap * 0.5;
          
          m1.x -= pushX;
          m1.y -= pushY;
          m2.x += pushX;
          m2.y += pushY;
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

    if (this.matchTime % 450 === 0) {
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

    this.heroes.forEach(h => h.update(this.minions, this.masks));

    if (this.blueBaseHP <= 0 || this.redBaseHP <= 0) {
      this.stats.winner = this.blueBaseHP <= 0 ? 'Red' : 'Blue';
      this.stats.matchTime = Math.floor(this.matchTime / 60);
      this.onGameOver(this.stats);
    }
  }

  spawnWave() {
    const lanes = [Lane.TOP, Lane.MID, Lane.BOT];
    lanes.forEach(lane => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.minions.push(new Minion(CANVAS_WIDTH - 80, 80, 'Blue', MinionType.FIGHTER, lane));
          this.minions.push(new Minion(80, CANVAS_HEIGHT - 80, 'Red', MinionType.FIGHTER, lane));
          this.stats.blueMinionsSpawned++;
          this.stats.redMinionsSpawned++;
        }, i * 500);
      }
    });
  }

  spawnMask() {
    const allMasks = Object.values(MaskType);
    const weightedPool: MaskType[] = [];
    allMasks.forEach(m => {
      const weight = m === MaskType.CONVERT_FIGHTER ? 2 : 10;
      for (let i = 0; i < weight; i++) weightedPool.push(m);
    });

    const type = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const x = 150 + Math.random() * (CANVAS_WIDTH - 300);
    const y = 150 + Math.random() * (CANVAS_HEIGHT - 300);
    this.masks.push(new Mask(x, y, type));
  }
}
