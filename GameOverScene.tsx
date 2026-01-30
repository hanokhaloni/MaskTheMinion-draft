
import React from 'react';
import { GameStats } from './types';

interface GameOverSceneProps {
  stats: GameStats;
  onRestart: () => void;
}

const GameOverScene: React.FC<GameOverSceneProps> = ({ stats, onRestart }) => {
  return (
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
        onClick={onRestart}
        className="w-full py-5 bg-gradient-to-r from-red-600 to-blue-600 text-white font-black text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl tracking-tighter"
      >
        RE-ENTER THE ARENA
      </button>
    </div>
  );
};

export default GameOverScene;
