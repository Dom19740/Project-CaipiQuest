import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Derive completed bingos from partyBingoAlerts and resetKey using useMemo
  const completedBingos = useMemo(() => {
    // If initial alerts haven't loaded yet, or if resetKey indicates a new game, start fresh.
    // The resetKey dependency ensures this memo re-evaluates when a game reset occurs.
    if (!initialAlertsLoaded) {
      return new Set<string>();
    }

    const newSet = new Set<string>();
    partyBingoAlerts.forEach(alert => {
      if (alert.canonicalId) {
        newSet.add(alert.canonicalId);
      }
    });
    return newSet;
  }, [partyBingoAlerts, initialAlertsLoaded, resetKey]); // Dependencies for useMemo

  const checkBingo = useCallback(() => {
    if (!checkedCells || checkedCells.length === 0) return;

    const checkLine = (line: boolean[], type: 'rowCol' | 'diagonal', message: string, canonicalId: string) => {
      if (line.every(cell => cell) && !completedBingos.has(canonicalId)) {
        onBingo(type, message, canonicalId);
        // No need to add to a local ref here, as `completedBingos` is derived from `partyBingoAlerts` (DB state)
        // and `onBingo` will trigger a DB update, which will then update `partyBingoAlerts` via real-time.
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
    if (allCellsChecked && !completedBingos.has('full-grid')) {
      onBingo('fullGrid', `completed the entire grid!`, `full-grid`);
    }
  }, [checkedCells, gridSize, onBingo, completedBingos]); // Add completedBingos to dependencies

  useEffect(() => {
    // Only check bingo if initial alerts are loaded
    if (initialAlertsLoaded) {
      checkBingo();
    }
  }, [initialGridState, checkBingo, initialAlertsLoaded]);

  // Ensure selectedFruits has `gridSize` items, with 'lime' at the center
  const displayFruits = [...selectedFruits];
  const limeIndex = displayFruits.indexOf('lime');
  if (limeIndex !== -1 && limeIndex !== CENTER_CELL_INDEX) {
    // Swap lime to the center position if it's not already there
    [displayFruits[CENTER_CELL_INDEX], displayFruits[limeIndex]] = [displayFruits[limeIndex], displayFruits[CENTER_CELL_INDEX]];
  } else if (limeIndex === -1) {
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