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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="w-10" />
        <h1 className="text-lg font-semibold text-gray-900">Ludo</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {!showSettings ? (
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Logo/Hero */}
            <div className="text-center mb-10">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-3xl overflow-hidden"
                style={{ boxShadow: '0 8px 32px rgba(255, 56, 92, 0.2)' }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="#FAFAFA" />
                  <rect x="0" y="0" width="40" height="40" fill="#FFF1F3" />
                  <rect x="60" y="0" width="40" height="40" fill="#EEF5FF" />
                  <rect x="0" y="60" width="40" height="40" fill="#E8FAF8" />
                  <rect x="60" y="60" width="40" height="40" fill="#FFF8E6" />
                  <rect x="40" y="0" width="20" height="100" fill="#FFFFFF" />
                  <rect x="0" y="40" width="100" height="20" fill="#FFFFFF" />
                  <polygon points="40,40 50,50 60,40" fill="#428BF9" />
                  <polygon points="60,40 50,50 60,60" fill="#FFB400" />
                  <polygon points="60,60 50,50 40,60" fill="#00A699" />
                  <polygon points="40,60 50,50 40,40" fill="#FF385C" />
                  <circle cx="20" cy="20" r="8" fill="#FF385C" />
                  <circle cx="80" cy="20" r="8" fill="#428BF9" />
                  <circle cx="20" cy="80" r="8" fill="#00A699" />
                  <circle cx="80" cy="80" r="8" fill="#FFB400" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Play Ludo</h2>
              <p className="text-gray-500">The classic board game, reimagined</p>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
              <input
                type="text"
                value={localUsername}
                onChange={(e) => setLocalUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                maxLength={15}
              />
            </div>

            {/* Game mode buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={() => handleStartGame(2, 1)}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
                  boxShadow: '0 4px 16px rgba(255, 56, 92, 0.3)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(255, 56, 92, 0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Game
                </div>
                <span className="text-sm opacity-80 font-normal">Play against 1 AI opponent</span>
              </motion.button>

              <motion.button
                onClick={() => handleStartGame(4, 3)}
                className="w-full py-4 px-6 rounded-xl font-semibold text-gray-900 border-2 border-gray-200 hover:border-gray-900 transition-all bg-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  4 Players
                </div>
                <span className="text-sm text-gray-500 font-normal">Full game with 3 AI opponents</span>
              </motion.button>

              <motion.button
                onClick={() => handleStartGame(2, 0)}
                className="w-full py-4 px-6 rounded-xl font-semibold text-gray-900 border-2 border-gray-200 hover:border-gray-900 transition-all bg-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Pass and Play
                </div>
                <span className="text-sm text-gray-500 font-normal">Play with a friend on same device</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">AI Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`
                        py-3 rounded-xl font-medium capitalize transition-all
                        ${difficulty === diff
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Ludo v1.0.0
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-8 w-full py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Done
            </button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">Made with care</p>
      </footer>
    </div>
  );
}
