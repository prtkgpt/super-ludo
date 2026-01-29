'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import Dice from '@/components/Dice';
import Notification from '@/components/Notification';
import GameOverModal from '@/components/GameOverModal';
import AdBanner from '@/components/AdBanner';

// Player color mapping
const PLAYER_COLORS = {
  red: { primary: '#FF385C', light: '#FFF1F3' },
  blue: { primary: '#428BF9', light: '#EEF5FF' },
  green: { primary: '#00A699', light: '#E8FAF8' },
  yellow: { primary: '#FFB400', light: '#FFF8E6' },
};

export default function GamePage() {
  const router = useRouter();
  const { gameState, endGame, showRewardedAd } = useGameStore();

  useEffect(() => {
    if (!gameState) {
      router.push('/');
    }
  }, [gameState, router]);

  if (!gameState) {
    return null;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const playerColor = PLAYER_COLORS[currentPlayer.color];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <motion.button
          onClick={endGame}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">Ludo</h1>
          <p className="text-xs text-gray-400">Turn {gameState.turnCount}</p>
        </div>

        <motion.button
          onClick={() => showRewardedAd('shield')}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.button>
      </header>

      {/* Current player indicator */}
      <motion.div
        className="px-4 py-3 flex items-center justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            backgroundColor: playerColor.light,
            boxShadow: `0 2px 8px ${playerColor.primary}20`
          }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: playerColor.primary }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-medium text-gray-800 text-sm">
            {currentPlayer.name}&apos;s turn
          </span>
          {currentPlayer.isAI && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: playerColor.primary,
                color: 'white'
              }}
            >
              AI
            </span>
          )}
        </div>
      </motion.div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 gap-4">
        <GameBoard />

        {/* Dice and controls */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Dice />

          {/* Help text */}
          {gameState.phase === 'selectingToken' && !currentPlayer.isAI && (
            <motion.p
              className="text-sm text-gray-400 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Select a token to move
            </motion.p>
          )}
        </motion.div>
      </main>

      {/* Player scores */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex justify-center gap-4">
          {gameState.players.map((player) => {
            const color = PLAYER_COLORS[player.color];
            const finishedCount = player.tokens.filter(t => t.position === 57).length;
            return (
              <motion.div
                key={player.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: player.id === currentPlayer.id ? color.light : '#F7F7F7',
                  border: player.id === currentPlayer.id ? `2px solid ${color.primary}` : '2px solid transparent'
                }}
                animate={player.id === currentPlayer.id ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color.primary }}
                />
                <span className="text-xs font-medium text-gray-700">
                  {finishedCount}/4
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom ad banner */}
      <AdBanner type="banner" />

      {/* Notifications */}
      <Notification />

      {/* Game Over Modal */}
      <GameOverModal />

      {/* Rewarded Ad Modal */}
      {gameState.showRewardedAd && (
        <AdBanner
          type="rewarded"
          onRewardEarned={() => useGameStore.getState().claimAdReward()}
          onClose={() => useGameStore.setState((s) => ({
            gameState: s.gameState ? { ...s.gameState, showRewardedAd: false } : null
          }))}
        />
      )}
    </div>
  );
}
