'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function GameOverModal() {
  const { gameState, endGame, startGame, username } = useGameStore();

  useEffect(() => {
    if (gameState?.winner && !gameState.winner.isAI) {
      // Trigger confetti for player win
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [gameState?.winner]);

  if (!gameState?.winner) return null;

  const isPlayerWin = !gameState.winner.isAI;
  const coinsEarned = isPlayerWin ? 100 : 25;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`
          rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center
          ${isPlayerWin
            ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
            : 'bg-gradient-to-br from-gray-700 to-gray-900'
          }
        `}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {isPlayerWin ? '🏆' : '😢'}
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {isPlayerWin ? 'You Win!' : `${gameState.winner.name} Wins!`}
        </h2>

        <p className="text-white/80 mb-4">
          Game completed in {gameState.turnCount} turns
        </p>

        <div className="bg-black/20 rounded-xl p-4 mb-6">
          <p className="text-white/70 text-sm mb-1">Coins Earned</p>
          <p className="text-3xl font-bold text-yellow-300">+{coinsEarned} 💰</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={endGame}
            className="flex-1 py-3 px-4 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
          >
            Menu
          </button>
          <button
            onClick={() => {
              endGame();
              startGame(4, 3);
            }}
            className="flex-1 py-3 px-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Play Again
          </button>
        </div>

        {/* Watch ad for bonus */}
        <button className="w-full mt-3 py-2 text-white/70 text-sm hover:text-white transition-colors">
          🎬 Watch ad for +50 bonus coins
        </button>
      </motion.div>
    </motion.div>
  );
}
