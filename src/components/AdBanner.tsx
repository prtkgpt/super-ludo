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

  const watchRewardedAd = async () => {
    setWatching(true);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(i);
    }

    setWatching(false);
    onRewardEarned?.();
  };

  if (type === 'banner') {
    return (
      <div className="w-full h-12 bg-gray-50 flex items-center justify-center border-t border-gray-100">
        <span className="text-gray-300 text-xs font-medium">Ad Space</span>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full"
            style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
          >
            {watching ? (
              <div className="text-center py-4">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ background: '#FF385C' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </motion.div>
                <p className="text-gray-900 font-medium mb-4">Loading reward...</p>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FF385C, #E31C5F)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ background: '#FFF8E6' }}
                  >
                    <svg className="w-8 h-8" fill="#FFB400" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Get a Power-Up
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Watch a short video to earn a bonus
                  </p>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={watchRewardedAd}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)',
                      boxShadow: '0 4px 16px rgba(255, 56, 92, 0.3)',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Watch Video
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    No thanks
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
          className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50"
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="w-64 h-64 bg-gray-50 rounded-2xl flex items-center justify-center">
              <span className="text-gray-300 font-medium">Ad Content</span>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="mb-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
