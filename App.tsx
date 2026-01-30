
import React, { useState } from 'react';
import { GameScene, GameStats } from './types';
import IntroScene from './IntroScene';
import PlayScene from './PlayScene';
import GameOverScene from './GameOverScene';

const App: React.FC = () => {
  const [scene, setScene] = useState<GameScene>(GameScene.INTRO);
  const [stats, setStats] = useState<GameStats | null>(null);

  const startGame = () => {
    setScene(GameScene.GAME);
  };

  const handleGameOver = (res: GameStats) => {
    setStats(res);
    setScene(GameScene.GAMEOVER);
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
      {scene === GameScene.INTRO && (
        <IntroScene onStart={startGame} />
      )}

      {scene === GameScene.GAME && (
        <PlayScene onGameOver={handleGameOver} />
      )}

      {scene === GameScene.GAMEOVER && stats && (
        <GameOverScene stats={stats} onRestart={startGame} />
      )}
    </div>
  );
};

export default App;
