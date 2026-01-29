// Ludo Rush - Game Engine
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  Player,
  Token,
  PlayerColor,
  Tile,
  TileType,
  PowerUp,
  PowerUpType,
  POWER_UP_INFO,
  BOARD_SIZE,
  TOKENS_PER_PLAYER,
  START_POSITIONS,
  SAFE_TILES,
  BOOST_TILES,
  MYSTERY_TILES,
  WARP_TILES,
  COIN_TILES,
} from '@/types/game';

// Create initial tokens for a player
function createTokens(color: PlayerColor): Token[] {
  return Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
    id: `${color}-${i}`,
    color,
    position: -1, // Start in home base
    isShielded: false,
    shieldTurns: 0,
  }));
}

// Create a player
export function createPlayer(
  name: string,
  color: PlayerColor,
  isAI: boolean = false
): Player {
  return {
    id: uuidv4(),
    name,
    color,
    tokens: createTokens(color),
    isAI,
    powerUps: [],
    coins: 0,
    captureStreak: 0,
  };
}

// Create board tiles with special types
function createTiles(): Tile[] {
  const tiles: Tile[] = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    let type: TileType = 'normal';

    if (SAFE_TILES.includes(i)) type = 'safe';
    else if (BOOST_TILES.includes(i)) type = 'boost';
    else if (MYSTERY_TILES.includes(i)) type = 'mystery';
    else if (WARP_TILES.includes(i)) type = 'warp';
    else if (COIN_TILES.includes(i)) type = 'coin';

    tiles.push({ index: i, type });
  }

  return tiles;
}

// Initialize a new game
export function createGame(players: Player[]): GameState {
  return {
    id: uuidv4(),
    players,
    currentPlayerIndex: 0,
    dice: { value: 1, isRolling: false, canRoll: true },
    phase: 'rolling',
    winner: null,
    turnCount: 0,
    consecutiveSixes: 0,
    tiles: createTiles(),
    lastCapture: null,
    frozenPlayers: new Map(),
    showRewardedAd: false,
    adRewardType: null,
  };
}

// Roll the dice
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Get valid moves for a player
export function getValidMoves(state: GameState, player: Player, diceValue: number): Token[] {
  const validTokens: Token[] = [];

  for (const token of player.tokens) {
    if (canMoveToken(state, player, token, diceValue)) {
      validTokens.push(token);
    }
  }

  return validTokens;
}

// Check if a token can be moved
export function canMoveToken(
  state: GameState,
  player: Player,
  token: Token,
  diceValue: number
): boolean {
  // Token in home base - needs 6 to come out
  if (token.position === -1) {
    return diceValue === 6;
  }

  // Token already finished
  if (token.position === 57) {
    return false;
  }

  // Calculate destination
  const destination = calculateDestination(player, token, diceValue);

  // Can't overshoot the finish
  if (destination > 57) {
    return false;
  }

  return true;
}

// Calculate where a token would end up
export function calculateDestination(
  player: Player,
  token: Token,
  diceValue: number
): number {
  if (token.position === -1) {
    // Coming out of home base
    return START_POSITIONS[player.color];
  }

  const startPos = START_POSITIONS[player.color];
  const currentPos = token.position;

  // Check if token is in finish lane (52-56) or about to enter
  if (currentPos >= 52) {
    // Already in finish lane
    return Math.min(currentPos + diceValue, 57);
  }

  // Calculate position relative to player's start
  const relativePos = (currentPos - startPos + BOARD_SIZE) % BOARD_SIZE;

  // Check if we're about to enter finish lane (need to complete almost full circle)
  if (relativePos + diceValue >= BOARD_SIZE) {
    // Entering finish lane
    const overflow = relativePos + diceValue - BOARD_SIZE;
    return 52 + overflow; // 52 is start of finish lane
  }

  // Normal move on main track
  return (currentPos + diceValue) % BOARD_SIZE;
}

