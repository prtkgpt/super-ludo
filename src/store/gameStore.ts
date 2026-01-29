// Ludo Rush - Game State Store (Zustand)
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  Player,
  Token,
  PlayerColor,
  PowerUp,
  PowerUpType,
  GamePhase,
} from '@/types/game';
import {
  createGame,
  createPlayer,
  rollDice,
  getValidMoves,
  moveToken,
  checkWinner,
  nextTurn,
  getCurrentPlayer,
  usePowerUp,
} from '@/lib/game/engine';
import { getAIMove, getAIThinkingDelay, getAIName, shouldUsePowerUp } from '@/lib/game/ai';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameStore {
  // State
  gameState: GameState | null;
  userId: string | null;
  username: string;
  difficulty: Difficulty;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // UI State
  selectedToken: Token | null;
  validMoves: Token[];
  showPowerUpMenu: boolean;
  selectedPowerUp: PowerUp | null;
  notification: { message: string; type: 'info' | 'success' | 'warning' } | null;

  // Actions
  setUsername: (name: string) => void;
  setDifficulty: (diff: Difficulty) => void;
  toggleSound: () => void;
  toggleVibration: () => void;

  startGame: (playerCount: number, aiCount: number) => void;
  rollDice: () => Promise<void>;
  selectToken: (token: Token) => void;
  confirmMove: () => Promise<void>;
  handleAITurn: () => Promise<void>;
  usePowerUp: (powerUp: PowerUp, target?: Token | Player) => void;
  showRewardedAd: (rewardType: PowerUpType) => void;
  claimAdReward: () => void;
  endGame: () => void;

  // Notifications
  showNotification: (message: string, type?: 'info' | 'success' | 'warning') => void;
  clearNotification: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: null,
  userId: null,
  username: 'Player',
  difficulty: 'medium',
  soundEnabled: true,
  vibrationEnabled: true,

  selectedToken: null,
  validMoves: [],
  showPowerUpMenu: false,
  selectedPowerUp: null,
  notification: null,

  // Settings
  setUsername: (name) => set({ username: name }),
  setDifficulty: (diff) => set({ difficulty: diff }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),

  // Start a new game
  startGame: (playerCount, aiCount) => {
    const { username, difficulty } = get();
    const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
    const players: Player[] = [];

    // Create human player
    players.push(createPlayer(username, colors[0], false));

    // Create AI players
    for (let i = 1; i < playerCount; i++) {
      const isAI = i < aiCount + 1;
      const name = isAI ? getAIName() : `Player ${i + 1}`;
      players.push(createPlayer(name, colors[i], isAI));
    }

    const newGame = createGame(players);

    // Generate user ID if not exists
    let userId = get().userId;
    if (!userId) {
      userId = uuidv4();
    }

    set({
      gameState: newGame,
      userId,
      selectedToken: null,
      validMoves: [],
    });

    get().showNotification(`Game started! ${username}'s turn`, 'success');
  },

  // Roll the dice
  rollDice: async () => {
    const { gameState, vibrationEnabled } = get();
    if (!gameState || gameState.phase !== 'rolling') return;

    // Start rolling animation
    set({
      gameState: {
        ...gameState,
        dice: { ...gameState.dice, isRolling: true },
        phase: 'rolling',
      },
    });

    // Simulate dice roll animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const diceValue = rollDice();
    const currentPlayer = getCurrentPlayer(gameState);

    // Haptic feedback
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Check for consecutive sixes
    let consecutiveSixes = gameState.consecutiveSixes;
    if (diceValue === 6) {
      consecutiveSixes++;
      if (consecutiveSixes >= 3) {
        // Three sixes in a row - skip turn
        get().showNotification('Three 6s! Turn skipped', 'warning');
        const newState = nextTurn({
          ...gameState,
          dice: { value: diceValue, isRolling: false, canRoll: false },
          consecutiveSixes: 0,
        });
        set({ gameState: newState });

        // If next player is AI, trigger their turn
        if (newState.players[newState.currentPlayerIndex].isAI) {
          setTimeout(() => get().handleAITurn(), 1000);
        }
        return;
      }
    } else {
      consecutiveSixes = 0;
    }

    // Get valid moves
    const validMoves = getValidMoves(gameState, currentPlayer, diceValue);

    const newState: GameState = {
      ...gameState,
      dice: { value: diceValue, isRolling: false, canRoll: false },
      phase: validMoves.length > 0 ? 'selectingToken' : 'rolling',
      consecutiveSixes,
    };

    set({
      gameState: newState,
      validMoves,
    });

    if (diceValue === 6) {
      get().showNotification('Rolled a 6! Roll again after moving', 'success');
    }

    // If no valid moves, go to next turn
    if (validMoves.length === 0) {
      get().showNotification('No valid moves', 'info');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nextState = nextTurn(newState);
      set({ gameState: nextState });

      // If next player is AI, trigger their turn
      if (nextState.players[nextState.currentPlayerIndex].isAI) {
        setTimeout(() => get().handleAITurn(), 1000);
      }
    }
  },

  // Select a token to move
  selectToken: (token) => {
    const { validMoves } = get();
    if (validMoves.find((t) => t.id === token.id)) {
      set({ selectedToken: token });
    }
  },

  // Confirm and execute the move
  confirmMove: async () => {
    const { gameState, selectedToken, vibrationEnabled } = get();
    if (!gameState || !selectedToken) return;

    const currentPlayer = getCurrentPlayer(gameState);
    const diceValue = gameState.dice.value;

    // Execute the move
    const result = moveToken(gameState, currentPlayer, selectedToken, diceValue);

    // Haptic feedback for capture
    if (result.captured && vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Show notifications
    if (result.captured) {
      get().showNotification(`Captured ${result.captured.color} token!`, 'success');
    }
    if (result.gotPowerUp) {
      get().showNotification(`Got ${result.gotPowerUp.icon} ${result.gotPowerUp.name}!`, 'success');
    }
    if (result.bonusCoins > 0) {
      get().showNotification(`+${result.bonusCoins} coins!`, 'info');
    }
    if (result.teleportTo !== null) {
      get().showNotification('Warped!', 'info');
    }

    let newState = result.newState;
    newState.phase = 'moving';

    set({
      gameState: newState,
      selectedToken: null,
      validMoves: [],
    });

    // Animation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle bonus move from boost tile
    if (result.bonusMove > 0) {
      // Apply bonus move
      // For simplicity, we'll just notify the player
      get().showNotification(`Boost! +${result.bonusMove} bonus spaces!`, 'success');
    }

    // Check for winner
    const winner = checkWinner(newState);
    if (winner) {
      newState = {
        ...newState,
        winner,
        phase: 'gameOver',
      };
      set({ gameState: newState });
      get().showNotification(`${winner.name} wins!`, 'success');
      return;
    }

    // If rolled 6, player gets another turn
    if (diceValue === 6 && newState.consecutiveSixes < 3) {
      newState = {
        ...newState,
        dice: { ...newState.dice, canRoll: true },
        phase: 'rolling',
      };
      set({ gameState: newState });

      // If current player is AI, continue their turn
      if (currentPlayer.isAI) {
        setTimeout(() => get().handleAITurn(), 1000);
      }
    } else {
      // Next player's turn
      newState = nextTurn(newState);
      set({ gameState: newState });

      // If next player is AI, trigger their turn
      if (newState.players[newState.currentPlayerIndex].isAI) {
        setTimeout(() => get().handleAITurn(), 1000);
      }
    }
  },

  // Handle AI turn
  handleAITurn: async () => {
    const { gameState, difficulty } = get();
    if (!gameState) return;

    const currentPlayer = getCurrentPlayer(gameState);
    if (!currentPlayer.isAI) return;

    // Check if AI should use a power-up first
    const powerUpDecision = shouldUsePowerUp(gameState, currentPlayer, difficulty);
    if (powerUpDecision.use && powerUpDecision.powerUp) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const powerUp = currentPlayer.powerUps.find(p => p.type === powerUpDecision.powerUp);
      if (powerUp) {
        get().usePowerUp(powerUp, powerUpDecision.target);
      }
    }

    // Roll dice
    await get().rollDice();

    // Wait for dice roll to complete
    await new Promise((resolve) => setTimeout(resolve, getAIThinkingDelay(difficulty)));

    const updatedState = get().gameState;
    if (!updatedState || updatedState.phase !== 'selectingToken') return;

    // Select best move
    const bestMove = getAIMove(updatedState, difficulty);
    if (bestMove) {
      set({ selectedToken: bestMove });

      // Small delay before moving
      await new Promise((resolve) => setTimeout(resolve, 500));

      await get().confirmMove();
    }
  },

  // Use a power-up
  usePowerUp: (powerUp, target) => {
    const { gameState } = get();
    if (!gameState) return;

    const currentPlayer = getCurrentPlayer(gameState);
    const newState = usePowerUp(gameState, currentPlayer, powerUp, target as Token);

    set({
      gameState: newState,
      showPowerUpMenu: false,
      selectedPowerUp: null,
    });

    get().showNotification(`Used ${powerUp.icon} ${powerUp.name}!`, 'success');
  },

  // Show rewarded ad for power-up
  showRewardedAd: (rewardType) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        showRewardedAd: true,
        adRewardType: rewardType,
      },
    });
  },

  // Claim ad reward
  claimAdReward: () => {
    const { gameState } = get();
    if (!gameState || !gameState.adRewardType) return;

    const currentPlayer = getCurrentPlayer(gameState);
    const playerIndex = gameState.currentPlayerIndex;
    const rewardType = gameState.adRewardType;

    // Add power-up to player
    const powerUp: PowerUp = {
      type: rewardType,
      name: rewardType.charAt(0).toUpperCase() + rewardType.slice(1),
      description: '',
      icon: '🎁',
    };

    const newPlayers = [...gameState.players];
    newPlayers[playerIndex] = {
      ...currentPlayer,
      powerUps: [...currentPlayer.powerUps, powerUp],
    };

    set({
      gameState: {
        ...gameState,
        players: newPlayers,
        showRewardedAd: false,
        adRewardType: null,
      },
    });

    get().showNotification(`Received ${powerUp.name}!`, 'success');
  },

  // End the game
  endGame: () => {
    set({
      gameState: null,
      selectedToken: null,
      validMoves: [],
    });
  },

  // Notifications
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => get().clearNotification(), 3000);
  },

  clearNotification: () => {
    set({ notification: null });
  },
}));
