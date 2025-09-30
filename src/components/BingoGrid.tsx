import React, { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import FruitIcon from './FruitIcon';
import { showSuccess } from '@/utils/toast';

const fruits = ['passionfruit', 'lemon', 'strawberry', 'mango', 'lime', 'pineapple', 'pitaya', 'plum', 'ginger'];
const NUM_PLAYABLE_CELLS = fruits.length; // 9 playable rows/columns
const CSS_GRID_DIMENSION = NUM_PLAYABLE_CELLS + 1; // 10 total rows/columns for CSS grid (including labels)

interface BingoGridProps {
  onBingo: (type: string) => void;
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo }) => {
  // State to store the checked status of each playable cell (9x9 grid)
  const [checkedCells, setCheckedCells] = useState<boolean[][]>(() => {
    const initialGrid: boolean[][] = [];
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      initialGrid.push(Array(NUM_PLAYABLE_CELLS).fill(false));
    }
    return initialGrid;
  });

  // State to keep track of completed bingo lines to prevent duplicate alerts
  const [completedBingos, setCompletedBingos] = useState<Set<string>>(new Set());

  const toggleCell = (row: number, col: number) => {
    setCheckedCells(prev => {
      // Create a deep copy of the previous state to ensure immutability
      const newCheckedCells = prev.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? !c : c))
      );
      return newCheckedCells;
    });
  };

  const checkBingo = useCallback(() => {
    const newCompletedBingos = new Set(completedBingos);
    let bingoTriggered = false;

    // Check rows
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      const rowId = `row-${i}`;
      if (checkedCells[i] && checkedCells[i].every(cell => cell)) {
        if (!newCompletedBingos.has(rowId)) {
          onBingo(`row ${i + 1}`);
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
          onBingo(`column ${j + 1}`);
          newCompletedBingos.add(colId);
          bingoTriggered = true;
        }
      }
    }

    // Check main diagonal (top-left to bottom-right)
    const mainDiagId = 'diag-main';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][i])) {
      if (!newCompletedBingos.has(mainDiagId)) {
        onBingo('main diagonal');
        newCompletedBingos.add(mainDiagId);
        bingoTriggered = true;
      }
    }

    // Check anti-diagonal (top-right to bottom-left)
    const antiDiagId = 'diag-anti';
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][NUM_PLAYABLE_CELLS - 1 - i])) {
      if (!newCompletedBingos.has(antiDiagId)) {
        onBingo('anti-diagonal');
        newCompletedBingos.add(antiDiagId);
        bingoTriggered = true;
      }
    }

    // Check full grid
    const fullGridId = 'full-grid';
    if (checkedCells.every(row => row && row.every(cell => cell))) {
      if (!newCompletedBingos.has(fullGridId)) {
        onBingo('full grid');
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
              className="w-16 h-16 flex flex-col items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-orange-50 transition-colors duration-200 border border-gray-200"
              onClick={() => toggleCell(rowIndex, colIndex)}
            >
              <div className="flex space-x-1 mb-1">
                <FruitIcon fruit={fruits[rowIndex]} size="sm" />
                <FruitIcon fruit={fruits[colIndex]} size="sm" />
              </div>
              <Checkbox
                checked={checkedCells[rowIndex][colIndex]}
                onCheckedChange={() => toggleCell(rowIndex, colIndex)}
                className="w-4 h-4 border-lime-500 data-[state=checked]:bg-lime-500 data-[state=checked]:text-white"
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;