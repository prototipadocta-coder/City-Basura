export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
  badge: string;
  specialAbility: string;
  speed: number;
}

export interface LevelConfig {
  number: number;
  name: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Extremo' | 'Nivel Dios';
  objective: string;
  targetScore: number;
  timeLimit: number; // in seconds
  spawnInterval: number; // in ms
  smogRate: number; // how fast air decays per uncollected trash
  trashTypes: ('plastic' | 'paper' | 'organic' | 'glass' | 'toxic')[];
  bgTheme: string;
  bossMode?: boolean;
}

export interface Trash {
  id: number;
  x: number;
  y: number;
  type: 'plastic' | 'paper' | 'organic' | 'glass' | 'toxic';
  speedY: number;
  size: number;
  points: number;
  name: string;
  correctBin: 'blue' | 'gray' | 'green' | 'yellow' | 'hazard';
}

export interface Bin {
  type: 'blue' | 'gray' | 'green' | 'yellow' | 'hazard';
  label: string;
  sublabel: string;
  color: string;
  x: number;
  width: number;
}

export type GameScreen = 
  | 'story' 
  | 'problem' 
  | 'character-select' 
  | 'level-select' 
  | 'playing' 
  | 'level-complete' 
  | 'game-over' 
  | 'victory';
