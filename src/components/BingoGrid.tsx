import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';

interface BingoGridProps {
  // onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => void; // Removed
  resetKey: number; // New prop to trigger reset
  initialGridState: boolean[][]; // Controlled state
  onCellToggle: (row: number, col: number) => void; // Callback for cell clicks
  selectedFruits: string[]; // New prop for selected fruits
  gridSize: number; // New prop for dynamic grid size
}

const BingoGrid: React.FC<BingoGridProps> = ({ /* onBingo, */ resetKey, initialGridState, onCellToggle, selectedFruits, gridSize }) => {
  const checkedCells = initialGridState;
  const completedBingosRef = useRef<Set<string>>(new Set());

  const CSS_GRID_DIMENSION = gridSize + 1; // Total rows/columns for CSS grid (including labels)
  const CENTER_CELL_INDEX = Math.floor(gridSize / 2); // For any NxN grid, this is N/2

  useEffect(() => {
    completedBingosRef.current = new Set();
  }, [resetKey]);

  const checkBingo = useCallback(() => {
    // Removed all bingo alert triggering logic
  }, [checkedCells, gridSize]); // Dependencies updated

  useEffect(() => {
    checkBingo();
  }, [initialGridState, checkBingo]);

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
      {Array(gridSize).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="w-16 h-16 flex items-center justify-center bg-orange-300 text-orange-800 font-semibold rounded-md shadow-md border border-orange-400">
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