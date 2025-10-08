import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface BingoGridProps {
  onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string, canonicalId: string) => void;
  resetKey: number;
  initialGridState: boolean[][];
  onCellToggle: (row: number, col: number) => void;
  selectedFruits: string[];
  gridSize: number;
  partyBingoAlerts: BingoAlert[];
  initialAlertsLoaded: boolean;
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo, resetKey, initialGridState, onCellToggle, selectedFruits, gridSize, partyBingoAlerts, initialAlertsLoaded }) => {
  const checkedCells = initialGridState;

  const CSS_GRID_DIMENSION = gridSize + 1;
  const CENTER_CELL_INDEX = Math.floor(gridSize / 2);

  // NEW: Use a ref to track bingos *this specific grid instance* has already reported
  // This prevents the onBingo callback from being fired multiple times for the same bingo
  // by the same player's grid, while still allowing other players to trigger their own.
  const reportedBingosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Reset reported bingos when the game resets
    if (resetKey !== 0) {
      reportedBingosRef.current = new Set();
    }
    // When initial alerts are loaded, populate reportedBingosRef with *this player's* existing bingos
    // This ensures that if a player refreshes, they don't re-trigger bingos they already achieved.
    if (initialAlertsLoaded && partyBingoAlerts) {
      // We need to filter for the current user's alerts if we want to prevent re-triggering for them
      // However, the BingoGrid component doesn't have access to the current user ID.
      // The `useGameLogic` hook already handles deduplication in the database per player.
      // So, for the BingoGrid's local `reportedBingosRef`, we should only add bingos that *this instance* has reported.
      // For now, we'll keep it simple and let `useGameLogic` handle the per-player deduplication.
      // The `reportedBingosRef` here will primarily prevent rapid re-triggering from UI changes.
    }
  }, [resetKey, initialAlertsLoaded, partyBingoAlerts]);


  const checkBingo = useCallback(() => {
    if (!checkedCells || checkedCells.length === 0) return;

    const checkLine = (line: boolean[], type: 'rowCol' | 'diagonal', message: string, canonicalId: string) => {
      // Only trigger onBingo if this specific grid instance hasn't reported this canonicalId yet
      if (line.every(cell => cell) && !reportedBingosRef.current.has(canonicalId)) {
        onBingo(type, message, canonicalId);
        reportedBingosRef.current.add(canonicalId);
      }
    };

    // Check rows
    for (let i = 0; i < gridSize; i++) {
      checkLine(checkedCells[i], 'rowCol', `completed a row!`, `row-${i}`);
    }

    // Check columns
    for (let j = 0; j < gridSize; j++) {
      const column = Array(gridSize).fill(false).map((_, i) => checkedCells[i][j]);
      checkLine(column, 'rowCol', `completed a column!`, `col-${j}`);
    }

    // Check diagonals
    const diagonal1 = Array(gridSize).fill(false).map((_, i) => checkedCells[i][i]);
    checkLine(diagonal1, 'diagonal', `completed a diagonal!`, `diag-1`);

    const diagonal2 = Array(gridSize).fill(false).map((_, i) => checkedCells[i][gridSize - 1 - i]);
    checkLine(diagonal2, 'diagonal', `completed a diagonal!`, `diag-2`);

    // Check full grid
    const allCellsChecked = checkedCells.flat().every(cell => cell);
    if (allCellsChecked && !reportedBingosRef.current.has('full-grid')) {
      onBingo('fullGrid', `completed the entire grid!`, `full-grid`);
      reportedBingosRef.current.add('full-grid');
    }
  }, [checkedCells, gridSize, onBingo]);

  useEffect(() => {
    // Only check for bingos once initial data is loaded to avoid premature triggers
    if (initialAlertsLoaded) {
      checkBingo();
    }
  }, [initialGridState, initialAlertsLoaded, checkBingo]);

  const displayFruits = [...selectedFruits];

  return (
    <div
      className="grid gap-1 p-4 bg-white/90 dark:bg-gray-900/90 rounded-xl shadow-2xl border-4 border-lime-500 dark:border-lime-600 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      style={{
        gridTemplateColumns: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
      }}
    >
      {/* Top-left empty corner */}
      <div className="aspect-square flex items-center justify-center"></div>

      {/* Top row labels */}
      {displayFruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="aspect-square flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-400 dark:from-orange-800 dark:to-pink-800 text-lime-900 dark:text-lime-100 font-semibold rounded-md shadow-md border-2 border-lime-500 dark:border-lime-600">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(gridSize).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-orange-400 to-pink-400 dark:from-orange-800 dark:to-pink-800 text-lime-900 dark:text-lime-100 font-semibold rounded-md shadow-md border-2 border-lime-500 dark:border-lime-600">
            <FruitIcon fruit={displayFruits[rowIndex]} size="lg" />
          </div>

          {/* Playable cells */}
          {Array(gridSize).fill(null).map((_, colIndex) => {
            const isCenterCell = rowIndex === CENTER_CELL_INDEX && colIndex === CENTER_CELL_INDEX;
            const fruit1 = displayFruits[rowIndex];
            const fruit2 = displayFruits[colIndex];

            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`aspect-square flex flex-col items-center justify-center rounded-md shadow-sm transition-all duration-200 ease-in-out border-2 border-gray-500 dark:border-gray-600
                  ${isCenterCell ? 'bg-lime-500 dark:bg-lime-800 cursor-not-allowed' : checkedCells[rowIndex][colIndex] ? 'bg-lime-400 dark:bg-lime-700 hover:bg-lime-500 dark:hover:bg-lime-600 hover:scale-105' : 'bg-white dark:bg-gray-800 hover:bg-lime-200 dark:hover:bg-gray-700 hover:scale-105'}
                `}
                onClick={() => !isCenterCell && onCellToggle(rowIndex, colIndex)}
              >
                <div className="flex space-x-1 mb-1">
                  <FruitIcon fruit={fruit1} size="sm" />
                  <FruitIcon fruit={fruit2} size="sm" />
                </div>
                {isCenterCell && <span className="text-xs font-bold text-lime-900 dark:text-lime-100">FREE</span>}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;