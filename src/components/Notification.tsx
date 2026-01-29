'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const typeConfig = {
  info: {
    bg: '#428BF9',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  success: {
    bg: '#00A699',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  warning: {
    bg: '#FFB400',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
};

export default function Notification() {
  const { notification, clearNotification } = useGameStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          onClick={clearNotification}
        >
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm cursor-pointer"
            style={{
              backgroundColor: typeConfig[notification.type].bg,
              boxShadow: `0 4px 16px ${typeConfig[notification.type].bg}40`,
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {typeConfig[notification.type].icon}
            </svg>
            {notification.message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
