import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';

const NUM_PLAYABLE_CELLS = 5;
const CSS_GRID_DIMENSION = NUM_PLAYABLE_CELLS + 1; // 6 total rows/columns for CSS grid (including labels)
const CENTER_CELL_INDEX = Math.floor(NUM_PLAYABLE_CELLS / 2); // For a 5x5 grid, this is 2

interface BingoGridProps {
  onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => void;
  resetKey: number; // New prop to trigger reset
  initialGridState: boolean[][]; // Controlled state
  onCellToggle: (row: number, col: number) => void; // Callback for cell clicks
  selectedFruits: string[]; // New prop for selected fruits
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo, resetKey, initialGridState, onCellToggle, selectedFruits }) => {
  const checkedCells = initialGridState;
  const completedBingosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    completedBingosRef.current = new Set();
  }, [resetKey]);

  const checkBingo = useCallback(() => {
    const newCompletedBingos = new Set(completedBingosRef.current);
    let rowColBingoTriggered = false;
    let diagonalBingoTriggered = false;
    let fullGridBingoTriggered = false;

    // Check rows
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      const rowId = `row-${i}`;
      if (checkedCells[i] && checkedCells[i].every(cell => cell)) {
        if (!newCompletedBingos.has(rowId)) {
          rowColBingoTriggered = true;
          newCompletedBingos.add(rowId);
        }
      }
    }

    // Check columns
    for (let j = 0; j < NUM_PLAYABLE_CELLS; j++) {
      const colId = `col-${j}`;
      if (checkedCells.every(row => row && row[j])) {
        if (!newCompletedBingos.has(colId)) {
          rowColBingoTriggered = true;
          newCompletedBingos.add(colId);
        }
      }
    }

    // Check main diagonal (top-left to bottom-right)
    const mainDiagId = 'diag-main';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][i])) {
      if (!newCompletedBingos.has(mainDiagId)) {
        diagonalBingoTriggered = true;
        newCompletedBingos.add(mainDiagId);
      }
    }

    // Check anti-diagonal (top-right to bottom-left)
    const antiDiagId = 'diag-anti';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][NUM_PLAYABLE_CELLS - 1 - i])) {
      if (!newCompletedBingos.has(antiDiagId)) {
        diagonalBingoTriggered = true;
        newCompletedBingos.add(antiDiagId);
      }
    }

    // Check full grid
    const fullGridId = 'full-grid';
    if (checkedCells.every(row => row && row.every(cell => cell))) {
      if (!newCompletedBingos.has(fullGridId)) {
        fullGridBingoTriggered = true;
        newCompletedBingos.add(fullGridId);
      }
    }

    // Trigger onBingo callbacks based on aggregated new bingos
    if (fullGridBingoTriggered) {
      onBingo('fullGrid', 'completed the full grid!');
    } else if (diagonalBingoTriggered) {
      onBingo('diagonal', 'completed a diagonal!');
    } else if (rowColBingoTriggered) {
      onBingo('rowCol', 'completed a row or column!');
    }

    // Update the ref
    completedBingosRef.current = newCompletedBingos;
  }, [checkedCells, onBingo]);

  useEffect(() => {
    checkBingo();
  }, [initialGridState, checkBingo]);

  // Ensure selectedFruits has 5 items, with 'lime' at index 2 for the center
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
      className="grid gap-1 p-4 bg-gradient-to-br from-amber-200 to-orange-400 rounded-xl shadow-2xl border-4 border-orange-500"
      style={{
        gridTemplateColumns: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${CSS_GRID_DIMENSION}, minmax(0, 1fr))`,
      }}
    >
      {/* Top-left empty corner */}
      <div className="w-16 h-16 flex items-center justify-center"></div>

      {/* Top row labels */}
      {displayFruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="w-16 h-16 flex items-center justify-center bg-orange-300 text-orange-800 font-semibold rounded-md shadow-md border border-orange-400">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="w-16 h-16 flex items-center justify-center bg-orange-300 text-orange-800 font-semibold rounded-md shadow-md border border-orange-400">
            <FruitIcon fruit={displayFruits[rowIndex]} size="lg" />
          </div>

          {/* Playable cells */}
          {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, colIndex) => {
            const isCenterCell = rowIndex === CENTER_CELL_INDEX && colIndex === CENTER_CELL_INDEX;
            const fruit1 = displayFruits[rowIndex];
            const fruit2 = displayFruits[colIndex];

            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-md shadow-sm transition-colors duration-200 border border-gray-200
                  ${isCenterCell ? 'bg-lime-300 cursor-not-allowed' : checkedCells[rowIndex][colIndex] ? 'bg-lime-200 hover:bg-lime-300' : 'bg-white hover:bg-orange-50'}
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