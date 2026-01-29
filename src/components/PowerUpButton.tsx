'use client';

import { motion } from 'framer-motion';
import { PowerUp } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface PowerUpButtonProps {
  powerUp: PowerUp;
  index: number;
}

export default function PowerUpButton({ powerUp, index }: PowerUpButtonProps) {
  const { usePowerUp, gameState } = useGameStore();

  const handleUse = () => {
    // For simple power-ups, use immediately
    // For targeting power-ups (sniper, freeze, shield), would need additional UI
    if (['reroll', 'speedBoost'].includes(powerUp.type)) {
      usePowerUp(powerUp);
    } else {
      // Show targeting UI (simplified for now - just use on first valid target)
      usePowerUp(powerUp);
    }
  };

  return (
    <motion.button
      onClick={handleUse}
      className="relative flex flex-col items-center justify-center p-2 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg border-2 border-purple-400"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl">{powerUp.icon}</span>
      <span className="text-xs text-white font-medium mt-1">{powerUp.name}</span>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-purple-400 -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}
