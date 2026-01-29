'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function Home() {
  const router = useRouter();
  const { username, setUsername, difficulty, setDifficulty, startGame } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [localUsername, setLocalUsername] = useState(username);

  const handleStartGame = (players: number, aiPlayers: number) => {
    if (localUsername.trim()) {
      setUsername(localUsername.trim());
    }
    startGame(players, aiPlayers);
    router.push('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
          animate={{
            textShadow: [
              '0 0 20px rgba(255,255,0,0.5)',
              '0 0 40px rgba(255,0,0,0.5)',
              '0 0 20px rgba(255,255,0,0.5)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          LUDO RUSH
        </motion.h1>
        <p className="text-gray-400 mt-2">The Ultimate Board Game</p>
      </motion.div>

      {/* Main menu */}
      {!showSettings ? (
        <motion.div
          className="w-full max-w-sm space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Username input */}
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <label className="text-gray-300 text-sm mb-2 block">Your Name</label>
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={15}
            />
          </div>

          {/* Quick play options */}
          <motion.button
            onClick={() => handleStartGame(2, 1)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Quick Match (vs 1 AI)
          </motion.button>

          <motion.button
            onClick={() => handleStartGame(4, 3)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            4 Players (vs 3 AI)
          </motion.button>

          <motion.button
            onClick={() => handleStartGame(2, 0)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Pass and Play (2 Players)
          </motion.button>

          {/* Settings and other options */}
          <div className="flex gap-3 pt-2">
            <motion.button
              onClick={() => setShowSettings(true)}
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Settings
            </motion.button>
            <motion.button
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Leaderboard
            </motion.button>
          </div>

          {/* Daily bonus */}
          <motion.button
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: [
                '0 0 0 rgba(255,200,0,0.4)',
                '0 0 20px rgba(255,200,0,0.6)',
                '0 0 0 rgba(255,200,0,0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Claim Daily Bonus!
          </motion.button>
        </motion.div>
      ) : (
        /* Settings panel */
        <motion.div
          className="w-full max-w-sm space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-2 block">AI Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`
                      py-2 rounded-lg font-medium capitalize transition-all
                      ${difficulty === diff
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <span className="text-gray-300">Sound Effects</span>
              <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            {/* Vibration toggle */}
            <div className="flex items-center justify-between py-3 border-t border-white/10">
              <span className="text-gray-300">Vibration</span>
              <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
          >
            Back to Menu
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <motion.p
        className="absolute bottom-4 text-gray-500 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Made with love - v1.0.0
      </motion.p>
    </div>
  );
}
