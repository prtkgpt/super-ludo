'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdBannerProps {
  type: 'banner' | 'rewarded' | 'interstitial';
  onRewardEarned?: () => void;
  onClose?: () => void;
}

export default function AdBanner({ type, onRewardEarned, onClose }: AdBannerProps) {
  const [watching, setWatching] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate watching a rewarded ad
  const watchRewardedAd = async () => {
    setWatching(true);

    // Simulate ad progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(i);
    }

    setWatching(false);
    onRewardEarned?.();
  };

  if (type === 'banner') {
    return (
      <div className="w-full h-14 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          {/* Placeholder for real ad integration */}
          <span className="opacity-50">Advertisement</span>
        </div>
      </div>
    );
  }

  if (type === 'rewarded') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-purple-500"
          >
            {watching ? (
              <div className="text-center">
                <p className="text-white text-lg mb-4">Watching ad...</p>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">{progress}%</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <span className="text-5xl">🎁</span>
                  <h3 className="text-xl font-bold text-white mt-3">
                    Free Power-Up!
                  </h3>
                  <p className="text-gray-300 text-sm mt-2">
                    Watch a short video to get a random power-up
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    No thanks
                  </button>
                  <button
                    onClick={watchRewardedAd}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-400 transition-colors"
                  >
                    Watch Ad
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (type === 'interstitial') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
        >
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">Advertisement</p>
            <div className="w-64 h-64 bg-gray-800 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Ad Content</span>
            </div>
            <motion.button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-white text-black rounded-full font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3 }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
