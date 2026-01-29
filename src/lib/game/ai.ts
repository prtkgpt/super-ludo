// Ludo Rush - AI Opponent Logic
import {
  GameState,
  Player,
  Token,
  PowerUpType,
  SAFE_TILES,
  BOOST_TILES,
  MYSTERY_TILES,
} from '@/types/game';
import {
  getValidMoves,
  calculateDestination,
  getCurrentPlayer,
} from './engine';

type Difficulty = 'easy' | 'medium' | 'hard';

interface MoveScore {
  token: Token;
  score: number;
  reason: string;
}

// AI decision making
export function getAIMove(
  state: GameState,
  difficulty: Difficulty = 'medium'
): Token | null {
  const player = getCurrentPlayer(state);
  const validMoves = getValidMoves(state, player, state.dice.value);

  if (validMoves.length === 0) {
    return null;
  }

  if (validMoves.length === 1) {
    return validMoves[0];
  }

  // Score each possible move
  const scoredMoves: MoveScore[] = validMoves.map(token => {
    const score = evaluateMove(state, player, token, state.dice.value, difficulty);
    return { token, ...score };
  });

  // Sort by score (highest first)
  scoredMoves.sort((a, b) => b.score - a.score);

  // Add randomness based on difficulty
  if (difficulty === 'easy') {
    // 40% chance to pick a random move instead of best
    if (Math.random() < 0.4) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  } else if (difficulty === 'medium') {
    // 15% chance to pick a random move
    if (Math.random() < 0.15) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
  }
  // Hard: always picks the best move

  return scoredMoves[0].token;
}

// Evaluate a potential move
function evaluateMove(
  state: GameState,
  player: Player,
  token: Token,
  diceValue: number,
  difficulty: Difficulty
): { score: number; reason: string } {
  let score = 0;
  let reason = '';

  const destination = calculateDestination(player, token, diceValue);

  // Coming out of home base (high priority)
  if (token.position === -1) {
    score += 50;
    reason = 'Leaving home';
    return { score, reason };
  }

  // Reaching finish (highest priority)
  if (destination === 57) {
    score += 1000;
    reason = 'Reaching finish!';
    return { score, reason };
  }

  // Entering finish lane
  if (destination >= 52 && token.position < 52) {
    score += 200;
    reason = 'Entering finish lane';
  }

  // Capturing an opponent (very high priority)
  const captureTarget = findCaptureTarget(state, player, destination);
  if (captureTarget) {
    score += 300;
    reason = 'Capturing opponent';

    // Extra points if opponent is close to finishing
    if (captureTarget.position >= 45) {
      score += 100;
      reason = 'Capturing opponent near finish!';
    }
  }

  // Landing on safe tile
  if (SAFE_TILES.includes(destination)) {
    score += 40;
    reason = reason || 'Moving to safe tile';
  }

  // Landing on boost tile
  if (BOOST_TILES.includes(destination)) {
    score += 35;
    reason = reason || 'Landing on boost';
  }

  // Landing on mystery tile (power-up)
  if (MYSTERY_TILES.includes(destination)) {
    score += 45;
    reason = reason || 'Getting power-up';
  }

  // Avoiding danger - check if current position is threatened
  if (isPositionThreatened(state, player, token.position)) {
    score += 30;
    reason = reason || 'Escaping danger';

    // Extra points if moving to safety
    if (SAFE_TILES.includes(destination)) {
      score += 20;
    }
  }

  // Progress towards finish (base score)
  score += destination * 0.5;

  // Penalize if destination is threatened and not safe
  if (difficulty !== 'easy' && isPositionThreatened(state, player, destination) && !SAFE_TILES.includes(destination)) {
    score -= 25;
    reason = reason || 'Risky position';
  }

  // Prefer moving tokens that are further behind (spread strategy)
  if (difficulty === 'hard') {
    const avgPosition = player.tokens
      .filter(t => t.position > -1 && t.position < 57)
      .reduce((sum, t) => sum + t.position, 0) / player.tokens.length;

    if (token.position < avgPosition) {
      score += 15;
    }
  }

  return { score, reason: reason || 'Standard move' };
}

