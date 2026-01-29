'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

const typeStyles = {
  info: 'bg-blue-500 border-blue-400',
  success: 'bg-green-500 border-green-400',
  warning: 'bg-amber-500 border-amber-400',
};

export default function Notification() {
  const { notification, clearNotification } = useGameStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            px-4 py-2 rounded-full border-2 shadow-lg
            ${typeStyles[notification.type]}
            text-white font-medium text-sm
          `}
          onClick={clearNotification}
        >
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
