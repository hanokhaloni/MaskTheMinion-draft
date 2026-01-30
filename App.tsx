
import React, { useState, useEffect, useRef } from 'react';
import { GameScene, GameStats, MaskType, getMaskIcon, getMinionIcon } from './types';
import { GameEngine, CANVAS_WIDTH, CANVAS_HEIGHT, PATH_WIDTH } from './gameEngine';

const maskIntros = [
  { type: MaskType.CONVERT_FIGHTER, name: 'THE BRAWLER', nickname: '"VANGUARD"', effect: 'TRANSFORMS MINION TO FIGHTER 🛡️' },
  { type: MaskType.CONVERT_MAGE, name: 'THE ARCANE', nickname: '"ENCHANTER"', effect: 'TRANSFORMS MINION TO MAGE ✨' },
  { type: MaskType.CONVERT_ARCHER, name: 'THE SNIPER', nickname: '"DEADEYE"', effect: 'TRANSFORMS MINION TO ARCHER 🎯' },
  { type: MaskType.BUFF_HP, name: 'THE VITALITY', nickname: '"BEHEMOTH"', effect: 'GRANT +60 MAX HEALTH ❤️' },
  { type: MaskType.BUFF_DAMAGE, name: 'THE RAGE', nickname: '"SLAYER"', effect: 'GRANT +8 ATTACK DAMAGE 💥' },
  { type: MaskType.BUFF_SPEED, name: 'THE HASTE', nickname: '"STREAK"', effect: 'GRANT 1.4x MOVEMENT SPEED 👟' },
];

