'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import Token from './Token';
import { PlayerColor, START_POSITIONS, SAFE_TILES } from '@/types/game';

// Classic Ludo board is a 15x15 grid
const GRID_SIZE = 15;
const CELL_SIZE = 100 / GRID_SIZE;

// Color configuration
const COLORS: Record<PlayerColor, { primary: string; light: string; safe: string }> = {
  red: { primary: '#DC2626', light: '#FEE2E2', safe: '#EF4444' },
  green: { primary: '#16A34A', light: '#DCFCE7', safe: '#22C55E' },
  yellow: { primary: '#CA8A04', light: '#FEF9C3', safe: '#EAB308' },
  blue: { primary: '#2563EB', light: '#DBEAFE', safe: '#3B82F6' },
};

// Define the path tiles (the cross-shaped track)
// Each tile has grid position and optional color for safe/start tiles
interface PathTile {
  row: number;
  col: number;
  isStart?: PlayerColor;
  isSafe?: boolean;
}

// Generate the main path (52 tiles going clockwise from red's start)
function generatePath(): PathTile[] {
  const path: PathTile[] = [];

  // Red's column going up (bottom to top on left side of top arm)
  for (let r = 5; r >= 0; r--) path.push({ row: r, col: 6 });
  // Top arm going right
  for (let c = 7; c <= 8; c++) path.push({ row: 0, col: c });
  // Blue's column going down (top to bottom on right side of right arm)
  for (let r = 1; r <= 5; r++) path.push({ row: r, col: 8 });
  // Right arm going right
  for (let c = 9; c <= 14; c++) path.push({ row: 6, col: c });
  // Blue's row going down
  for (let r = 7; r <= 8; r++) path.push({ row: r, col: 14 });
  // Yellow's column going left (right side going in)
  for (let c = 13; c >= 9; c--) path.push({ row: 8, col: c });
  // Bottom arm going down
  for (let r = 9; r <= 14; r++) path.push({ row: r, col: 8 });
  // Yellow's row going left
  for (let c = 7; c >= 6; c--) path.push({ row: 14, col: c });
  // Green's column going up
  for (let r = 13; r >= 9; r--) path.push({ row: r, col: 6 });
  // Left arm going left
  for (let c = 5; c >= 0; c--) path.push({ row: 8, col: c });
  // Green's row going up
  for (let r = 7; r >= 6; r--) path.push({ row: r, col: 0 });
  // Red's column continuing (completing the loop)
  for (let c = 1; c <= 5; c++) path.push({ row: 6, col: c });

  // Mark safe tiles and start positions
  const safeIndices = [0, 8, 13, 21, 26, 34, 39, 47];
  const startPositions: Record<number, PlayerColor> = {
    0: 'red',
    13: 'blue',
    26: 'yellow',
    39: 'green',
  };

  path.forEach((tile, i) => {
    if (safeIndices.includes(i)) tile.isSafe = true;
    if (startPositions[i]) tile.isStart = startPositions[i];
  });

  return path;
}

// Get position for a token based on its path index
function getTokenPosition(pathIndex: number, color: PlayerColor): { x: number; y: number } {
  const path = generatePath();

  if (pathIndex === -1) {
    // Home base - will be handled separately
    return { x: 0, y: 0 };
  }

  if (pathIndex >= 52) {
    // In home stretch (52-56) or finished (57)
    const homeStretchIndex = pathIndex - 52;
    const homeStretchPositions: Record<PlayerColor, { row: number; col: number }[]> = {
      red: [
        { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 },
        { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 },
      ],
      blue: [
        { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 },
        { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
      ],
      yellow: [
        { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 },
        { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 },
      ],
      green: [
        { row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 },
        { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 },
      ],
    };

    if (pathIndex === 57) {
      // Finished - center
      return { x: 50, y: 50 };
    }

    const pos = homeStretchPositions[color][homeStretchIndex];
    return {
      x: (pos.col + 0.5) * CELL_SIZE,
      y: (pos.row + 0.5) * CELL_SIZE,
    };
  }

  // On main path
  const tile = path[pathIndex];
  return {
    x: (tile.col + 0.5) * CELL_SIZE,
    y: (tile.row + 0.5) * CELL_SIZE,
  };
}

// Get home base position for tokens at home
function getHomeBasePosition(color: PlayerColor, tokenIndex: number): { x: number; y: number } {
  const homeAreas: Record<PlayerColor, { baseX: number; baseY: number }> = {
    red: { baseX: 1.5, baseY: 1.5 },
    green: { baseX: 1.5, baseY: 10.5 },
    yellow: { baseX: 10.5, baseY: 10.5 },
    blue: { baseX: 10.5, baseY: 1.5 },
  };

  const offsets = [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: 2, y: 2 },
  ];

  const base = homeAreas[color];
  const offset = offsets[tokenIndex];

  return {
    x: (base.baseX + offset.x + 0.5) * CELL_SIZE,
    y: (base.baseY + offset.y + 0.5) * CELL_SIZE,
  };
}