// Move a token and handle all consequences
export function moveToken(
  state: GameState,
  player: Player,
  token: Token,
  diceValue: number
): {
  newState: GameState;
  captured: Token | null;
  gotPowerUp: PowerUp | null;
  bonusCoins: number;
  bonusMove: number;
  teleportTo: number | null;
} {
  let newState = { ...state };
  let captured: Token | null = null;
  let gotPowerUp: PowerUp | null = null;
  let bonusCoins = 0;
  let bonusMove = 0;
  let teleportTo: number | null = null;

  const destination = calculateDestination(player, token, diceValue);

  // Update token position
  const playerIndex = newState.players.findIndex(p => p.id === player.id);
  const tokenIndex = newState.players[playerIndex].tokens.findIndex(t => t.id === token.id);
  newState.players[playerIndex].tokens[tokenIndex].position = destination;

  // Check for captures (only on main track, not in finish lane)
  if (destination < 52) {
    const tile = newState.tiles[destination];

    // Can't capture on safe tiles
    if (tile.type !== 'safe') {
      for (let i = 0; i < newState.players.length; i++) {
        if (i === playerIndex) continue;

        for (let j = 0; j < newState.players[i].tokens.length; j++) {
          const enemyToken = newState.players[i].tokens[j];

          if (enemyToken.position === destination && !enemyToken.isShielded) {
            // Capture! Send back to home
            newState.players[i].tokens[j].position = -1;
            captured = enemyToken;
            newState.lastCapture = { capturer: player, captured: enemyToken };

            // Capture streak bonus
            newState.players[playerIndex].captureStreak++;
            bonusCoins += 10 * newState.players[playerIndex].captureStreak;

            break;
          }
        }
        if (captured) break;
      }
    }

    // Handle special tiles
    switch (tile.type) {
      case 'boost':
        bonusMove = 6;
        break;
      case 'mystery':
        gotPowerUp = getRandomPowerUp();
        newState.players[playerIndex].powerUps.push(gotPowerUp);
        break;
      case 'warp':
        // Find next warp tile
        const warpIndex = WARP_TILES.indexOf(destination);
        const nextWarpIndex = (warpIndex + 1) % WARP_TILES.length;
        teleportTo = WARP_TILES[nextWarpIndex];
        newState.players[playerIndex].tokens[tokenIndex].position = teleportTo;
        break;
      case 'coin':
        bonusCoins += 20;
        break;
    }
  }

  // Token reached finish
  if (destination === 57) {
    bonusCoins += 50;
  }

  // Add coins to player
  newState.players[playerIndex].coins += bonusCoins;

  // Reset capture streak if no capture this turn
  if (!captured) {
    newState.players[playerIndex].captureStreak = 0;
  }

  // Decrease shield turns
  for (const p of newState.players) {
    for (const t of p.tokens) {
      if (t.isShielded && t.shieldTurns > 0) {
        t.shieldTurns--;
        if (t.shieldTurns === 0) {
          t.isShielded = false;
        }
      }
    }
  }

  return { newState, captured, gotPowerUp, bonusCoins, bonusMove, teleportTo };
}

