'use client';

import { motion } from 'framer-motion';
import { Token as TokenType, PlayerColor } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

interface TokenProps {
  token: TokenType;
  position: { x: number; y: number };
  isSelectable: boolean;
  isSelected: boolean;
}

const COLORS: Record<PlayerColor, { main: string; dark: string; light: string }> = {
  red: { main: '#DC2626', dark: '#991B1B', light: '#FCA5A5' },
  blue: { main: '#2563EB', dark: '#1E40AF', light: '#93C5FD' },
  green: { main: '#16A34A', dark: '#166534', light: '#86EFAC' },
  yellow: { main: '#CA8A04', dark: '#A16207', light: '#FDE047' },
};

export default function Token({
  token,
  position,
  isSelectable,
  isSelected,
}: TokenProps) {
  const { selectToken, confirmMove } = useGameStore();
  const color = COLORS[token.color];

  const handleClick = () => {
    if (!isSelectable) return;

    if (isSelected) {
      confirmMove();
    } else {
      selectToken(token);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={!isSelectable}
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 50 : isSelectable ? 40 : 30,
      }}
      animate={{
        scale: isSelected ? 1.3 : 1,
      }}
      whileHover={isSelectable ? { scale: 1.2 } : {}}
      whileTap={isSelectable ? { scale: 0.9 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Pulsing selection indicator */}
      {isSelectable && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color.main,
            width: 28,
            height: 28,
            left: -2,
            top: -2,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Token body - Classic pawn shape */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={isSelectable ? 'cursor-pointer' : 'cursor-default'}
      >
        {/* Shadow */}
        <ellipse cx="12" cy="22" rx="8" ry="2" fill="rgba(0,0,0,0.2)" />

        {/* Base */}
        <ellipse cx="12" cy="20" rx="8" ry="3" fill={color.dark} />

        {/* Body */}
        <path
          d="M6 20 C6 14, 8 10, 12 10 C16 10, 18 14, 18 20"
          fill={color.main}
        />

        {/* Head */}
        <circle cx="12" cy="7" r="5" fill={color.main} />

        {/* Highlight on head */}
        <circle cx="10" cy="5" r="2" fill={color.light} opacity="0.6" />

        {/* Selection ring */}
        {isSelected && (
          <circle
            cx="12"
            cy="12"
            r="11"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Shield indicator */}
      {token.isShielded && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center text-xs"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🛡
        </motion.div>
      )}
    </motion.button>
  );
}