const MaskParade: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount < maskIntros.length) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, 600); // Interval between each mask running in
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  return (
    <div className="min-h-64 py-8 flex flex-wrap justify-center gap-y-8 gap-x-4 overflow-hidden relative w-full max-w-4xl mx-auto bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-sm shadow-inner mt-8 px-6">
      {maskIntros.map((item, i) => (
        <div 
          key={item.type}
          className={`flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform w-40
            ${i >= visibleCount ? 'translate-x-[400%] opacity-0 scale-50' : 'translate-x-0 opacity-100 scale-100'}
          `}
        >
          <div className="text-5xl mb-2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
            {getMaskIcon(item.type)}
          </div>
          <div className="text-center">
            <h4 className="text-white font-black text-sm tracking-tighter uppercase leading-none mb-1">{item.name}</h4>
            <p className="text-amber-400 font-mono text-[10px] font-bold tracking-[0.2em] mb-2">{item.nickname}</p>
            <p className="text-slate-400 text-[9px] font-bold tracking-tight bg-white/5 px-2 py-1 rounded-full inline-block leading-tight border border-white/5">
              {item.effect}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [scene, setScene] = useState<GameScene>(GameScene.INTRO);
  const [stats, setStats] = useState<GameStats | null>(null);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      {scene === GameScene.INTRO && (
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700 max-w-5xl px-4">
          <div className="relative inline-block">
             <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight italic">
              MASK THE MINION
            </h1>
            <div className="absolute -top-6 -right-12 text-6xl rotate-12 animate-pulse drop-shadow-lg">🎭</div>
          </div>
          
          <p className="text-xl text-slate-400 font-medium tracking-[0.5em] uppercase pb-2">
            Heroes of the MOBA Mask League
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-red-500/10 to-transparent p-4 rounded-2xl border border-red-500/20 backdrop-blur-md shadow-xl">
               <h3 className="font-black text-red-500 mb-2 flex items-center gap-2 tracking-tighter text-base">
                 <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">P1</span> RED TEAM (WASD)
               </h3>
               <p className="text-slate-400 text-[11px] leading-relaxed font-medium">Starts at <span className="text-red-300">Bottom-Left</span>. Move your hero and collect masks. Deliver them to your minions!</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-4 rounded-2xl border border-blue-500/20 backdrop-blur-md shadow-xl">
               <h3 className="font-black text-blue-500 mb-2 flex items-center gap-2 tracking-tighter text-base">
                 <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">P2</span> BLUE TEAM (ARROWS)
               </h3>
               <p className="text-slate-400 text-[11px] leading-relaxed font-medium text-right">Starts at <span className="text-blue-300">Top-Right</span>. Defend your base! If enemy minions reach your corner, you lose a heart.</p>
            </div>
          </div>

          <MaskParade />

          <div className="pt-6">
            <button 
              onClick={() => setScene(GameScene.GAME)}
              className="group relative px-16 py-5 bg-white text-slate-900 font-black text-3xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-transparent to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
              BATTLE START
            </button>
          </div>
        </div>
      )}

      {scene === GameScene.GAME && (
        <GameView onGameOver={(res) => { setStats(res); setScene(GameScene.GAMEOVER); }} />
      )}

      {scene === GameScene.GAMEOVER && stats && (
        <div className="text-center space-y-8 p-12 bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] border-2 border-slate-800 animate-in slide-in-from-bottom-12 duration-1000 shadow-2xl max-w-3xl">
          <div className="space-y-2">
            <div className="text-slate-500 font-black text-sm tracking-[0.4em] uppercase">Victory Achieved</div>
            <h2 className="text-7xl font-black mb-4 tracking-tighter">
              TEAM <span className={stats.winner === 'Blue' ? 'text-blue-500' : 'text-red-500'}>{stats.winner?.toUpperCase()}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-slate-950 rounded-3xl border border-red-500/20 shadow-inner">
               <h4 className="text-red-400 font-black text-sm tracking-widest mb-4 uppercase">RED PERFORMANCE</h4>
               <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Total Damage</span>
                    <span className="text-white font-mono text-xl">{Math.floor(stats.redDamageDealt)}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Army Size</span>
                    <span className="text-white font-mono text-xl">{stats.redMinionsSpawned}</span>
                 </div>
               </div>
            </div>
            <div className="p-6 bg-slate-950 rounded-3xl border border-blue-500/20 shadow-inner">
               <h4 className="text-blue-400 font-black text-sm tracking-widest mb-4 uppercase">BLUE PERFORMANCE</h4>
               <div className="space-y-2 text-right">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Total Damage</span>
                    <span className="text-white font-mono text-xl">{Math.floor(stats.blueDamageDealt)}</span>
                 </div>
                 <div className="flex justify-between items-end border-t border-white/5 pt-2">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Army Size</span>
                    <span className="text-white font-mono text-xl">{stats.blueMinionsSpawned}</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-500 text-sm font-bold tracking-widest uppercase">
            <span>Match Duration</span>
            <span className="text-white bg-slate-800 px-3 py-1 rounded-lg">
              {Math.floor(stats.matchTime / 60)}:{ (stats.matchTime % 60).toString().padStart(2, '0') }
            </span>
          </div>

          <button 
            onClick={() => setScene(GameScene.GAME)}
            className="w-full py-5 bg-gradient-to-r from-red-600 to-blue-600 text-white font-black text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl tracking-tighter"
          >
            RE-ENTER THE ARENA
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

  const generateMap = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const bgGradient = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH);
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(22, 101, 52, 0.1)';
    for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 50 + Math.random() * 100, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = PATH_WIDTH + 10;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.stroke();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = PATH_WIDTH - 4;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH, 0);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.stroke();

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

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([10, 20]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - PATH_WIDTH/2, -PATH_WIDTH/2);
    ctx.lineTo(-PATH_WIDTH/2, CANVAS_HEIGHT + PATH_WIDTH/2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH + PATH_WIDTH/2, PATH_WIDTH/2);
    ctx.lineTo(PATH_WIDTH/2, CANVAS_HEIGHT - PATH_WIDTH/2);
    ctx.stroke();
    ctx.setLineDash([]);

    const redBaseX = 80;
    const redBaseY = CANVAS_HEIGHT - 80;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
    ctx.beginPath();
    ctx.arc(redBaseX, redBaseY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    const blueBaseX = CANVAS_WIDTH - 80;
    const blueBaseY = 80;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.beginPath();
    ctx.arc(blueBaseX, blueBaseY, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.stroke();

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

      if (offscreenCanvasRef.current) {
        ctx.drawImage(offscreenCanvasRef.current, 0, 0);
      }

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
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, floatY, 18 + Math.sin(Date.now() / 400) * 2, 0, Math.PI * 2);
        ctx.stroke();
      });

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

        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♜', t.x, t.y + 7);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(t.x - 30, t.y - 45, 60, 8);
        ctx.fillStyle = t.side === 'Blue' ? '#3b82f6' : '#ef4444';
        ctx.fillRect(t.x - 30, t.y - 45, 60 * (t.hp / t.maxHp), 8);
      });

      engine.minions.forEach(m => {
        const opacity = m.active ? 1 : Math.max(0, 1 - (m.deathTimer / 30));
        ctx.globalAlpha = opacity;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(m.x, m.y + m.radius - 2, m.radius * 0.8, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = m.hasMask ? '#facc15' : 'white';
        ctx.lineWidth = m.hasMask ? 3 : 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getMinionIcon(m.type), m.x, m.y);

        if (m.active) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(m.x - 15, m.y - 25, 30, 5);
            ctx.fillStyle = m.side === 'Blue' ? '#60a5fa' : '#f87171';
            ctx.fillRect(m.x - 15, m.y - 25, 30 * (m.hp / m.maxHp), 5);
        }
        ctx.globalAlpha = 1;
      });

      engine.heroes.forEach(h => {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(h.x, h.y + h.radius - 2, h.radius * 0.9, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 25;
        ctx.shadowColor = h.color;
        ctx.fillStyle = h.color;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (h.currentMask) {
          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          const floatY = h.y - 55 + Math.sin(Date.now() / 150) * 8;
          ctx.fillText(getMaskIcon(h.currentMask), h.x, floatY);
          
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.radius + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(h.side === 'Red' ? 'P1' : 'P2', h.x, h.y + 4);
      });

      engine.projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = p.radius;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 10, p.y - 10);
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
        className="rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] border-8 border-slate-900 ring-1 ring-white/10"
      />
      
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-40 text-white font-black text-[10px] tracking-widest bg-slate-950/80 px-4 py-1.5 rounded-full border border-white/5">
        P1 RED (WASD) • P2 BLUE (ARROWS)
      </div>
    </div>
  );
};

export default App;
