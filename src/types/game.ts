// Ludo Rush - Game Types

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Position {
  x: number;
  y: number;
  index: number; // Board position index (0-51 for main track, -1 for home, 52+ for finish lane)
}

export interface Token {
  id: string;
  color: PlayerColor;
  position: number; // -1 = home base, 0-51 = main track, 52-56 = finish lane, 57 = finished
  isShielded: boolean;
  shieldTurns: number;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  tokens: Token[];
  isAI: boolean;
  powerUps: PowerUp[];
  coins: number;
  captureStreak: number;
}

export type PowerUpType =
  | 'shield'      // Protect from capture for 3 turns
  | 'speedBoost'  // Double dice value
  | 'sniper'      // Capture any visible enemy
  | 'reroll'      // Roll again
  | 'teleport'    // Jump to any safe tile
  | 'freeze';     // Freeze an opponent for 1 turn

export interface PowerUp {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
}

export const POWER_UP_INFO: Record<PowerUpType, Omit<PowerUp, 'type'>> = {
  shield: { name: 'Shield', description: 'Protect from capture for 3 turns', icon: '🛡️' },
  speedBoost: { name: 'Speed Boost', description: 'Double your dice value', icon: '⚡' },
  sniper: { name: 'Sniper', description: 'Capture any visible enemy', icon: '🎯' },
  reroll: { name: 'Reroll', description: 'Roll the dice again', icon: '🔄' },
  teleport: { name: 'Teleport', description: 'Jump to any safe tile', icon: '🌀' },
  freeze: { name: 'Freeze', description: 'Skip opponent\'s next turn', icon: '❄️' },
};

export type TileType =
  | 'normal'
  | 'safe'       // Cannot be captured here
  | 'boost'      // Move 6 extra spaces
  | 'mystery'    // Random power-up
  | 'warp'       // Teleport to another warp
  | 'coin';      // Collect bonus coins

export interface Tile {
  index: number;
  type: TileType;
  color?: PlayerColor; // For colored start positions
}

export interface DiceState {
  value: number;
  isRolling: boolean;
  canRoll: boolean;
}

export type GamePhase =
  | 'menu'
  | 'waiting'
  | 'rolling'
  | 'selectingToken'
  | 'moving'
  | 'powerUp'
  | 'gameOver';

export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  dice: DiceState;
  phase: GamePhase;
  winner: Player | null;
  turnCount: number;
  consecutiveSixes: number;
  tiles: Tile[];
  lastCapture: { capturer: Player; captured: Token } | null;
  frozenPlayers: Map<string, number>; // playerId -> turns remaining
  showRewardedAd: boolean;
  adRewardType: PowerUpType | null;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  wins: number;
  gamesPlayed: number;
  totalCaptures: number;
  fastestWin: number | null; // turns to win
  createdAt: Date;
}

export interface UserStats {
  id: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  coins: number;
  powerUpsUsed: number;
  totalCaptures: number;
  longestStreak: number;
}

// Board layout constants
export const BOARD_SIZE = 52; // Main track size
export const FINISH_LANE_SIZE = 6; // Home stretch
export const TOKENS_PER_PLAYER = 4;

// Starting positions for each color (where they enter the main track)
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  blue: 13,
  yellow: 26,
  green: 39,
};

// Safe tile positions (star tiles)
export const SAFE_TILES = [0, 8, 13, 21, 26, 34, 39, 47];

// Special tile positions
export const BOOST_TILES = [4, 17, 30, 43];
export const MYSTERY_TILES = [10, 23, 36, 49];
export const WARP_TILES = [6, 19, 32, 45]; // Warp to next warp tile
export const COIN_TILES = [2, 15, 28, 41];
