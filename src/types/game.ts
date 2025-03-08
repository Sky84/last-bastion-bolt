export type Resource = 'food' | 'water' | 'medicine' | 'materials';

export type GamePhase = 'initial' | 'day' | 'night';

export interface Position {
  x: number;
  y: number;
}

export interface House {
  id: string;
  position: Position;
  type: 'residential' | 'store' | 'hospital' | 'warehouse';
  explored: boolean;
  lootable: boolean;
  rooms: {
    name: string;
    description: string;
    loot?: Resource[];
  }[];
}

export interface Survivor {
  id: string;
  name: string;
  health: number;
  morale: number;
  skills: string[];
  inventory: Record<Resource, number>;
  position: Position;
}

export interface Player {
  id: string;
  name: string;
  ready: boolean;
}

export interface LobbySettings {
  difficulty: 'easy' | 'normal' | 'hard';
  nightLength: number;
  startingResources: 'scarce' | 'normal' | 'abundant';
}

export interface Lobby {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  started: boolean;
  settings?: LobbySettings;
}

export interface GameState {
  phase: GamePhase;
  day: number;
  survivors: Survivor[];
  baseResources: Record<Resource, number>;
  baseDefense: number;
  events: string[];
  houses: House[];
  playerPosition: Position;
  selectedHouse: string | null;
  currentUser: Player | null;
  currentLobby: Lobby | null;
}
