'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import Token from './Token';
import { PlayerColor } from '@/types/game';

// Premium Airbnb-inspired colors
const COLORS = {
  red: {
    primary: '#FF385C',
    light: '#FFF1F3',
    medium: '#FFCCD5',
    glow: 'rgba(255, 56, 92, 0.3)'
  },
  blue: {
    primary: '#428BF9',
    light: '#EEF5FF',
    medium: '#C5DCFF',
    glow: 'rgba(66, 139, 249, 0.3)'
  },
  green: {
    primary: '#00A699',
    light: '#E8FAF8',
    medium: '#B2EBE6',
    glow: 'rgba(0, 166, 153, 0.3)'
  },
  yellow: {
    primary: '#FFB400',
    light: '#FFF8E6',
    medium: '#FFE5A0',
    glow: 'rgba(255, 180, 0, 0.3)'
  },
};

const GRID_SIZE = 15;
const CELL_SIZE = 100 / GRID_SIZE;

// Path generation for classic Ludo board
function generatePath() {
  const path: { row: number; col: number; isStart?: PlayerColor; isSafe?: boolean }[] = [];

  // Build the 52-tile path clockwise from red's start
  // Red's column (going up)
  for (let r = 6; r >= 0; r--) path.push({ row: r, col: 6 });
  // Top row (going right)
  for (let c = 7; c <= 8; c++) path.push({ row: 0, col: c });
  // Blue's column (going down)
  for (let r = 0; r <= 5; r++) path.push({ row: r, col: 8 });
  // Right section (going right)
  for (let c = 9; c <= 14; c++) path.push({ row: 6, col: c });
  // Right column (going down)
  for (let r = 7; r <= 8; r++) path.push({ row: r, col: 14 });
  // Yellow's row (going left)
  for (let c = 14; c >= 9; c--) path.push({ row: 8, col: c });
  // Bottom section (going down)
  for (let r = 9; r <= 14; r++) path.push({ row: r, col: 8 });
  // Bottom row (going left)
  for (let c = 7; c >= 6; c--) path.push({ row: 14, col: c });
  // Green's column (going up)
  for (let r = 14; r >= 9; r--) path.push({ row: r, col: 6 });
  // Left section (going left)
  for (let c = 5; c >= 0; c--) path.push({ row: 8, col: c });
  // Left column (going up)
  for (let r = 7; r >= 6; r--) path.push({ row: r, col: 0 });
  // Red's row (going right, completing the loop)
  for (let c = 0; c <= 5; c++) path.push({ row: 6, col: c });

  // Mark special tiles
  [0, 8, 13, 21, 26, 34, 39, 47].forEach(i => {
    if (path[i]) path[i].isSafe = true;
  });

  const starts: Record<number, PlayerColor> = { 1: 'red', 14: 'blue', 27: 'yellow', 40: 'green' };
  Object.entries(starts).forEach(([i, color]) => {
    if (path[parseInt(i)]) path[parseInt(i)].isStart = color;
  });

  return path;
}

// Get token position on the board
function getTokenPosition(pathIndex: number, color: PlayerColor, tokenIndex: number) {
  const path = generatePath();

  // Home base positions
  if (pathIndex === -1) {
    const homes: Record<PlayerColor, { x: number; y: number }> = {
      red: { x: 1.5, y: 1.5 },
      blue: { x: 10.5, y: 1.5 },
      yellow: { x: 10.5, y: 10.5 },
      green: { x: 1.5, y: 10.5 },
    };
    const offsets = [{ x: 0.5, y: 0.5 }, { x: 2, y: 0.5 }, { x: 0.5, y: 2 }, { x: 2, y: 2 }];
    const base = homes[color];
    const offset = offsets[tokenIndex];
    return {
      x: (base.x + offset.x) * CELL_SIZE,
      y: (base.y + offset.y) * CELL_SIZE,
    };
  }

  // Home stretch positions
  if (pathIndex >= 52) {
    const stretchIndex = pathIndex - 52;
    const stretches: Record<PlayerColor, { row: number; col: number }[]> = {
      red: Array.from({ length: 6 }, (_, i) => ({ row: 7, col: 1 + i })),
      blue: Array.from({ length: 6 }, (_, i) => ({ row: 1 + i, col: 7 })),
      yellow: Array.from({ length: 6 }, (_, i) => ({ row: 7, col: 13 - i })),
      green: Array.from({ length: 6 }, (_, i) => ({ row: 13 - i, col: 7 })),
    };

    if (pathIndex === 57) return { x: 50, y: 50 }; // Center (finished)

    const pos = stretches[color][stretchIndex];
    return { x: (pos.col + 0.5) * CELL_SIZE, y: (pos.row + 0.5) * CELL_SIZE };
  }

  // Main path
  const tile = path[pathIndex];
  if (!tile) return { x: 50, y: 50 };
  return { x: (tile.col + 0.5) * CELL_SIZE, y: (tile.row + 0.5) * CELL_SIZE };
}

