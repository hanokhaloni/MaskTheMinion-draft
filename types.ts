
export enum MinionType {
  FIGHTER = 'FIGHTER',
  MAGE = 'MAGE',
  ARCHER = 'ARCHER'
}

export enum MaskType {
  CONVERT_MAGE = 'CONVERT_MAGE',
  CONVERT_FIGHTER = 'CONVERT_FIGHTER',
  CONVERT_ARCHER = 'CONVERT_ARCHER',
  BUFF_HP = 'BUFF_HP',
  BUFF_DAMAGE = 'BUFF_DAMAGE',
  BUFF_SPEED = 'BUFF_SPEED'
}

export enum GameScene {
  INTRO = 'INTRO',
  GAME = 'GAME',
  GAMEOVER = 'GAMEOVER'
}

export interface GameStats {
  blueDamageDealt: number;
  redDamageDealt: number;
  blueMinionsSpawned: number;
  redMinionsSpawned: number;
  matchTime: number;
  winner: 'Blue' | 'Red' | null;
}

export interface Position {
  x: number;
  y: number;
}

export const getMaskIcon = (type: MaskType): string => {
  switch (type) {
    case MaskType.CONVERT_MAGE: return '🔮';
    case MaskType.CONVERT_FIGHTER: return '⚔️';
    case MaskType.CONVERT_ARCHER: return '🏹';
    case MaskType.BUFF_HP: return '❤️';
    case MaskType.BUFF_DAMAGE: return '💥';
    case MaskType.BUFF_SPEED: return '👟';
    default: return '🎭';
  }
};

export const getMinionIcon = (type: MinionType): string => {
  switch (type) {
    case MinionType.FIGHTER: return '🛡️';
    case MinionType.MAGE: return '✨';
    case MinionType.ARCHER: return '🎯';
    default: return '👾';
  }
};