export default function GameBoard() {
  const { gameState, validMoves, selectedToken } = useGameStore();

  const path = useMemo(() => generatePath(), []);

  if (!gameState) return null;

  // Render the board grid
  const renderBoard = () => {
    const cells: React.ReactElement[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const key = `${row}-${col}`;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        // Determine cell type
        let cellColor = 'transparent';
        let borderColor = 'transparent';
        let showCell = false;

        // Home bases (corners)
        const isRedHome = row < 6 && col < 6;
        const isBlueHome = row < 6 && col > 8;
        const isYellowHome = row > 8 && col > 8;
        const isGreenHome = row > 8 && col < 6;

        // Center triangle area
        const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

        // Cross paths
        const isVerticalPath = col >= 6 && col <= 8;
        const isHorizontalPath = row >= 6 && row <= 8;
        const isPath = isVerticalPath || isHorizontalPath;

        // Home stretches (colored paths to center)
        const isRedStretch = row === 7 && col >= 1 && col <= 5;
        const isBlueStretch = col === 7 && row >= 1 && row <= 5;
        const isYellowStretch = row === 7 && col >= 9 && col <= 13;
        const isGreenStretch = col === 7 && row >= 9 && row <= 13;

        if (isRedHome) {
          cellColor = COLORS.red.light;
          showCell = true;
        } else if (isBlueHome) {
          cellColor = COLORS.blue.light;
          showCell = true;
        } else if (isYellowHome) {
          cellColor = COLORS.yellow.light;
          showCell = true;
        } else if (isGreenHome) {
          cellColor = COLORS.green.light;
          showCell = true;
        } else if (isCenter) {
          // Don't render center cells, we'll add triangles
          showCell = false;
        } else if (isRedStretch) {
          cellColor = COLORS.red.light;
          borderColor = '#E5E7EB';
          showCell = true;
        } else if (isBlueStretch) {
          cellColor = COLORS.blue.light;
          borderColor = '#E5E7EB';
          showCell = true;
        } else if (isYellowStretch) {
          cellColor = COLORS.yellow.light;
          borderColor = '#E5E7EB';
          showCell = true;
        } else if (isGreenStretch) {
          cellColor = COLORS.green.light;
          borderColor = '#E5E7EB';
          showCell = true;
        } else if (isPath) {
          cellColor = '#FFFFFF';
          borderColor = '#E5E7EB';
          showCell = true;
        }

        if (showCell) {
          cells.push(
            <div
              key={key}
              className="absolute"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${CELL_SIZE}%`,
                height: `${CELL_SIZE}%`,
                backgroundColor: cellColor,
                borderWidth: borderColor !== 'transparent' ? '0.5px' : '0',
                borderColor: borderColor,
                borderStyle: 'solid',
              }}
            />
          );
        }
      }
    }

    return cells;
  };

  // Render home base circles (where tokens start)
  const renderHomeBases = () => {
    const bases: React.ReactElement[] = [];
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

    const homePositions: Record<PlayerColor, { x: number; y: number }> = {
      red: { x: 1.5, y: 1.5 },
      blue: { x: 10.5, y: 1.5 },
      yellow: { x: 10.5, y: 10.5 },
      green: { x: 1.5, y: 10.5 },
    };

    colors.forEach((color) => {
      const pos = homePositions[color];
      bases.push(
        <div
          key={`home-${color}`}
          className="absolute rounded-lg shadow-inner"
          style={{
            left: `${pos.x * CELL_SIZE}%`,
            top: `${pos.y * CELL_SIZE}%`,
            width: `${3 * CELL_SIZE}%`,
            height: `${3 * CELL_SIZE}%`,
            backgroundColor: '#FFFFFF',
            border: `3px solid ${COLORS[color].primary}`,
          }}
        >
          {/* Token spots */}
          {[0, 1, 2, 3].map((i) => {
            const spotX = (i % 2) * 1.5 + 0.5;
            const spotY = Math.floor(i / 2) * 1.5 + 0.5;
            return (
              <div
                key={`spot-${color}-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${(spotX / 3) * 100}%`,
                  top: `${(spotY / 3) * 100}%`,
                  width: `${(1 / 3) * 100}%`,
                  height: `${(1 / 3) * 100}%`,
                  backgroundColor: COLORS[color].light,
                  border: `2px solid ${COLORS[color].primary}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>
      );
    });

    return bases;
  };

  // Render center home triangle
  const renderCenter = () => {
    return (
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${6 * CELL_SIZE}%`,
          top: `${6 * CELL_SIZE}%`,
          width: `${3 * CELL_SIZE}%`,
          height: `${3 * CELL_SIZE}%`,
        }}
      >
        {/* Four triangles pointing to center */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="0,0 50,50 100,0" fill={COLORS.blue.primary} />
          <polygon points="100,0 50,50 100,100" fill={COLORS.yellow.primary} />
          <polygon points="100,100 50,50 0,100" fill={COLORS.green.primary} />
          <polygon points="0,100 50,50 0,0" fill={COLORS.red.primary} />
          <circle cx="50" cy="50" r="15" fill="white" stroke="#D1D5DB" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  // Render safe/star tiles
  const renderSafeTiles = () => {
    const safeTiles: React.ReactElement[] = [];

    path.forEach((tile, index) => {
      if (tile.isSafe || tile.isStart) {
        const color = tile.isStart ||
          (index < 13 ? 'red' : index < 26 ? 'blue' : index < 39 ? 'yellow' : 'green');

        safeTiles.push(
          <div
            key={`safe-${index}`}
            className="absolute flex items-center justify-center"
            style={{
              left: `${tile.col * CELL_SIZE}%`,
              top: `${tile.row * CELL_SIZE}%`,
              width: `${CELL_SIZE}%`,
              height: `${CELL_SIZE}%`,
            }}
          >
            {tile.isStart ? (
              <div
                className="w-3/4 h-3/4 rounded"
                style={{ backgroundColor: COLORS[tile.isStart].safe }}
              />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400">
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            )}
          </div>
        );
      }
    });

    return safeTiles;
  };

  // Render all tokens
  const renderTokens = () => {
    return gameState.players.flatMap((player) =>
      player.tokens.map((token, tokenIndex) => {
        let position: { x: number; y: number };

        if (token.position === -1) {
          position = getHomeBasePosition(player.color, tokenIndex);
        } else {
          position = getTokenPosition(token.position, player.color);
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
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Board background */}
      <div
        className="absolute inset-0 rounded-xl shadow-2xl"
        style={{ backgroundColor: '#F3F4F6' }}
      />

      {/* Board content */}
      <div className="absolute inset-2">
        <div className="relative w-full h-full">
          {renderBoard()}
          {renderHomeBases()}
          {renderSafeTiles()}
          {renderCenter()}
          {renderTokens()}
        </div>
      </div>

      {/* Board border */}
      <div className="absolute inset-0 rounded-xl border-4 border-gray-300 pointer-events-none" />
    </div>
  );
}
