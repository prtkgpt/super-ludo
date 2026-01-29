'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

// Dice dot positions for each face
const DOT_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
};

function DiceFace({ value }: { value: number }) {
  const dots = DOT_POSITIONS[value] || [];

  return (
    <div className="relative w-full h-full">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: value === 1 ? '20%' : '16%',
            height: value === 1 ? '20%' : '16%',
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            transform: 'translate(-50%, -50%)',
            background: value === 1 ? '#FF385C' : '#222222',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
      ))}
    </div>
  );
}

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
        className="relative"
        whileHover={canRoll && isPlayerTurn ? { scale: 1.05, y: -2 } : {}}
        whileTap={canRoll && isPlayerTurn ? { scale: 0.95 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {/* Dice container */}
        <motion.div
          className="relative"
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F5F5 100%)',
            boxShadow: canRoll && isPlayerTurn
              ? '0 8px 24px rgba(255, 56, 92, 0.2), 0 4px 12px rgba(0,0,0,0.1)'
              : '0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
            cursor: canRoll && isPlayerTurn ? 'pointer' : 'default',
            padding: 8,
          }}
          animate={dice.isRolling ? {
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Inner face */}
          <div
            className="w-full h-full rounded-xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid #EBEBEB',
            }}
          >
            {dice.isRolling ? (
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  className="w-4 h-4 rounded-full bg-gray-300"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
              </div>
            ) : (
              <DiceFace value={dice.value} />
            )}
          </div>
        </motion.div>

        {/* Glow effect for 6 */}
        {dice.value === 6 && !dice.isRolling && (
          <motion.div
            className="absolute -inset-2 rounded-2xl pointer-events-none"
            style={{ border: '2px solid #FFB400' }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Tap hint for active state */}
        {canRoll && isPlayerTurn && !dice.isRolling && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: '#FF385C',
                color: 'white',
                boxShadow: '0 2px 8px rgba(255, 56, 92, 0.3)',
              }}
            >
              Tap to roll
            </div>
          </motion.div>
        )}
      </motion.button>

      {/* AI thinking indicator */}
      {currentPlayer.isAI && (phase === 'rolling' || phase === 'selectingToken') && (
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: '#F7F7F7' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="flex gap-1"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <div className="w-2 h-2 rounded-full bg-gray-400" />
          </motion.div>
          <span className="text-sm text-gray-500 font-medium">
            {currentPlayer.name} is thinking
          </span>
        </motion.div>
      )}
    </div>
  );
}
