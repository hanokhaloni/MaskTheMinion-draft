
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameScene, GameStats, MaskType, getMaskIcon, getMinionIcon } from './types';
import { GameEngine, CANVAS_WIDTH, CANVAS_HEIGHT, PATH_WIDTH } from './gameEngine';

const App: React.FC = () => {
  const [scene, setScene] = useState<GameScene>(GameScene.INTRO);
  const [stats, setStats] = useState<GameStats | null>(null);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {scene === GameScene.INTRO && (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 drop-shadow-lg">
            MASK THE MINION
          </h1>
          <p className="text-xl text-slate-300 font-medium tracking-widest uppercase">
            Heroes of the MOBA League of Masks
          </p>
          <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-700 max-w-2xl text-left text-slate-400 text-sm grid grid-cols-2 gap-4 shadow-2xl">
             <div>
               <h3 className="font-bold text-red-500 mb-2">P1 - Red Team (WASD)</h3>
               <p>Starts at Bottom-Left. Move your hero and collect masks. Deliver them to your minions to power them up!</p>
             </div>
             <div>
               <h3 className="font-bold text-blue-500 mb-2">P2 - Blue Team (ARROWS)</h3>
               <p>Starts at Top-Right. Defend your base! If enemy minions reach your corner, you lose a life heart.</p>
             </div>
             <div className="col-span-2 pt-4 border-t border-slate-700 mt-2">
                <p className="text-center font-semibold italic text-slate-300">"Collect masks 🎭 to transform minions! Fighter ⚔️, Mage 🔮, or Archer 🏹."</p>
             </div>
          </div>
          <button 
            onClick={() => setScene(GameScene.GAME)}
            className="px-10 py-4 bg-white text-slate-900 font-bold text-2xl rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            START BATTLE
          </button>
        </div>
      )}

      {scene === GameScene.GAME && (
        <GameView onGameOver={(res) => { setStats(res); setScene(GameScene.GAMEOVER); }} />
      )}

      {scene === GameScene.GAMEOVER && stats && (
        <div className="text-center space-y-8 p-12 bg-slate-800/90 backdrop-blur-xl rounded-3xl border-4 border-slate-700 animate-in slide-in-from-bottom duration-700 shadow-2xl">
          <h2 className="text-5xl font-black mb-4">
            VICTORY FOR <span className={stats.winner === 'Blue' ? 'text-blue-500' : 'text-red-500'}>{stats.winner?.toUpperCase()}</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-4 bg-slate-900 rounded-xl border border-red-500/30">
               <h4 className="text-red-400 font-bold mb-2">RED TEAM (P1)</h4>
               <p>Damage Dealt: {Math.floor(stats.redDamageDealt)}</p>
               <p>Minions Spawned: {stats.redMinionsSpawned}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-blue-500/30">
               <h4 className="text-blue-400 font-bold mb-2">BLUE TEAM (P2)</h4>
               <p>Damage Dealt: {Math.floor(stats.blueDamageDealt)}</p>
               <p>Minions Spawned: {stats.blueMinionsSpawned}</p>
            </div>
          </div>

          <div className="text-slate-400 text-lg">
            Match Duration: {Math.floor(stats.matchTime / 60)}m {stats.matchTime % 60}s
          </div>

          <button 
            onClick={() => setScene(GameScene.GAME)}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

interface GameViewProps {
  onGameOver: (stats: GameStats) => void;
}

const GameView: React.FC<GameViewProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  
  const [uiState, setUiState] = useState({
    blueHP: 3,
    redHP: 3,
    time: 0,
    wave: 30
  });

  // Procedurally generate the map background once
  const generateMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Dark Wilderness Background
    const bgGradient = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Add some "Nature" texture (Subtle circles)
    ctx.fillStyle = 'rgba(22, 101, 52, 0.1)';
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 50 + Math.random() * 100, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Draw the Path (Diagonal)
    // We'll draw several layers for a rich look
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = PATH_WIDTH + 10;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.stroke();

    // Inner stone path
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = PATH_WIDTH - 4;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.stroke();

    // Stone Texture/Cracks on path
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 200; i++) {
        const py = Math.random() * CANVAS_HEIGHT;
        const px = 1200 * (1 - py / 800) + (Math.random() - 0.5) * PATH_WIDTH;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (Math.random() - 0.5) * 20, py + (Math.random() - 0.5) * 20);
        ctx.stroke();
    }

    // Path Borders (Glowing Runes effect)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([10, 20]);
    ctx.lineWidth = 2;
    // Left border
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - PATH_WIDTH/2, -PATH_WIDTH/2);
    ctx.lineTo(-PATH_WIDTH/2, CANVAS_HEIGHT + PATH_WIDTH/2);
    ctx.stroke();
    // Right border
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH + PATH_WIDTH/2, PATH_WIDTH/2);
    ctx.lineTo(PATH_WIDTH/2, CANVAS_HEIGHT - PATH_WIDTH/2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Bases
    // Red Base (Bottom Left)
    const redBaseX = 80;
    const redBaseY = CANVAS_HEIGHT - 80;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
    ctx.beginPath();
    ctx.arc(redBaseX, redBaseY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Blue Base (Top Right)
    const blueBaseX = CANVAS_WIDTH - 80;
    const blueBaseY = 80;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.beginPath();
    ctx.arc(blueBaseX, blueBaseY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 5. Grid Overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    return canvas;
  };

  useEffect(() => {
    // Generate the procedural map once
    offscreenCanvasRef.current = generateMap();

    const engine = new GameEngine(onGameOver);
    engineRef.current = engine;

    const animate = () => {
      if (!engineRef.current) return;
      engineRef.current.update();
      draw();
      setUiState({
        blueHP: engineRef.current.blueBaseHP,
        redHP: engineRef.current.redBaseHP,
        time: Math.floor(engineRef.current.matchTime / 60),
        wave: Math.max(0, Math.ceil(engineRef.current.waveTimer / 60))
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !engineRef.current) return;
      const engine = engineRef.current;

      // 1. Draw Map Background from offscreen canvas
      if (offscreenCanvasRef.current) {
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
      }

      // 2. Draw Game Objects
      // Draw Masks
      engine.masks.forEach(m => {
        if (!m.active) return;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(m.x, m.y + 10, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const floatY = m.y + Math.sin(Date.now() / 200) * 5;
        ctx.fillText(getMaskIcon(m.type), m.x, floatY);
        
        // Aura
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, floatY, 18 + Math.sin(Date.now() / 400) * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Towers
      engine.towers.forEach(t => {
        if (t.hp <= 0) {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
          ctx.beginPath();
          ctx.roundRect(t.x - t.radius, t.y - t.radius, t.radius * 2, t.radius * 2, 6);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.stroke();
          return;
        }
        
        // Base Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(t.x, t.y + 10, t.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = t.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = t.color;
        ctx.beginPath();
        ctx.roundRect(t.x - t.radius, t.y - t.radius, t.radius * 2, t.radius * 2, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tower Emblem
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♜', t.x, t.y + 7);

        // HP Bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(t.x - 30, t.y - 45, 60, 8);
        ctx.fillStyle = t.side === 'Blue' ? '#3b82f6' : '#ef4444';
        ctx.fillRect(t.x - 30, t.y - 45, 60 * (t.hp / t.maxHp), 8);
      });

      // Minions
      engine.minions.forEach(m => {
        const opacity = m.active ? 1 : Math.max(0, 1 - (m.deathTimer / 30));
        ctx.globalAlpha = opacity;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(m.x, m.y + m.radius - 2, m.radius * 0.8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight stroke
        ctx.strokeStyle = m.hasMask ? '#facc15' : 'white';
        ctx.lineWidth = m.hasMask ? 3 : 1.5;
        ctx.stroke();

        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getMinionIcon(m.type), m.x, m.y);

        if (m.active) {
            // HP Bar
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(m.x - 15, m.y - 25, 30, 5);
            ctx.fillStyle = m.side === 'Blue' ? '#60a5fa' : '#f87171';
            ctx.fillRect(m.x - 15, m.y - 25, 30 * (m.hp / m.maxHp), 5);
        }
        ctx.globalAlpha = 1;
      });

      // Heroes
      engine.heroes.forEach(h => {
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(h.x, h.y + h.radius - 2, h.radius * 0.9, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = h.color;
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Current Mask Display
        if (h.currentMask) {
          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          const floatY = h.y - 55 + Math.sin(Date.now() / 150) * 8;
          ctx.fillText(getMaskIcon(h.currentMask), h.x, floatY);
          
          // Selection Halo
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(h.side === 'Red' ? 'P1' : 'P2', h.x, h.y + 4);
      });

      // Projectiles
      engine.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Trail
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = p.radius;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 10, p.y - 10); // Simple trail
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    };

    requestRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) window.cancelAnimationFrame(requestRef.current);
    };
  }, [onGameOver]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group p-4">
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-slate-900/90 border-2 border-red-500 p-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] backdrop-blur-md">
           <div className="text-red-400 font-black text-xs uppercase mb-2 tracking-widest">P1 - RED CORE</div>
           <div className="flex gap-2">
             {[0, 1, 2].map((i) => (
               <div key={i} className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-500 ${i < uiState.redHP ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-slate-800 opacity-20 border border-slate-600'}`}>
                  {i < uiState.redHP ? '❤️' : '💀'}
               </div>
             ))}
           </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-slate-900/95 border-2 border-slate-700 px-10 py-3 rounded-full shadow-2xl backdrop-blur-md">
            <span className="text-4xl font-mono font-bold text-white tracking-tighter">{formatTime(uiState.time)}</span>
          </div>
          <div className="bg-slate-800/90 px-4 py-1 rounded-full border border-slate-600 shadow-lg">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">WAVE: {uiState.wave}s</span>
          </div>
        </div>
        <div className="bg-slate-900/90 border-2 border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md text-right">
           <div className="text-blue-400 font-black text-xs uppercase mb-2 tracking-widest">P2 - BLUE CORE</div>
           <div className="flex gap-2 justify-end">
             {[0, 1, 2].map((i) => (
               <div key={i} className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-500 ${i < uiState.blueHP ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-slate-800 opacity-20 border border-slate-600'}`}>
                  {i < uiState.blueHP ? '❤️' : '💀'}
               </div>
             ))}
           </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border-8 border-slate-800"
      />
      
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-50 text-white font-bold text-xs bg-slate-900/50 px-3 py-1 rounded-full">
        P1 (RED): WASD | P2 (BLUE): ARROWS
      </div>
    </div>
  );
};

export default App;
