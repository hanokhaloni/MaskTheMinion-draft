
import React, { useState, useEffect, useRef } from 'react';
import { GameScene, GameStats, MaskType, getMaskIcon, getMinionIcon } from './types';
import { GameEngine, isPointInDiagonalPath } from './gameEngine';

const MAP_IMAGE_URL = 'map.png';

const App: React.FC = () => {
  const [scene, setScene] = useState<GameScene>(GameScene.INTRO);
  const [stats, setStats] = useState<GameStats | null>(null);

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {scene === GameScene.INTRO && (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 drop-shadow-lg">
            MASK THE MINION
          </h1>
          <p className="text-xl text-slate-300 font-medium tracking-widest uppercase">
            Heroes of the MOBA League of Masks
          </p>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-2xl text-left text-slate-400 text-sm grid grid-cols-2 gap-4">
             <div>
               <h3 className="font-bold text-red-500 mb-2">Red Player (WASD)</h3>
               <p>Starts at Bottom-Left. Move your hero and collect masks. Deliver them to your minions to power them up!</p>
             </div>
             <div>
               <h3 className="font-bold text-blue-500 mb-2">Blue Player (ARROWS)</h3>
               <p>Starts at Top-Right. Defend your base! If enemy minions reach your corner, you lose a life heart.</p>
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
        <div className="text-center space-y-8 p-12 bg-slate-800 rounded-3xl border-4 border-slate-700 animate-in slide-in-from-bottom duration-700 shadow-2xl">
          <h2 className="text-5xl font-black mb-4">
            VICTORY FOR <span className={stats.winner === 'Blue' ? 'text-blue-500' : 'text-red-500'}>{stats.winner?.toUpperCase()}</span>
          </h2>
          
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-4 bg-slate-900 rounded-xl border border-red-500/30">
               <h4 className="text-red-400 font-bold mb-2">RED TEAM</h4>
               <p>Damage Dealt: {Math.floor(stats.redDamageDealt)}</p>
               <p>Minions Spawned: {stats.redMinionsSpawned}</p>
            </div>
            <div className="p-4 bg-slate-900 rounded-xl border border-blue-500/30">
               <h4 className="text-blue-400 font-bold mb-2">BLUE TEAM</h4>
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
  const requestRef = useRef<number | null>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const [uiState, setUiState] = useState({
    blueHP: 3,
    redHP: 3,
    time: 0,
    wave: 30
  });

  useEffect(() => {
    const img = new Image();
    img.src = MAP_IMAGE_URL;
    img.onload = () => {
      mapImageRef.current = img;
    };

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

      // Draw Background
      if (mapImageRef.current) {
        ctx.drawImage(mapImageRef.current, 0, 0, 1200, 800);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 1200, 800);
      }

      // Draw Masks on the ground
      engine.masks.forEach(m => {
        if (!m.active) return;
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getMaskIcon(m.type), m.x, m.y);
        
        // Glow effect for items
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Towers
      engine.towers.forEach(t => {
        if (t.hp <= 0) return;
        ctx.fillStyle = t.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = t.color;
        ctx.beginPath();
        ctx.roundRect(t.x - t.radius, t.y - t.radius, t.radius * 2, t.radius * 2, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        // HP Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(t.x - 30, t.y - 45, 60, 8);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(t.x - 30, t.y - 45, 60 * (t.hp / t.maxHp), 8);
      });

      // Minions
      engine.minions.forEach(m => {
        const opacity = m.active ? 1 : 1 - (m.deathTimer / 30);
        ctx.globalAlpha = opacity;
        
        // Base Circle
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sprite/Icon according to type
        ctx.fillStyle = '#fff';
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getMinionIcon(m.type), m.x, m.y);

        if (m.active) {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(m.x - 15, m.y - 25, 30, 4);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(m.x - 15, m.y - 25, 30 * (m.hp / m.maxHp), 4);
            if (m.hasMask) {
              ctx.font = '14px serif';
              ctx.fillText('⚡', m.x, m.y - 35);
            }
        }
        ctx.globalAlpha = 1;
      });

      // Heroes
      engine.heroes.forEach(h => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = h.color;
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Dynamic Mask Icon - different for each type
        if (h.currentMask) {
          ctx.font = '28px serif';
          ctx.textAlign = 'center';
          ctx.fillText(getMaskIcon(h.currentMask), h.x, h.y - 45);
          
          // Floating animation indicator
          ctx.fillStyle = 'white';
          ctx.font = '10px sans-serif';
          ctx.fillText('CARRYING', h.x, h.y - 65);
        }
      });

      // Projectiles
      engine.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
    <div className="relative group">
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="bg-slate-900/80 border-2 border-red-500 p-4 rounded-xl shadow-lg backdrop-blur-sm transition-all">
           <div className="text-red-400 font-black text-xs uppercase mb-2">RED BASE LIFE</div>
           <div className="flex gap-2">
             {[0, 1, 2].map((i) => (
               <div key={i} className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-500 ${i < uiState.redHP ? 'bg-red-500 scale-100 shadow-[0_0_20px_rgba(239,68,68,0.7)]' : 'bg-slate-800 scale-75 opacity-20 border border-slate-600'}`}>
                  {i < uiState.redHP ? '❤️' : '💀'}
               </div>
             ))}
           </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="bg-slate-900/90 border-2 border-slate-700 px-8 py-3 rounded-full shadow-2xl backdrop-blur-md">
            <span className="text-4xl font-mono font-bold text-white tracking-tighter">
              {formatTime(uiState.time)}
            </span>
          </div>
          <div className="bg-slate-800/80 px-4 py-1 rounded-full border border-slate-600 animate-pulse">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
              {uiState.time < 5 ? `FIRST WAVE IN: ${5 - uiState.time}s` : `Next Wave: ${uiState.wave}s`}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border-2 border-blue-500 p-4 rounded-xl shadow-lg backdrop-blur-sm text-right transition-all">
           <div className="text-blue-400 font-black text-xs uppercase mb-2">BLUE BASE LIFE</div>
           <div className="flex gap-2 justify-end">
             {[0, 1, 2].map((i) => (
               <div key={i} className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-500 ${i < uiState.blueHP ? 'bg-blue-500 scale-100 shadow-[0_0_20px_rgba(59,130,246,0.7)]' : 'bg-slate-800 scale-75 opacity-20 border border-slate-600'}`}>
                  {i < uiState.blueHP ? '❤️' : '💀'}
               </div>
             ))}
           </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={800} 
        className="rounded-xl shadow-2xl border-4 border-slate-800"
      />
    </div>
  );
};

export default App;
