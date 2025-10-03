import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';

interface BingoAlert { // Need to define this interface here or import it
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface BingoGridProps {
  onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string, canonicalId: string) => void; // Added canonicalId
  resetKey: number; // New prop to trigger reset
  initialGridState: boolean[][]; // Controlled state
  onCellToggle: (row: number, col: number) => void; // Callback for cell clicks
  selectedFruits: string[]; // New prop for selected fruits
  gridSize: number; // New prop for dynamic grid size
  partyBingoAlerts: BingoAlert[]; // NEW PROP: Existing alerts from DB
  initialAlertsLoaded: boolean; // NEW PROP: Flag to indicate initial alerts are loaded
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo, resetKey, initialGridState, onCellToggle, selectedFruits, gridSize, partyBingoAlerts, initialAlertsLoaded }) => {
  const checkedCells = initialGridState;
  const completedBingosRef = useRef<Set<string>>(new Set());

  const CSS_GRID_DIMENSION = gridSize + 1; // Total rows/columns for CSS grid (including labels)
  const CENTER_CELL_INDEX = Math.floor(gridSize / 2); // For any NxN grid, this is N/2

  useEffect(() => {
    // Reset on resetKey change
    completedBingosRef.current = new Set();
    // Initialize with existing alerts from DB on mount or when alerts change
    // Only populate ref if initial alerts are loaded
    if (initialAlertsLoaded) {
      partyBingoAlerts.forEach(alert => {
        if (alert.canonicalId) {
          completedBingosRef.current.add(alert.canonicalId);
        }
      });
    }
  }, [resetKey, partyBingoAlerts, initialAlertsLoaded]); // Add initialAlertsLoaded to dependencies

  const checkBingo = useCallback(() => {
    if (!checkedCells || checkedCells.length === 0) return;

    const checkLine = (line: boolean[], type: 'rowCol' | 'diagonal', message: string, canonicalId: string) => {
      if (line.every(cell => cell) && !completedBingosRef.current.has(canonicalId)) {
        onBingo(type, message, canonicalId); // Pass canonicalId to onBingo
        completedBingosRef.current.add(canonicalId);
      }
    };

    // Check Rows
    for (let i = 0; i < gridSize; i++) {
      checkLine(checkedCells[i], 'rowCol', `completed a line!`, `row-${i}`);
    }

    // Check Columns
    for (let j = 0; j < gridSize; j++) {
      const column = Array(gridSize).fill(false).map((_, i) => checkedCells[i][j]);
      checkLine(column, 'rowCol', `completed a line!`, `col-${j}`);
    }

    // Check Diagonals
    const diagonal1 = Array(gridSize).fill(false).map((_, i) => checkedCells[i][i]);
    checkLine(diagonal1, 'diagonal', `completed a diagonal!`, `diag-1`);

    const diagonal2 = Array(gridSize).fill(false).map((_, i) => checkedCells[i][gridSize - 1 - i]);
    checkLine(diagonal2, 'diagonal', `completed a diagonal!`, `diag-2`);

    // Check Full Grid
    const allCellsChecked = checkedCells.flat().every(cell => cell);
    if (allCellsChecked && !completedBingosRef.current.has('full-grid')) {
      onBingo('fullGrid', `completed the entire grid!`, `full-grid`); // Pass canonicalId
      completedBingosRef.current.add('full-grid');
    }
  }, [checkedCells, gridSize, onBingo]);

  useEffect(() => {
    // Only check bingo if initial alerts are loaded
    if (initialAlertsLoaded) {
      checkBingo();
    }
  }, [initialGridState, checkBingo, initialAlertsLoaded]); // Add initialAlertsLoaded to dependencies

  // Ensure selectedFruits has `gridSize` items, with 'lime' at the center
  const displayFruits = [...selectedFruits];
  const limeIndex = displayFruits.indexOf('lime');
  if (limeIndex !== -1 && limeIndex !== CENTER_CELL_INDEX) {
    // Swap lime to the center position if it's not already there
    [displayFruits[CENTER_CELL_INDEX], displayFruits[limeIndex]] = [displayFruits[limeIndex], displayFruits[CENTER_CELL_INDEX]];
  } else if (limeIndex === -1) {
    // This case should ideally not happen if FruitSelection enforces 'lime'
    console.warn("Lime not found in selected fruits, adding it to center.");
    displayFruits[CENTER_CELL_INDEX] = 'lime';
  }


  return (
    <div
      className="grid gap-1 p-4 bg-white rounded-xl shadow-2xl border-4 border-lime-400 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
      style={{
        gridTemplateColumns: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
      }}
    >
      {/* Top-left empty corner */}
      <div className="aspect-square flex items-center justify-center"></div>

      {/* Top row labels */}
      {displayFruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="aspect-square flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-lime-800 font-semibold rounded-md shadow-md border-2 border-lime-400">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(gridSize).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-orange-200 to-pink-200 text-lime-800 font-semibold rounded-md shadow-md border-2 border-lime-400">
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
                className={`aspect-square flex flex-col items-center justify-center rounded-md shadow-sm transition-all duration-200 ease-in-out border-2 border-gray-300
                  ${isCenterCell ? 'bg-lime-300 cursor-not-allowed' : checkedCells[rowIndex][colIndex] ? 'bg-lime-200 hover:bg-lime-300 hover:scale-105' : 'bg-white hover:bg-lime-50 hover:scale-105'}
                `}
                onClick={() => !isCenterCell && onCellToggle(rowIndex, colIndex)}
              >
                <div className="flex space-x-1 mb-1">
                  <FruitIcon fruit={fruit1} size="sm" />
                  <FruitIcon fruit={fruit2} size="sm" />
                </div>
                {isCenterCell && <span className="text-xs font-bold text-lime-800">FREE</span>}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;