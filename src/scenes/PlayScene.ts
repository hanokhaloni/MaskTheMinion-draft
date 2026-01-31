import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PATH_WIDTH } from '../constants';
import { GameEngine } from '../engine/GameEngine';
import { Hero } from '../objects/Hero';
import { Tower } from '../objects/Tower';

const MIN_ZOOM = 1.0;
const MAX_ZOOM = 2.2;
const PADDING = 250;
const LERP_SPEED = 0.04;

export class PlayScene extends Phaser.Scene {
  private engine!: GameEngine;
  private keyState: Record<string, boolean> = {};

  constructor() {
    super('PlayScene');
  }

  create() {
    this.keyState = {};

    // Draw procedural map background
    this.drawMapBackground();

    // Create engine
    this.engine = new GameEngine(this);

    // Create heroes
    const redHero = new Hero(this, 80, CANVAS_HEIGHT - 80, 'Red');
    const blueHero = new Hero(this, CANVAS_WIDTH - 80, 80, 'Blue');
    this.engine.heroes.push(redHero);
    this.engine.heroes.push(blueHero);

    // Create towers
    // MID LANE
    this.engine.towers.push(new Tower(this, 350, 566, 'Red'));
    this.engine.towers.push(new Tower(this, CANVAS_WIDTH - 350, 233, 'Blue'));
    // TOP LANE
    this.engine.towers.push(new Tower(this, 80, 400, 'Red'));
    this.engine.towers.push(new Tower(this, 400, 80, 'Blue'));
    // BOT LANE
    this.engine.towers.push(new Tower(this, 800, 720, 'Red'));
    this.engine.towers.push(new Tower(this, 1120, 400, 'Blue'));

    // Input handling
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.keyState[event.key] = true;
      this.syncKeys();
    });
    this.input.keyboard!.on('keyup', (event: KeyboardEvent) => {
      this.keyState[event.key] = false;
      this.syncKeys();
    });

    // Set camera world bounds so camera won't scroll outside the game world when zoomed in
    this.cameras.main.setBounds(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Launch HUD overlay scene
    this.scene.launch('HudScene', { engine: this.engine });
  }

  private syncKeys() {
    for (const h of this.engine.heroes) {
      h.keys = { ...this.keyState };
    }
  }

  update() {
    if (this.engine) {
      this.engine.update();

      // Dynamic camera zoom based on hero distance
      const heroes = this.engine.heroes;
      if (heroes.length >= 2) {
        const h1 = heroes[0];
        const h2 = heroes[1];

        // Midpoint between heroes
        const midX = (h1.x + h2.x) / 2;
        const midY = (h1.y + h2.y) / 2;

        // Compute required zoom to keep both heroes visible with padding
        const dx = Math.abs(h1.x - h2.x) + PADDING;
        const dy = Math.abs(h1.y - h2.y) + PADDING;
        const zoomX = CANVAS_WIDTH / dx;
        const zoomY = CANVAS_HEIGHT / dy;
        const targetZoom = Phaser.Math.Clamp(Math.min(zoomX, zoomY), MIN_ZOOM, MAX_ZOOM);

        // Smooth lerp zoom and position
        const cam = this.cameras.main;
        cam.zoom += (targetZoom - cam.zoom) * LERP_SPEED;
        cam.centerOn(
          cam.scrollX + CANVAS_WIDTH / 2 + (midX - (cam.scrollX + CANVAS_WIDTH / 2)) * LERP_SPEED,
          cam.scrollY + CANVAS_HEIGHT / 2 + (midY - (cam.scrollY + CANVAS_HEIGHT / 2)) * LERP_SPEED,
        );
      }
    }
  }

  private drawMapBackground() {
    const gfx = this.add.graphics();
    gfx.setDepth(0);

    // Background gradient (radial via two fills)
    gfx.fillStyle(0x020617, 1);
    gfx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Lighter center
    gfx.fillStyle(0x0f172a, 0.6);
    gfx.fillCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 500);

    // Lane paths
    const redBase = [80, CANVAS_HEIGHT - 80];
    const blueBase = [CANVAS_WIDTH - 80, 80];
    const topLeft = [80, 80];
    const botRight = [CANVAS_WIDTH - 80, CANVAS_HEIGHT - 80];

    gfx.lineStyle(PATH_WIDTH, 0x1e293b, 1);

    // TOP LANE
    gfx.beginPath();
    gfx.moveTo(redBase[0], redBase[1]);
    gfx.lineTo(topLeft[0], topLeft[1]);
    gfx.lineTo(blueBase[0], blueBase[1]);
    gfx.strokePath();

    // MID LANE
    gfx.beginPath();
    gfx.moveTo(redBase[0], redBase[1]);
    gfx.lineTo(blueBase[0], blueBase[1]);
    gfx.strokePath();

    // BOT LANE
    gfx.beginPath();
    gfx.moveTo(redBase[0], redBase[1]);
    gfx.lineTo(botRight[0], botRight[1]);
    gfx.lineTo(blueBase[0], blueBase[1]);
    gfx.strokePath();

    // Dashed lane center lines
    const dashGfx = this.add.graphics();
    dashGfx.setDepth(0);
    dashGfx.lineStyle(2, 0xffffff, 0.05);

    // Draw dashes manually (Phaser Graphics doesn't have setLineDash)
    this.drawDashedLine(dashGfx, redBase[0], redBase[1], topLeft[0], topLeft[1]);
    this.drawDashedLine(dashGfx, topLeft[0], topLeft[1], blueBase[0], blueBase[1]);
    this.drawDashedLine(dashGfx, redBase[0], redBase[1], blueBase[0], blueBase[1]);
    this.drawDashedLine(dashGfx, redBase[0], redBase[1], botRight[0], botRight[1]);
    this.drawDashedLine(dashGfx, botRight[0], botRight[1], blueBase[0], blueBase[1]);

    // Bases
    // Red base
    gfx.fillStyle(0xdc2626, 0.2);
    gfx.fillCircle(redBase[0], redBase[1], 120);
    gfx.lineStyle(4, 0xdc2626, 1);
    gfx.strokeCircle(redBase[0], redBase[1], 120);

    // Blue base
    gfx.fillStyle(0x2563eb, 0.2);
    gfx.fillCircle(blueBase[0], blueBase[1], 120);
    gfx.lineStyle(4, 0x2563eb, 1);
    gfx.strokeCircle(blueBase[0], blueBase[1], 120);
  }

  private drawDashedLine(gfx: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dashLen = 10;
    const gapLen = 20;
    const stepLen = dashLen + gapLen;
    const steps = Math.floor(dist / stepLen);
    const nx = dx / dist;
    const ny = dy / dist;

    for (let i = 0; i < steps; i++) {
      const sx = x1 + nx * i * stepLen;
      const sy = y1 + ny * i * stepLen;
      const ex = sx + nx * dashLen;
      const ey = sy + ny * dashLen;
      gfx.beginPath();
      gfx.moveTo(sx, sy);
      gfx.lineTo(ex, ey);
      gfx.strokePath();
    }
  }
}
