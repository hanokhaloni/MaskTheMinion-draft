# Mask the Minion

A local 2-player MOBA-style arena game built with **Phaser 3** and **TypeScript**. Two heroes battle across three lanes, collecting magical masks to transform and buff their minion waves while defending their castle from destruction.

## Table of Contents

- [Gameplay](#gameplay)
- [Controls](#controls)
- [Game Mechanics](#game-mechanics)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Build & Deploy](#build--deploy)
- [Architecture](#architecture)
- [Audio System](#audio-system)
- [Scene Flow](#scene-flow)

## Gameplay

Red team (P1) spawns bottom-left, Blue team (P2) spawns top-right. Minion waves auto-spawn every 25 seconds across three lanes (Top, Mid, Bot). Each castle starts with **3 HP** — when an enemy minion reaches your base, you lose a heart. First team to destroy the enemy castle wins.

Heroes don't fight directly. Instead, they collect **masks** that spawn randomly on the map and deliver them to friendly minions. Masks either convert minions to a new class or grant stat buffs, turning the tide of battle.

## Controls

| Action    | P1 (Red Team) | P2 (Blue Team) |
|-----------|---------------|-----------------|
| Move Up   | `W`           | `Arrow Up`      |
| Move Down | `S`           | `Arrow Down`    |
| Move Left | `A`           | `Arrow Left`    |
| Move Right| `D`           | `Arrow Right`   |

## Game Mechanics

### Minion Types

Minions follow a rock-paper-scissors combat triangle with **2x damage** on advantage matchups:

| Type    | Beats   | Attack Style     |
|---------|---------|------------------|
| Fighter | Mage    | Melee (sword)    |
| Mage    | Archer  | Ranged (spell)   |
| Archer  | Fighter | Ranged (arrow)   |

### Mask Types

| Mask         | Effect                        |
|--------------|-------------------------------|
| The Brawler  | Converts minion to Fighter    |
| The Arcane   | Converts minion to Mage       |
| The Sniper   | Converts minion to Archer     |
| The Vitality | Grants +60 Max HP             |
| The Rage     | Grants +10 Damage             |
| The Haste    | Grants 1.4x Movement Speed    |

### Towers

Each team has **3 towers** (one per lane). Towers auto-target the nearest enemy minion within range and fire projectiles on a 90-frame cooldown. Towers have 180 HP and cycle through healthy, damaged, and destroyed visual states.

### Dynamic Camera

The camera tracks the midpoint between both heroes and zooms dynamically based on their distance apart (1.0x–2.2x), keeping both players visible at all times.

## Tech Stack

| Technology   | Version | Purpose                       |
|--------------|---------|-------------------------------|
| Phaser       | 3.80.0  | Game framework & rendering    |
| TypeScript   | 5.8.x   | Type-safe game logic          |
| Vite         | 6.2.x   | Dev server & bundler          |
| Web Audio API| —       | Synthesized combat SFX        |
| WebGL        | —       | Shader-based intro background |

## Project Structure

```
src/
├── main.ts                  # Phaser game config, scene registration, bootstrap
├── constants.ts             # Canvas dimensions (1200x800)
├── types.ts                 # Enums (MinionType, MaskType, Lane) & interfaces (GameStats)
├── audioService.ts          # Web Audio API synthesizer (sword, spell, arrow, death, pickup, ding)
│
├── engine/
│   └── GameEngine.ts        # Core game loop: wave spawning, combat, win conditions
│
├── scenes/
│   ├── BootScene.ts         # Asset preloading (spritesheets, images, audio)
│   ├── IntroScene.ts        # Title screen, mask showcase, start button
│   ├── PlayScene.ts         # Main gameplay, input handling, dynamic camera
│   ├── HudScene.ts          # Overlay UI: HP hearts, timer, wave countdown
│   └── GameOverScene.ts     # Victory screen, animated stats, silly statistics
│
├── objects/
│   ├── Hero.ts              # Player-controlled hero with mask pickup/delivery
│   ├── Minion.ts            # AI minion with lane pathing, combat, type conversions
│   ├── Tower.ts             # Auto-targeting tower with HP states and destruction FX
│   ├── Projectile.ts        # Homing projectile for towers and ranged minions
│   └── Mask.ts              # Collectible power-up with floating animation and aura
│
├── shaders/
│   └── cloudShader.ts       # GLSL cloud shader for the intro scene background
│
├── fonts/
│   └── LifeCraft_Font.ttf   # LifeCraft display font (all in-game text)
│
├── sounds/                  # MP3 voice lines and effects (10 files)
│
└── images/                  # PNG sprites: characters, towers, castles, background
```

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone the repository
git clone <repo-url>
cd MaskTheMinion-draft

# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

## Build & Deploy

```bash
# Production build (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview
```

The build output in `dist/` is a static site that can be deployed to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.).

## Architecture

### Game Loop

`GameEngine.ts` runs the core simulation every frame via the Phaser `update()` cycle:

1. **Wave Timer** — Decrements each frame; spawns 3 minions per lane (6 total) for each team when it hits zero, then resets to 25 seconds.
2. **Projectile Update** — Moves all active projectiles toward their targets and removes expired ones.
3. **Minion AI** — Each minion acquires the nearest enemy (minion or tower) in range and attacks, or follows lane waypoints toward the enemy base.
4. **Collision Resolution** — Pushes overlapping minions apart to prevent stacking.
5. **Base Damage** — Any minion reaching the enemy base corner deals 1 HP damage to the castle and is destroyed.
6. **Tower Combat** — Each tower scans for the nearest enemy minion in range and fires a homing projectile.
7. **Hero Update** — Processes keyboard input, resolves hero-minion collisions, handles mask pickup and delivery.
8. **Win Check** — If either castle reaches 0 HP, triggers camera shake and transitions to GameOverScene.

### Rendering Pipeline

- **Phaser.AUTO** renderer (prefers WebGL, falls back to Canvas)
- Game objects use `Phaser.GameObjects.Container` for grouped transforms (sprite + shadow + labels)
- Depth sorting: Background (0) → Masks (10) → Towers (20) → Minions (30) → Heroes (40) → Confetti (50)
- HudScene runs as a parallel overlay scene on top of PlayScene

### Phaser Configuration

| Setting         | Value                          |
|-----------------|--------------------------------|
| Resolution      | 1200 x 800                     |
| Scale Mode      | `Phaser.Scale.FIT`             |
| Auto Center     | `Phaser.Scale.CENTER_BOTH`     |
| Background      | `#020617`                      |
| Renderer        | `Phaser.AUTO` (WebGL preferred)|

## Audio System

The game uses a dual audio approach:

**Synthesized SFX** (`audioService.ts`) — Real-time Web Audio API oscillators for combat sounds. Zero loading time, no file overhead:
- `playSword()` — Sawtooth wave downsweep for melee attacks
- `playSpell()` — Sine wave upsweep for mage attacks
- `playArrow()` — Filtered noise burst for ranged attacks
- `playDeath()` — Square wave downsweep for minion/castle hits
- `playPickup()` — Triangle wave chirp for mask interactions
- `playDing()` — High sine ping for stat counter animations

**MP3 Voice Lines** — Loaded via Phaser's audio loader in BootScene, triggered by game events:
- Castle hit announcements (per team)
- Tower destruction callouts (per team)
- Wave spawn announcement
- Victory declarations (per team)
- Battle start announcement
- Statistics screen narration

## Scene Flow

```
BootScene ──▶ IntroScene ──▶ PlayScene + HudScene ──▶ GameOverScene
   │              │                                        │
   │         [BATTLE START]                          [RE-ENTER ARENA]
   │              │                                        │
   ▼              ▼                                        ▼
 Preload      Fade + sound                           Back to IntroScene
 assets       transition
```

1. **BootScene** — Loads all spritesheets, images, and audio assets, then immediately transitions.
2. **IntroScene** — Animated title, team instructions, mask showcase in two rows, and a start button that triggers the battle announcement.
3. **PlayScene** — Spawns the game engine, heroes, towers, and background. Launches HudScene as a parallel overlay. Handles all input and the dynamic camera.
4. **HudScene** — Renders HP hearts, match timer, and wave countdown. Centered top-bar layout. Runs independently and reads from GameEngine state.
5. **GameOverScene** — 2-second camera shake on win, then displays animated stats with casino-style count-up dings, confetti bursts, silly randomized statistics, and looping narration after 10 seconds.
