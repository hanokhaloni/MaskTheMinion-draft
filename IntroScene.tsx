
import React, { useState, useEffect } from 'react';
import { MaskType, getMaskIcon } from './types';

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
      }, 600);
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

interface IntroSceneProps {
  onStart: () => void;
}

const IntroScene: React.FC<IntroSceneProps> = ({ onStart }) => {
  return (
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
          onClick={onStart}
          className="group relative px-16 py-5 bg-white text-slate-900 font-black text-3xl rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.15)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-transparent to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity" />
          BATTLE START
        </button>
      </div>
    </div>
  );
};

export default IntroScene;
