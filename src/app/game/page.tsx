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

  // Redirect to home if no game is active
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={endGame}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">Ludo Rush</h1>
          <p className="text-xs text-gray-400">Turn {gameState.turnCount}</p>
        </div>
        <button
          onClick={() => showRewardedAd('shield')}
          className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/50 transition-colors"
        >
          🎁
        </button>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-4">
        <PlayerInfo />
        <GameBoard />

        {/* Dice and controls */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Dice />

          {/* Help text */}
          {gameState.phase === 'selectingToken' && !currentPlayer.isAI && (
            <motion.p
              className="text-sm text-gray-400 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Tap a glowing token to move, tap again to confirm
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