// Get a random power-up
export function getRandomPowerUp(): PowerUp {
  const types: PowerUpType[] = ['shield', 'speedBoost', 'sniper', 'reroll', 'teleport', 'freeze'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return { type: randomType, ...POWER_UP_INFO[randomType] };
}

// Use a power-up
export function usePowerUp(
  state: GameState,
  player: Player,
  powerUp: PowerUp,
  targetToken?: Token,
  targetPlayer?: Player
): GameState {
  const newState = { ...state };
  const playerIndex = newState.players.findIndex(p => p.id === player.id);

  // Remove power-up from player's inventory
  const powerUpIndex = newState.players[playerIndex].powerUps.findIndex(
    p => p.type === powerUp.type
  );
  if (powerUpIndex > -1) {
    newState.players[playerIndex].powerUps.splice(powerUpIndex, 1);
  }

  switch (powerUp.type) {
    case 'shield':
      if (targetToken) {
        const tokenIndex = newState.players[playerIndex].tokens.findIndex(
          t => t.id === targetToken.id
        );
        newState.players[playerIndex].tokens[tokenIndex].isShielded = true;
        newState.players[playerIndex].tokens[tokenIndex].shieldTurns = 3;
      }
      break;

    case 'speedBoost':
      // Handled in dice roll - doubles the value
      break;

    case 'sniper':
      if (targetToken && targetPlayer) {
        const targetPlayerIndex = newState.players.findIndex(p => p.id === targetPlayer.id);
        const targetTokenIndex = newState.players[targetPlayerIndex].tokens.findIndex(
          t => t.id === targetToken.id
        );
        if (!newState.players[targetPlayerIndex].tokens[targetTokenIndex].isShielded) {
          newState.players[targetPlayerIndex].tokens[targetTokenIndex].position = -1;
          newState.lastCapture = { capturer: player, captured: targetToken };
          newState.players[playerIndex].coins += 15;
        }
      }
      break;

    case 'reroll':
      newState.dice.canRoll = true;
      break;

    case 'teleport':
      if (targetToken) {
        // Can teleport to any safe tile
        const randomSafeTile = SAFE_TILES[Math.floor(Math.random() * SAFE_TILES.length)];
        const tokenIndex = newState.players[playerIndex].tokens.findIndex(
          t => t.id === targetToken.id
        );
        newState.players[playerIndex].tokens[tokenIndex].position = randomSafeTile;
      }
      break;

    case 'freeze':
      if (targetPlayer) {
        newState.frozenPlayers.set(targetPlayer.id, 1);
      }
      break;
  }

  return newState;
}

// Check if a player has won
export function checkWinner(state: GameState): Player | null {
  for (const player of state.players) {
    const allFinished = player.tokens.every(token => token.position === 57);
    if (allFinished) {
      return player;
    }
  }
  return null;
}

// Move to next player
export function nextTurn(state: GameState): GameState {
  const newState = { ...state };

  // Check for frozen players
  let nextIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
  let attempts = 0;

  while (attempts < newState.players.length) {
    const nextPlayer = newState.players[nextIndex];
    const frozenTurns = newState.frozenPlayers.get(nextPlayer.id);

    if (frozenTurns && frozenTurns > 0) {
      newState.frozenPlayers.set(nextPlayer.id, frozenTurns - 1);
      if (frozenTurns - 1 === 0) {
        newState.frozenPlayers.delete(nextPlayer.id);
      }
      nextIndex = (nextIndex + 1) % newState.players.length;
      attempts++;
    } else {
      break;
    }
  }

  newState.currentPlayerIndex = nextIndex;
  newState.dice.canRoll = true;
  newState.dice.isRolling = false;
  newState.phase = 'rolling';
  newState.turnCount++;
  newState.consecutiveSixes = 0;

  return newState;
}

// Get current player
export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

// Convert board position to visual coordinates for rendering
export function getPositionCoordinates(
  position: number,
  color: PlayerColor
): { x: number; y: number } {
  // This returns percentage-based coordinates for the board
  // The board is a 15x15 grid

  if (position === -1) {
    // Home base positions (corners)
    const homePositions: Record<PlayerColor, { x: number; y: number }> = {
      red: { x: 15, y: 15 },
      blue: { x: 85, y: 15 },
      yellow: { x: 85, y: 85 },
      green: { x: 15, y: 85 },
    };
    return homePositions[color];
  }

  // Main track positions (simplified - would be more detailed in actual implementation)
  const angle = (position / BOARD_SIZE) * 2 * Math.PI - Math.PI / 2;
  const radius = 35;
  const centerX = 50;
  const centerY = 50;

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}
