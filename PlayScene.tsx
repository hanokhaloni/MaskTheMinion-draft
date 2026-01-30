
import React, { useState, useEffect, useRef } from 'react';
import { GameStats, getMaskIcon, getMinionIcon } from './types';
import { GameEngine, CANVAS_WIDTH, CANVAS_HEIGHT, PATH_WIDTH } from './gameEngine';

interface PlaySceneProps {
  onGameOver: (stats: GameStats) => void;
}

const PlayScene: React.FC<PlaySceneProps> = ({ onGameOver }) => {
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

export default PlayScene;
