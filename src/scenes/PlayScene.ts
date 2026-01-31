import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
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
    const blueHero = new Hero(this, CANVAS_WIDTH - 90, 160, 'Blue');
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

    // Fade in + zoom from close-up
    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.cameras.main.zoom = 3.0;

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
    const bg = this.add.image(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'background');
    bg.setDisplaySize(CANVAS_WIDTH, CANVAS_HEIGHT);
    bg.setDepth(0);

    // Bases
    const redBase = [80, CANVAS_HEIGHT - 80];
    const blueBase = [CANVAS_WIDTH - 80, 80];

    // Red base castle
    const redCastle = this.add.image(redBase[0], redBase[1], 'redCastle');
    redCastle.setDisplaySize(240, 240);
    redCastle.setDepth(0);

    // Blue base castle
    const blueCastle = this.add.image(blueBase[0], blueBase[1], 'blueCastle');
    blueCastle.setDisplaySize(240, 240);
    blueCastle.setDepth(0);
  }
}
