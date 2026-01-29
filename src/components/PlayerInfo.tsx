'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PlayerColor } from '@/types/game';
import PowerUpButton from './PowerUpButton';

const colorClasses: Record<PlayerColor, string> = {
  red: 'from-red-500 to-red-700 border-red-400',
  blue: 'from-blue-500 to-blue-700 border-blue-400',
  green: 'from-green-500 to-green-700 border-green-400',
  yellow: 'from-yellow-500 to-yellow-700 border-yellow-400',
};

export default function PlayerInfo() {
  const { gameState } = useGameStore();

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Current player indicator */}
      <motion.div
        key={currentPlayer.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-gradient-to-r ${colorClasses[currentPlayer.color]}
          rounded-xl p-3 border-2 shadow-lg mb-3
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {currentPlayer.isAI ? '🤖' : '👤'}
            </div>
            <div>
              <p className="text-white font-bold">{currentPlayer.name}</p>
              <p className="text-white/70 text-xs">
                {currentPlayer.isAI ? 'AI' : 'Your turn'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-bold">💰 {currentPlayer.coins}</p>
            <p className="text-white/70 text-xs">
              {currentPlayer.tokens.filter(t => t.position === 57).length}/4 home
            </p>
          </div>
        </div>
      </motion.div>

      {/* All players status */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {gameState.players.map((player, index) => {
          const isCurrentPlayer = index === gameState.currentPlayerIndex;
          const tokensHome = player.tokens.filter(t => t.position === 57).length;

          return (
            <motion.div
              key={player.id}
              className={`
                p-2 rounded-lg text-center text-xs
                ${isCurrentPlayer
                  ? `bg-gradient-to-br ${colorClasses[player.color]} text-white`
                  : 'bg-gray-800 text-gray-400'
                }
              `}
              animate={isCurrentPlayer ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: isCurrentPlayer ? Infinity : 0 }}
            >
              <div className="font-medium truncate">{player.name}</div>
              <div className="flex justify-center gap-1 mt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`
                      w-2 h-2 rounded-full
                      ${i < tokensHome ? 'bg-white' : 'bg-white/30'}
                    `}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Power-ups for current player (if human) */}
      {!currentPlayer.isAI && currentPlayer.powerUps.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-3">
          <p className="text-white text-sm font-medium mb-2">Your Power-ups:</p>
          <div className="flex gap-2 flex-wrap">
            {currentPlayer.powerUps.map((powerUp, index) => (
              <PowerUpButton key={`${powerUp.type}-${index}`} powerUp={powerUp} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