// Find if there's an opponent to capture at a position
function findCaptureTarget(
  state: GameState,
  player: Player,
  position: number
): Token | null {
  if (position >= 52 || SAFE_TILES.includes(position)) {
    return null;
  }

  for (const opponent of state.players) {
    if (opponent.id === player.id) continue;

    for (const token of opponent.tokens) {
      if (token.position === position && !token.isShielded) {
        return token;
      }
    }
  }

  return null;
}

// Check if a position is threatened by opponents
function isPositionThreatened(
  state: GameState,
  player: Player,
  position: number
): boolean {
  if (position === -1 || position >= 52 || SAFE_TILES.includes(position)) {
    return false;
  }

  for (const opponent of state.players) {
    if (opponent.id === player.id) continue;

    for (const token of opponent.tokens) {
      if (token.position === -1 || token.position >= 52) continue;

      // Check if opponent can reach this position with any dice roll
      for (let dice = 1; dice <= 6; dice++) {
        const opponentDest = (token.position + dice) % 52;
        if (opponentDest === position) {
          return true;
        }
      }
    }
  }

  return false;
}

// AI power-up usage decision
export function shouldUsePowerUp(
  state: GameState,
  player: Player,
  difficulty: Difficulty
): { use: boolean; powerUp?: PowerUpType; target?: Token } {
  if (player.powerUps.length === 0) {
    return { use: false };
  }

  // Easy AI rarely uses power-ups
  if (difficulty === 'easy' && Math.random() < 0.7) {
    return { use: false };
  }

  // Check for shield usage
  const shieldPowerUp = player.powerUps.find(p => p.type === 'shield');
  if (shieldPowerUp) {
    // Find a threatened token
    for (const token of player.tokens) {
      if (token.position > 40 && token.position < 52 && !token.isShielded) {
        if (isPositionThreatened(state, player, token.position)) {
          return { use: true, powerUp: 'shield', target: token };
        }
      }
    }
  }

  // Check for sniper usage
  const sniperPowerUp = player.powerUps.find(p => p.type === 'sniper');
  if (sniperPowerUp && difficulty !== 'easy') {
    // Find opponent closest to finishing
    let bestTarget: Token | null = null;
    let bestPosition = -1;

    for (const opponent of state.players) {
      if (opponent.id === player.id) continue;

      for (const token of opponent.tokens) {
        if (token.position > bestPosition && token.position < 52 && !token.isShielded) {
          bestTarget = token;
          bestPosition = token.position;
        }
      }
    }

    if (bestTarget && bestPosition > 40) {
      return { use: true, powerUp: 'sniper', target: bestTarget };
    }
  }

  // Check for freeze usage
  const freezePowerUp = player.powerUps.find(p => p.type === 'freeze');
  if (freezePowerUp && difficulty === 'hard') {
    // Freeze the player closest to winning
    let closestPlayer: Player | null = null;
    let maxProgress = -1;

    for (const opponent of state.players) {
      if (opponent.id === player.id) continue;

      const progress = opponent.tokens.reduce((sum, t) => {
        if (t.position === 57) return sum + 100;
        if (t.position >= 52) return sum + 60 + t.position - 52;
        if (t.position >= 0) return sum + t.position;
        return sum;
      }, 0);

      if (progress > maxProgress) {
        maxProgress = progress;
        closestPlayer = opponent;
      }
    }

    if (closestPlayer && maxProgress > 150) {
      return { use: true, powerUp: 'freeze', target: closestPlayer.tokens[0] };
    }
  }

  return { use: false };
}

// Generate AI player names
export function getAIName(): string {
  const names = [
    'RushBot', 'LudoMaster', 'DiceKing', 'TokenTerror',
    'BoardBoss', 'RollRaider', 'CaptureKing', 'SwiftPawn',
    'LuckyRoller', 'StarChaser', 'PowerPlayer', 'TurboToken',
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// Simulate AI "thinking" delay for better UX
export function getAIThinkingDelay(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 500 + Math.random() * 500;
    case 'medium':
      return 800 + Math.random() * 700;
    case 'hard':
      return 1000 + Math.random() * 1000;
  }
}
