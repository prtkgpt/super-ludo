'use client';

import { motion } from 'framer-motion';
import { Token as TokenType, PlayerColor } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface TokenProps {
  token: TokenType;
  position: { x: number; y: number };
  isSelectable: boolean;
  isSelected: boolean;
  size?: number;
}

const colorClasses: Record<PlayerColor, string> = {
  red: 'bg-gradient-to-br from-red-400 to-red-600 border-red-700',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700',
  green: 'bg-gradient-to-br from-green-400 to-green-600 border-green-700',
  yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-700',
};

const glowColors: Record<PlayerColor, string> = {
  red: 'shadow-red-500/50',
  blue: 'shadow-blue-500/50',
  green: 'shadow-green-500/50',
  yellow: 'shadow-yellow-500/50',
};

export default function Token({
  token,
  position,
  isSelectable,
  isSelected,
  size = 32,
}: TokenProps) {
  const { selectToken, confirmMove, selectedToken } = useGameStore();

  const handleClick = () => {
    if (!isSelectable) return;

    if (isSelected) {
      // Confirm the move
      confirmMove();
    } else {
      // Select this token
      selectToken(token);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isSelectable}
      className={`
        absolute rounded-full border-2
        ${colorClasses[token.color]}
        ${isSelectable ? 'cursor-pointer' : 'cursor-default'}
        ${isSelected ? `ring-4 ring-white ${glowColors[token.color]} shadow-lg` : ''}
        transition-all duration-200
      `}
      style={{
        width: size,
        height: size,
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={false}
      animate={{
        x: 0,
        y: 0,
        scale: isSelected ? 1.2 : 1,
      }}
      whileHover={isSelectable ? { scale: 1.15 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Shield indicator */}
      {token.isShielded && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Selection pulse */}
      {isSelectable && !isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Inner shine */}
      <div
        className="absolute top-1 left-1 w-2 h-2 bg-white/40 rounded-full"
        style={{ width: size / 4, height: size / 4 }}
      />
    </motion.button>
  );
}
