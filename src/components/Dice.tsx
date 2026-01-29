'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const diceFaces: Record<number, React.ReactNode> = {
  1: (
    <div className="grid place-items-center w-full h-full">
      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg" />
    </div>
  ),
  2: (
    <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
      <div className="w-3 h-3 bg-gray-800 rounded-full place-self-start" />
      <div className="col-start-2 row-start-2 w-3 h-3 bg-gray-800 rounded-full place-self-end" />
    </div>
  ),
  3: (
    <div className="relative w-full h-full p-2">
      <div className="absolute top-2 left-2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute bottom-2 right-2 w-3 h-3 bg-gray-800 rounded-full" />
    </div>
  ),
  4: (
    <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
      <div className="w-3 h-3 bg-gray-800 rounded-full" />
      <div className="w-3 h-3 bg-gray-800 rounded-full justify-self-end" />
      <div className="w-3 h-3 bg-gray-800 rounded-full" />
      <div className="w-3 h-3 bg-gray-800 rounded-full justify-self-end" />
    </div>
  ),
  5: (
    <div className="relative w-full h-full p-2">
      <div className="absolute top-2 left-2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute top-2 right-2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute bottom-2 left-2 w-3 h-3 bg-gray-800 rounded-full" />
      <div className="absolute bottom-2 right-2 w-3 h-3 bg-gray-800 rounded-full" />
    </div>
  ),
  6: (
    <div className="grid grid-cols-2 gap-y-1 p-2 w-full h-full">
      <div className="w-3 h-3 bg-gray-800 rounded-full" />
      <div className="w-3 h-3 bg-gray-800 rounded-full justify-self-end" />
      <div className="w-3 h-3 bg-gray-800 rounded-full" />
      <div className="w-3 h-3 bg-gray-800 rounded-full justify-self-end" />
      <div className="w-3 h-3 bg-gray-800 rounded-full" />
      <div className="w-3 h-3 bg-gray-800 rounded-full justify-self-end" />
    </div>
  ),
};

export default function Dice() {
  const { gameState, rollDice } = useGameStore();

  if (!gameState) return null;

  const { dice, phase } = gameState;
  const canRoll = phase === 'rolling' && dice.canRoll && !dice.isRolling;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.isAI;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={() => canRoll && isPlayerTurn && rollDice()}
        disabled={!canRoll || !isPlayerTurn}
        className={`
          relative w-20 h-20 rounded-xl shadow-2xl
          ${canRoll && isPlayerTurn ? 'bg-white cursor-pointer' : 'bg-gray-200 cursor-not-allowed'}
          border-4 border-gray-300
          transition-all duration-200
        `}
        animate={dice.isRolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 360, 720, 1080],
          scale: [1, 1.1, 1, 1.1, 1],
        } : {}}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        whileHover={canRoll && isPlayerTurn ? { scale: 1.1 } : {}}
        whileTap={canRoll && isPlayerTurn ? { scale: 0.95 } : {}}
      >
        {dice.isRolling ? (
          <div className="w-full h-full flex items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-gray-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              ?
            </motion.span>
          </div>
        ) : (
          diceFaces[dice.value]
        )}

        {/* Glow effect for 6 */}
        {dice.value === 6 && !dice.isRolling && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-yellow-400 -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Roll prompt */}
      {canRoll && isPlayerTurn && (
        <motion.p
          className="text-sm font-medium text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Tap to roll!
        </motion.p>
      )}

      {/* AI thinking indicator */}
      {currentPlayer.isAI && phase === 'rolling' && (
        <motion.p
          className="text-sm font-medium text-yellow-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {currentPlayer.name} is thinking...
        </motion.p>
      )}
    </div>
  );
}
