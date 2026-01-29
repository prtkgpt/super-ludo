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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ludo board icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-xl shadow-lg overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#F3F4F6" />
            <rect x="0" y="0" width="40" height="40" fill="#FEE2E2" />
            <rect x="60" y="0" width="40" height="40" fill="#DBEAFE" />
            <rect x="0" y="60" width="40" height="40" fill="#DCFCE7" />
            <rect x="60" y="60" width="40" height="40" fill="#FEF9C3" />
            <rect x="40" y="0" width="20" height="100" fill="#FFFFFF" />
            <rect x="0" y="40" width="100" height="20" fill="#FFFFFF" />
            <polygon points="40,40 50,50 60,40" fill="#2563EB" />
            <polygon points="60,40 50,50 60,60" fill="#CA8A04" />
            <polygon points="60,60 50,50 40,60" fill="#16A34A" />
            <polygon points="40,60 50,50 40,40" fill="#DC2626" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800">Ludo Rush</h1>
        <p className="text-gray-500 mt-1">Classic Board Game</p>
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
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <label className="text-gray-600 text-sm mb-2 block">Your Name</label>
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
              maxLength={15}
            />
          </div>

          {/* Game modes */}
          <motion.button
            onClick={() => handleStartGame(2, 1)}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold text-lg shadow-sm hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Quick Match (vs 1 AI)
          </motion.button>

          <motion.button
            onClick={() => handleStartGame(4, 3)}
            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold text-lg shadow-sm hover:bg-green-600 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            4 Players (vs 3 AI)
          </motion.button>

          <motion.button
            onClick={() => handleStartGame(2, 0)}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-semibold text-lg shadow-sm hover:bg-amber-600 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Pass and Play (2 Players)
          </motion.button>

          {/* Settings button */}
          <div className="pt-2">
            <motion.button
              onClick={() => setShowSettings(true)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Settings
            </motion.button>
          </div>
        </motion.div>
      ) : (
        /* Settings panel */
        <motion.div
          className="w-full max-w-sm space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>

            {/* Difficulty */}
            <div className="mb-4">
              <label className="text-gray-600 text-sm mb-2 block">AI Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`
                      py-2 rounded-lg font-medium capitalize transition-all
                      ${difficulty === diff
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Menu
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <motion.p
        className="absolute bottom-4 text-gray-400 text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        v1.0.0
      </motion.p>
    </div>
  );
}
