'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

// Classic dice dot patterns
function DiceFace({ value }: { value: number }) {
  const dotClass = "w-3 h-3 bg-gray-800 rounded-full";
  const redDotClass = "w-4 h-4 bg-red-600 rounded-full";

  const patterns: Record<number, React.ReactNode> = {
    1: (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={redDotClass} />
      </div>
    ),
    2: (
      <>
        <div className="absolute top-3 right-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 left-3"><div className={dotClass} /></div>
      </>
    ),
    3: (
      <>
        <div className="absolute top-3 right-3"><div className={dotClass} /></div>
        <div className="absolute inset-0 flex items-center justify-center"><div className={dotClass} /></div>
        <div className="absolute bottom-3 left-3"><div className={dotClass} /></div>
      </>
    ),
    4: (
      <>
        <div className="absolute top-3 left-3"><div className={dotClass} /></div>
        <div className="absolute top-3 right-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 left-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 right-3"><div className={dotClass} /></div>
      </>
    ),
    5: (
      <>
        <div className="absolute top-3 left-3"><div className={dotClass} /></div>
        <div className="absolute top-3 right-3"><div className={dotClass} /></div>
        <div className="absolute inset-0 flex items-center justify-center"><div className={dotClass} /></div>
        <div className="absolute bottom-3 left-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 right-3"><div className={dotClass} /></div>
      </>
    ),
    6: (
      <>
        <div className="absolute top-3 left-3"><div className={dotClass} /></div>
        <div className="absolute top-3 right-3"><div className={dotClass} /></div>
        <div className="absolute top-1/2 -translate-y-1/2 left-3"><div className={dotClass} /></div>
        <div className="absolute top-1/2 -translate-y-1/2 right-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 left-3"><div className={dotClass} /></div>
        <div className="absolute bottom-3 right-3"><div className={dotClass} /></div>
      </>
    ),
  };

  return <div className="relative w-full h-full">{patterns[value]}</div>;
}

export default function Dice() {
  const { gameState, rollDice } = useGameStore();

  if (!gameState) return null;

  const { dice, phase } = gameState;
  const canRoll = phase === 'rolling' && dice.canRoll && !dice.isRolling;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = !currentPlayer.isAI;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={() => canRoll && isPlayerTurn && rollDice()}
        disabled={!canRoll || !isPlayerTurn}
        className={`
          relative w-16 h-16 rounded-lg
          bg-white
          border-2 border-gray-300
          shadow-lg
          ${canRoll && isPlayerTurn ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-80'}
          transition-shadow duration-200
        `}
        animate={dice.isRolling ? {
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1, 1.1, 1],
        } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        whileHover={canRoll && isPlayerTurn ? { scale: 1.05 } : {}}
        whileTap={canRoll && isPlayerTurn ? { scale: 0.95 } : {}}
      >
        {dice.isRolling ? (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              className="w-4 h-4 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
          </div>
        ) : (
          <DiceFace value={dice.value} />
        )}

        {/* Highlight for 6 */}
        {dice.value === 6 && !dice.isRolling && (
          <motion.div
            className="absolute -inset-1 rounded-xl border-2 border-amber-400 pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* AI thinking indicator */}
      {currentPlayer.isAI && (phase === 'rolling' || phase === 'selectingToken') && (
        <motion.p
          className="text-sm font-medium text-gray-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {currentPlayer.name} is thinking...
        </motion.p>
      )}
    </div>
  );
}
