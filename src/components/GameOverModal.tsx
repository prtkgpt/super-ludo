'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const PLAYER_COLORS = {
  red: '#FF385C',
  blue: '#428BF9',
  green: '#00A699',
  yellow: '#FFB400',
};

export default function GameOverModal() {
  const { gameState, endGame, startGame } = useGameStore();

  useEffect(() => {
    if (gameState?.winner && !gameState.winner.isAI) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF385C', '#428BF9', '#00A699', '#FFB400'],
      });
    }
  }, [gameState?.winner]);

  if (!gameState?.winner) return null;

  const isPlayerWin = !gameState.winner.isAI;
  const winnerColor = PLAYER_COLORS[gameState.winner.color];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
      >
        {/* Winner indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${winnerColor} 0%, ${winnerColor}DD 100%)`,
            boxShadow: `0 8px 24px ${winnerColor}40`,
          }}
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            {isPlayerWin ? (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            ) : (
              <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 14l7-7-1.41-1.41L12 14.17l-2.59-2.58L8 13l4 4z" />
            )}
          </svg>
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPlayerWin ? 'Congratulations!' : `${gameState.winner.name} Wins`}
        </h2>

        <p className="text-gray-500 mb-6">
          {isPlayerWin
            ? 'You played brilliantly!'
            : `Better luck next time!`}
        </p>

        {/* Stats */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-around">
            <div>
              <p className="text-2xl font-bold text-gray-900">{gameState.turnCount}</p>
              <p className="text-xs text-gray-500">Turns</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {gameState.winner.tokens.filter(t => t.position === 57).length}
              </p>
              <p className="text-xs text-gray-500">Tokens Home</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={() => {
              endGame();
              startGame(4, 3);
            }}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
              boxShadow: '0 4px 16px rgba(255, 56, 92, 0.3)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>

          <motion.button
            onClick={endGame}
            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
