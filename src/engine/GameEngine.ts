import Phaser from 'phaser';
import { MinionType, MaskType, GameStats, Lane } from '../types';
import { audio } from '../audioService';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { Projectile } from '../objects/Projectile';
import { Hero } from '../objects/Hero';
import { Minion } from '../objects/Minion';
import { Tower } from '../objects/Tower';
import { GameMask } from '../objects/Mask';

export class GameEngine {
  public minions: Minion[] = [];
  public heroes: Hero[] = [];
  public towers: Tower[] = [];
  public masks: GameMask[] = [];
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
    winner: null,
  };
  public gameOver = false;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
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
    if (this.gameOver) return;

    this.matchTime++;
    this.waveTimer--;

    if (this.waveTimer <= 0) {
      this.spawnWave();
      this.scene.sound.play('goWaveGo');
      this.waveTimer = 25 * 60;
    }

    if (this.matchTime % 450 === 0) {
      this.spawnMask();
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update();
      if (!p.active) {
        this.projectiles.splice(i, 1);
      }
    }

    const addDmg = (side: string, dmg: number) => {
      if (side === 'Blue') this.stats.blueDamageDealt += dmg;
      else this.stats.redDamageDealt += dmg;
    };

    // Update minions
    for (const m of this.minions) {
      const enemyMinions = this.minions.filter(e => e.side !== m.side && e.active);
      const enemyTowers = this.towers.filter(t => t.side !== m.side && t.hp > 0);
      m.updateMinion([...enemyMinions, ...enemyTowers], this.projectiles, addDmg);

      const enemyBasePos = m.side === 'Blue'
        ? { x: 80, y: CANVAS_HEIGHT - 80 }
        : { x: CANVAS_WIDTH - 80, y: 80 };
      const distToBase = Math.sqrt((m.x - enemyBasePos.x) ** 2 + (m.y - enemyBasePos.y) ** 2);

      if (m.active && distToBase < 40) {
        if (m.side === 'Blue') {
          this.redBaseHP = Math.max(0, this.redBaseHP - 1);
          this.scene.sound.play('redCastleHit');
        } else {
          this.blueBaseHP = Math.max(0, this.blueBaseHP - 1);
          this.scene.sound.play('blueCastleHit');
        }
        m.hp = 0;
        m.active = false;
        audio.playDeath();
      }
    }

    this.resolveMinionCollisions();

    // Cleanup dead minions after death animation
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (!m.active) {
        m.deathTimer++;
        if (m.deathTimer >= 30) {
          this.minions.splice(i, 1);
          // Container auto-destroys via death tween, but ensure cleanup
          if (m.scene) m.destroy();
        }
      }
    }

    // Towers fire
    for (const t of this.towers) {
      if (t.hp > 0) {
        if (t.cooldown > 0) t.cooldown--;
        if (t.cooldown <= 0) {
          const target = this.minions.find(
            m => m.side !== t.side && m.active &&
              Math.sqrt((m.x - t.x) ** 2 + (m.y - t.y) ** 2) < t.range
          );
          if (target) {
            audio.playArrow();
            const proj = new Projectile(this.scene, t.x, t.y, target, t.damage, '#fde047', () => {
              target.hp -= t.damage;
              addDmg(t.side, t.damage);
            });
            this.projectiles.push(proj);
            t.cooldown = 90;
          }
        }
      }
      t.redraw();
    }

    // Heroes
    for (const h of this.heroes) {
      h.updateHero(this.minions, this.masks);
    }

    // Clean up destroyed masks
    this.masks = this.masks.filter(m => m.active);

    // Win condition
    if (this.blueBaseHP <= 0 || this.redBaseHP <= 0) {
      this.gameOver = true;
      this.stats.winner = this.blueBaseHP <= 0 ? 'Red' : 'Blue';
      this.scene.sound.play(this.stats.winner === 'Blue' ? 'blueWins' : 'redWins');
      this.stats.matchTime = Math.floor(this.matchTime / 60);
      this.scene.scene.stop('HudScene');
      this.scene.scene.start('GameOverScene', { stats: this.stats });
    }
  }

  spawnWave() {
    const lanes = [Lane.TOP, Lane.MID, Lane.BOT];
    lanes.forEach(lane => {
      for (let i = 0; i < 3; i++) {
        this.scene.time.delayedCall(i * 500, () => {
          if (this.gameOver) return;
          const blueMinion = new Minion(this.scene, CANVAS_WIDTH - 80, 80, 'Blue', MinionType.FIGHTER, lane);
          const redMinion = new Minion(this.scene, 80, CANVAS_HEIGHT - 80, 'Red', MinionType.FIGHTER, lane);
          this.minions.push(blueMinion);
          this.minions.push(redMinion);
          this.stats.blueMinionsSpawned++;
          this.stats.redMinionsSpawned++;
        });
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
    this.masks.push(new GameMask(this.scene, x, y, type));
  }
}
