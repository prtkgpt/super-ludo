'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import Dice from '@/components/Dice';
import PlayerInfo from '@/components/PlayerInfo';
import Notification from '@/components/Notification';
import GameOverModal from '@/components/GameOverModal';
import AdBanner from '@/components/AdBanner';

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={endGame}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-800">Ludo Rush</h1>
          <p className="text-xs text-gray-500">Turn {gameState.turnCount}</p>
        </div>

        <button
          onClick={() => showRewardedAd('shield')}
          className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center hover:bg-amber-200 transition-colors"
        >
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </header>

      {/* Player info bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                currentPlayer.color === 'red' ? '#DC2626' :
                currentPlayer.color === 'blue' ? '#2563EB' :
                currentPlayer.color === 'green' ? '#16A34A' : '#CA8A04'
            }}
          />
          <span className="font-medium text-gray-800">
            {currentPlayer.name}&apos;s turn
          </span>
          {currentPlayer.isAI && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              AI
            </span>
          )}
        </div>
      </div>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <GameBoard />

        {/* Dice and controls */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Dice />

          {/* Help text */}
          {gameState.phase === 'selectingToken' && !currentPlayer.isAI && (
            <motion.p
              className="text-sm text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Tap a glowing token to move
            </motion.p>
          )}

          {gameState.phase === 'rolling' && !currentPlayer.isAI && (
            <motion.p
              className="text-sm text-gray-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Tap the dice to roll
            </motion.p>
          )}
        </motion.div>
      </main>

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
