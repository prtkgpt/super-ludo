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

// Premium Airbnb-inspired colors
const COLORS: Record<PlayerColor, { primary: string; gradient: string; shadow: string }> = {
  red: {
    primary: '#FF385C',
    gradient: 'linear-gradient(180deg, #FF5A79 0%, #E31C5F 100%)',
    shadow: '0 4px 12px rgba(255, 56, 92, 0.4)',
  },
  blue: {
    primary: '#428BF9',
    gradient: 'linear-gradient(180deg, #5FA0FF 0%, #2E7AF0 100%)',
    shadow: '0 4px 12px rgba(66, 139, 249, 0.4)',
  },
  green: {
    primary: '#00A699',
    gradient: 'linear-gradient(180deg, #00C4B4 0%, #008F84 100%)',
    shadow: '0 4px 12px rgba(0, 166, 153, 0.4)',
  },
  yellow: {
    primary: '#FFB400',
    gradient: 'linear-gradient(180deg, #FFC933 0%, #E6A200 100%)',
    shadow: '0 4px 12px rgba(255, 180, 0, 0.4)',
  },
};

export default function Token({ token, position, isSelectable, isSelected }: TokenProps) {
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
        zIndex: isSelected ? 50 : isSelectable ? 40 : 30,
      }}
      initial={false}
      animate={{
        scale: isSelected ? 1.2 : 1,
        y: isSelected ? -4 : 0,
      }}
      whileHover={isSelectable ? { scale: 1.15, y: -2 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Selection ring pulse */}
      {isSelectable && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 36,
            height: 36,
            left: -6,
            top: -6,
            border: `2px solid ${color.primary}`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Token body */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          background: color.gradient,
          boxShadow: isSelected
            ? `${color.shadow}, 0 0 0 3px white, 0 0 0 5px ${color.primary}`
            : color.shadow,
          transform: 'translate(-50%, -50%)',
          cursor: isSelectable ? 'pointer' : 'default',
        }}
      >
        {/* Shine effect */}
        <div
          className="absolute rounded-full"
          style={{
            width: 8,
            height: 8,
            top: 3,
            left: 4,
            background: 'rgba(255,255,255,0.4)',
          }}
        />

        {/* Inner dot */}
        <div
          className="rounded-full"
          style={{
            width: 6,
            height: 6,
            background: 'rgba(255,255,255,0.3)',
          }}
        />
      </div>

      {/* Shield indicator */}
      {token.isShielded && (
        <motion.div
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center text-xs"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="#00A699">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
