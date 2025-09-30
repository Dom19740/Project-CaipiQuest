import React, { useState, useEffect, useCallback } from 'react';
import FruitIcon from './FruitIcon';

const fruits = ['passionfruit', 'lemon', 'strawberry', 'mango', 'lime', 'pineapple', 'pitaya', 'plum', 'ginger'];
const NUM_PLAYABLE_CELLS = fruits.length; // 9 playable rows/columns
const CSS_GRID_DIMENSION = NUM_PLAYABLE_CELLS + 1; // 10 total rows/columns for CSS grid (including labels)

interface BingoGridProps {
  onBingo: (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => void;
  resetKey: number; // New prop to trigger reset
  initialGridState: boolean[][]; // Controlled state
  onCellToggle: (row: number, col: number) => void; // Callback for cell clicks
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo, resetKey, initialGridState, onCellToggle }) => {
  // Use initialGridState directly, no internal checkedCells state
  const checkedCells = initialGridState;

  // State to keep track of completed bingo lines to prevent duplicate alerts
  const [completedBingos, setCompletedBingos] = useState<Set<string>>(new Set());

  // Effect to reset the grid when resetKey changes
  useEffect(() => {
    setCompletedBingos(new Set());
  }, [resetKey]);

  // Update internal completedBingos when initialGridState changes (e.g., on reset from parent)
  useEffect(() => {
    // Re-evaluate bingos when grid state changes from parent
    checkBingo();
  }, [initialGridState]);


  const checkBingo = useCallback(() => {
    const newCompletedBingos = new Set(completedBingos);
    let bingoTriggered = false;

    // Check rows
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      const rowId = `row-${i}`;
      if (checkedCells[i] && checkedCells[i].every(cell => cell)) {
        if (!newCompletedBingos.has(rowId)) {
          onBingo('rowCol', `BINGO! Row ${i + 1} completed!`);
          newCompletedBingos.add(rowId);
          bingoTriggered = true;
        }
      }
    }

    // Check columns
    for (let j = 0; j < NUM_PLAYABLE_CELLS; j++) {
      const colId = `col-${j}`;
      if (checkedCells.every(row => row && row[j])) {
        if (!newCompletedBingos.has(colId)) {
          onBingo('rowCol', `BINGO! Column ${j + 1} completed!`);
          newCompletedBingos.add(colId);
          bingoTriggered = true;
        }
      }
    }

    // Check main diagonal (top-left to bottom-right)
    const mainDiagId = 'diag-main';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][i])) {
      if (!newCompletedBingos.has(mainDiagId)) {
        onBingo('diagonal', 'BINGO! Main diagonal completed!');
        newCompletedBingos.add(mainDiagId);
        bingoTriggered = true;
      }
    }

    // Check anti-diagonal (top-right to bottom-left)
    const antiDiagId = 'diag-anti';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][NUM_PLAYABLE_CELLS - 1 - i])) {
      if (!newCompletedBingos.has(antiDiagId)) {
        onBingo('diagonal', 'BINGO! Anti-diagonal completed!');
        newCompletedBingos.add(antiDiagId);
        bingoTriggered = true;
      }
    }

    // Check full grid
    const fullGridId = 'full-grid';
    if (checkedCells.every(row => row && row.every(cell => cell))) {
      if (!newCompletedBingos.has(fullGridId)) {
        onBingo('fullGrid', 'MEGA BINGO! Full grid completed!');
        newCompletedBingos.add(fullGridId);
        bingoTriggered = true;
      }
    }

    if (bingoTriggered) {
      setCompletedBingos(newCompletedBingos);
    }
  }, [checkedCells, onBingo, completedBingos]);

  useEffect(() => {
    checkBingo();
  }, [checkedCells, checkBingo]);

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