export default function GameBoard() {
  const { gameState, validMoves, selectedToken } = useGameStore();
  const path = useMemo(() => generatePath(), []);

  if (!gameState) return null;

  // Render the beautiful board
  const renderBoard = () => {
    const cells: React.ReactElement[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const key = `${row}-${col}`;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Determine cell styling
        const isRedHome = row < 6 && col < 6;
        const isBlueHome = row < 6 && col > 8;
        const isYellowHome = row > 8 && col > 8;
        const isGreenHome = row > 8 && col < 6;
        const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;
        const isPath = (col >= 6 && col <= 8) || (row >= 6 && row <= 8);

        // Home stretches
        const isRedStretch = row === 7 && col >= 1 && col <= 5;
        const isBlueStretch = col === 7 && row >= 1 && row <= 5;
        const isYellowStretch = row === 7 && col >= 9 && col <= 13;
        const isGreenStretch = col === 7 && row >= 9 && row <= 13;

        let style: React.CSSProperties = {
          left: `${x}%`,
          top: `${y}%`,
          width: `${CELL_SIZE}%`,
          height: `${CELL_SIZE}%`,
        };

        let className = 'absolute transition-all duration-200';
        let render = false;

        if (isRedHome) {
          style.backgroundColor = COLORS.red.light;
          render = true;
        } else if (isBlueHome) {
          style.backgroundColor = COLORS.blue.light;
          render = true;
        } else if (isYellowHome) {
          style.backgroundColor = COLORS.yellow.light;
          render = true;
        } else if (isGreenHome) {
          style.backgroundColor = COLORS.green.light;
          render = true;
        } else if (isCenter) {
          // Skip center - rendered separately
        } else if (isRedStretch) {
          style.backgroundColor = COLORS.red.medium;
          style.borderRight = '1px solid rgba(255,56,92,0.2)';
          render = true;
        } else if (isBlueStretch) {
          style.backgroundColor = COLORS.blue.medium;
          style.borderBottom = '1px solid rgba(66,139,249,0.2)';
          render = true;
        } else if (isYellowStretch) {
          style.backgroundColor = COLORS.yellow.medium;
          style.borderLeft = '1px solid rgba(255,180,0,0.2)';
          render = true;
        } else if (isGreenStretch) {
          style.backgroundColor = COLORS.green.medium;
          style.borderTop = '1px solid rgba(0,166,153,0.2)';
          render = true;
        } else if (isPath) {
          style.backgroundColor = '#FAFAFA';
          style.border = '1px solid #F0F0F0';
          render = true;
        }

        if (render) {
          cells.push(<div key={key} className={className} style={style} />);
        }
      }
    }
    return cells;
  };

  // Render elegant home bases
  const renderHomeBases = () => {
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    const positions = {
      red: { x: 0.5, y: 0.5 },
      blue: { x: 9.5, y: 0.5 },
      yellow: { x: 9.5, y: 9.5 },
      green: { x: 0.5, y: 9.5 },
    };

    return colors.map((color) => {
      const pos = positions[color];
      return (
        <div
          key={`home-${color}`}
          className="absolute rounded-2xl overflow-hidden"
          style={{
            left: `${(pos.x + 1) * CELL_SIZE}%`,
            top: `${(pos.y + 1) * CELL_SIZE}%`,
            width: `${4 * CELL_SIZE}%`,
            height: `${4 * CELL_SIZE}%`,
            backgroundColor: '#FFFFFF',
            boxShadow: `0 4px 20px ${COLORS[color].glow}, inset 0 0 0 3px ${COLORS[color].primary}`,
          }}
        >
          {/* Inner circle pattern */}
          <div className="absolute inset-2 rounded-xl" style={{ backgroundColor: COLORS[color].light }}>
            <div className="grid grid-cols-2 gap-2 p-3 h-full">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    backgroundColor: COLORS[color].medium,
                    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      );
    });
  };

  // Render premium center
  const renderCenter = () => (
    <div
      className="absolute overflow-hidden"
      style={{
        left: `${6 * CELL_SIZE}%`,
        top: `${6 * CELL_SIZE}%`,
        width: `${3 * CELL_SIZE}%`,
        height: `${3 * CELL_SIZE}%`,
        borderRadius: '4px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="0,0 50,50 100,0" fill={COLORS.blue.primary} />
        <polygon points="100,0 50,50 100,100" fill={COLORS.yellow.primary} />
        <polygon points="100,100 50,50 0,100" fill={COLORS.green.primary} />
        <polygon points="0,100 50,50 0,0" fill={COLORS.red.primary} />
        <circle cx="50" cy="50" r="12" fill="white" />
        <circle cx="50" cy="50" r="8" fill="#222" />
      </svg>
    </div>
  );

  // Render safe tiles with subtle indicators
  const renderSafeTiles = () => {
    return path.map((tile, index) => {
      if (!tile.isSafe && !tile.isStart) return null;

      const color = tile.isStart || (index < 13 ? 'red' : index < 26 ? 'blue' : index < 39 ? 'yellow' : 'green');

      return (
        <div
          key={`safe-${index}`}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: `${tile.col * CELL_SIZE}%`,
            top: `${tile.row * CELL_SIZE}%`,
            width: `${CELL_SIZE}%`,
            height: `${CELL_SIZE}%`,
          }}
        >
          {tile.isStart ? (
            <div
              className="w-4/5 h-4/5 rounded-lg"
              style={{
                backgroundColor: COLORS[color as PlayerColor].primary,
                boxShadow: `0 2px 8px ${COLORS[color as PlayerColor].glow}`,
              }}
            />
          ) : (
            <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="#222">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      );
    });
  };

  // Render tokens
  const renderTokens = () => {
    return gameState.players.flatMap((player) =>
      player.tokens.map((token, tokenIndex) => {
        const position = getTokenPosition(token.position, player.color, tokenIndex);
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
  };

  return (
    <motion.div
      className="relative w-full aspect-square max-w-[400px] mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Board container with premium shadow */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        }}
      />

      {/* Board content */}
      <div className="absolute inset-3">
        <div className="relative w-full h-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
          {renderBoard()}
          {renderHomeBases()}
          {renderSafeTiles()}
          {renderCenter()}
          {renderTokens()}
        </div>
      </div>
    </motion.div>
  );
}
