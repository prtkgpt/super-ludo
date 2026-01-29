'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import Token from './Token';
import {
  PlayerColor,
  BOARD_SIZE,
  START_POSITIONS,
  SAFE_TILES,
  BOOST_TILES,
  MYSTERY_TILES,
  WARP_TILES,
  COIN_TILES,
} from '@/types/game';

const colorSchemes: Record<PlayerColor, { bg: string; light: string; dark: string }> = {
  red: { bg: 'bg-red-500', light: 'bg-red-300', dark: 'bg-red-700' },
  blue: { bg: 'bg-blue-500', light: 'bg-blue-300', dark: 'bg-blue-700' },
  green: { bg: 'bg-green-500', light: 'bg-green-300', dark: 'bg-green-700' },
  yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-300', dark: 'bg-yellow-700' },
};

// Calculate tile position on the board (returns percentage coordinates)
function getTilePosition(index: number): { x: number; y: number } {
  // Board is laid out as a cross pattern
  // Main track goes around the outside, home stretch goes to center

  const gridSize = 15;
  const cellSize = 100 / gridSize;

  // Define the path around the board (simplified cross pattern)
  // This creates a clockwise path starting from bottom-left going up
  const pathPositions: { x: number; y: number }[] = [];

  // Bottom left to top left (red's path)
  for (let i = 6; i >= 1; i--) pathPositions.push({ x: 0, y: i });
  pathPositions.push({ x: 0, y: 0 });

  // Top left going right
  for (let i = 1; i <= 5; i++) pathPositions.push({ x: i, y: 0 });

  // Top middle down to center
  pathPositions.push({ x: 6, y: 0 });
  pathPositions.push({ x: 6, y: 1 });

  // Around blue's corner
  for (let i = 2; i <= 6; i++) pathPositions.push({ x: 6, y: i });

  // Across to right
  for (let i = 7; i <= 14; i++) pathPositions.push({ x: i, y: 6 });

  // Down on right side
  pathPositions.push({ x: 14, y: 7 });
  pathPositions.push({ x: 14, y: 8 });

  // Around yellow's corner
  for (let i = 14; i >= 9; i--) pathPositions.push({ x: i, y: 8 });

  // Down to bottom right
  for (let i = 9; i <= 14; i++) pathPositions.push({ x: 8, y: i });

  // Bottom right going left
  pathPositions.push({ x: 7, y: 14 });
  for (let i = 6; i >= 0; i--) pathPositions.push({ x: i, y: 14 });

  // Up on left side
  pathPositions.push({ x: 0, y: 13 });
  for (let i = 12; i >= 8; i--) pathPositions.push({ x: 0, y: i });

  // Simplified: just map index to angle around board
  const angle = (index / BOARD_SIZE) * 2 * Math.PI - Math.PI / 2;
  const radius = 38;
  const centerX = 50;
  const centerY = 50;

  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

// Get home base position for a token
function getHomePosition(color: PlayerColor, tokenIndex: number): { x: number; y: number } {
  const homePositions: Record<PlayerColor, { x: number; y: number }> = {
    red: { x: 20, y: 20 },
    blue: { x: 80, y: 20 },
    yellow: { x: 80, y: 80 },
    green: { x: 20, y: 80 },
  };

  const base = homePositions[color];
  const offsets = [
    { x: -5, y: -5 },
    { x: 5, y: -5 },
    { x: -5, y: 5 },
    { x: 5, y: 5 },
  ];

  return {
    x: base.x + offsets[tokenIndex].x,
    y: base.y + offsets[tokenIndex].y,
  };
}

// Get finish lane position
function getFinishPosition(color: PlayerColor, lanePosition: number): { x: number; y: number } {
  const directions: Record<PlayerColor, { dx: number; dy: number }> = {
    red: { dx: 1, dy: 0 },
    blue: { dx: 0, dy: 1 },
    yellow: { dx: -1, dy: 0 },
    green: { dx: 0, dy: -1 },
  };

  const dir = directions[color];
  const step = 5;

  return {
    x: 50 + dir.dx * (step * (lanePosition - 51)),
    y: 50 + dir.dy * (step * (lanePosition - 51)),
  };
}

export default function GameBoard() {
  const { gameState, validMoves, selectedToken } = useGameStore();

  if (!gameState) return null;

  // Render all tiles
  const tiles = useMemo(() => {
    return Array.from({ length: BOARD_SIZE }, (_, i) => {
      const pos = getTilePosition(i);
      let tileClass = 'bg-gray-200';
      let icon = '';

      if (SAFE_TILES.includes(i)) {
        tileClass = 'bg-gradient-to-br from-amber-300 to-yellow-400';
        icon = '⭐';
      } else if (BOOST_TILES.includes(i)) {
        tileClass = 'bg-gradient-to-br from-cyan-400 to-blue-500';
        icon = '🚀';
      } else if (MYSTERY_TILES.includes(i)) {
        tileClass = 'bg-gradient-to-br from-purple-400 to-pink-500';
        icon = '🎁';
      } else if (WARP_TILES.includes(i)) {
        tileClass = 'bg-gradient-to-br from-indigo-500 to-violet-600';
        icon = '🌀';
      } else if (COIN_TILES.includes(i)) {
        tileClass = 'bg-gradient-to-br from-yellow-400 to-orange-500';
        icon = '💰';
      }

      // Start positions
      const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
      for (const color of colors) {
        if (START_POSITIONS[color] === i) {
          tileClass = `${colorSchemes[color].bg}`;
        }
      }

      return (
        <motion.div
          key={i}
          className={`
            absolute w-6 h-6 rounded-md ${tileClass}
            border border-gray-300 shadow-sm
            flex items-center justify-center
          `}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.01 }}
        >
          {icon && <span className="text-xs">{icon}</span>}
        </motion.div>
      );
    });
  }, []);

  // Render home bases
  const homeBases = useMemo(() => {
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    const positions: Record<PlayerColor, { left: string; top: string }> = {
      red: { left: '10%', top: '10%' },
      blue: { left: '70%', top: '10%' },
      yellow: { left: '70%', top: '70%' },
      green: { left: '10%', top: '70%' },
    };

    return colors.map((color) => (
      <div
        key={color}
        className={`
          absolute w-[25%] h-[25%] rounded-2xl
          ${colorSchemes[color].light} border-4 ${colorSchemes[color].dark.replace('bg-', 'border-')}
          shadow-lg
        `}
        style={positions[color]}
      >
        <div className="absolute inset-2 rounded-xl bg-white/30" />
      </div>
    ));
  }, []);

  // Render center
  const center = (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%]">
      <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-300 border-4 border-gray-400 shadow-inner flex items-center justify-center">
        <span className="text-2xl">🏠</span>
      </div>
    </div>
  );

  // Render finish lanes
  const finishLanes = useMemo(() => {
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    return colors.map((color) => {
      const lanes = [];
      for (let i = 0; i < 6; i++) {
        const pos = getFinishPosition(color, 52 + i);
        lanes.push(
          <div
            key={`${color}-finish-${i}`}
            className={`
              absolute w-5 h-5 rounded
              ${colorSchemes[color].light} border ${colorSchemes[color].dark.replace('bg-', 'border-')}
            `}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      }
      return lanes;
    });
  }, []);

  // Render all tokens
  const tokens = gameState.players.flatMap((player, playerIndex) =>
    player.tokens.map((token, tokenIndex) => {
      let position: { x: number; y: number };

      if (token.position === -1) {
        // In home base
        position = getHomePosition(player.color, tokenIndex);
      } else if (token.position >= 52) {
        // In finish lane or finished
        position = token.position === 57
          ? { x: 50, y: 50 } // Center (finished)
          : getFinishPosition(player.color, token.position);
      } else {
        // On main track
        position = getTilePosition(token.position);
      }

      const isSelectable = validMoves.some((t) => t.id === token.id);
      const isSelected = selectedToken?.id === token.id;

      return (
        <Token
          key={token.id}
          token={token}
          position={position}
          isSelectable={isSelectable}
          isSelected={isSelected}
        />
      );
    })
  );

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl shadow-2xl p-2 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }} />
      </div>

      {/* Board content */}
      <div className="relative w-full h-full">
        {homeBases}
        {finishLanes}
        {tiles}
        {center}
        {tokens}
      </div>
    </div>
  );
}
