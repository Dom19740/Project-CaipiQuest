import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';

const fruits = ['passionfruit', 'lemon', 'strawberry', 'mango', 'lime']; // Reduced to 5 fruits
const NUM_PLAYABLE_CELLS = 5; // Changed from 9 to 5
const CSS_GRID_DIMENSION = NUM_PLAYABLE_CELLS + 1; // 6 total rows/columns for CSS grid (including labels)

interface BingoGridProps {
  onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => void;
  resetKey: number; // New prop to trigger reset
  initialGridState: boolean[][]; // Controlled state
  onCellToggle: (row: number, col: number) => void; // Callback for cell clicks
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo, resetKey, initialGridState, onCellToggle }) => {
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
  }, [checkedCells, onBingo]); // Only depend on checkedCells and onBingo

  // This effect runs when initialGridState changes, triggering bingo check
  useEffect(() => {
    checkBingo();
  }, [initialGridState, checkBingo]); // Depend on initialGridState and the memoized checkBingo

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
      {fruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="w-16 h-16 flex items-center justify-center bg-orange-300 text-orange-800 font-semibold rounded-md shadow-md border border-orange-400">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="w-16 h-16 flex items-center justify-center bg-orange-300 text-orange-800 font-semibold rounded-md shadow-md border border-orange-400">
            <FruitIcon fruit={fruits[rowIndex]} size="lg" />
          </div>

          {/* Playable cells */}
          {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex flex-col items-center justify-center rounded-md shadow-sm cursor-pointer transition-colors duration-200 border border-gray-200
                ${checkedCells[rowIndex][colIndex] ? 'bg-lime-200 hover:bg-lime-300' : 'bg-white hover:bg-orange-50'}
              `}
              onClick={() => onCellToggle(rowIndex, colIndex)}
            >
              <div className="flex space-x-1 mb-1">
                <FruitIcon fruit={fruits[rowIndex]} size="sm" />
                <FruitIcon fruit={fruits[colIndex]} size="sm" />
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;