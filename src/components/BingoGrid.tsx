import React, { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import FruitIcon from './FruitIcon';
import { showSuccess } from '@/utils/toast';

const fruits = ['passionfruit', 'lemon', 'strawberry', 'mango', 'lime', 'pineapple', 'pitaya', 'plum', 'ginger'];
const GRID_SIZE = 9; // 1 for labels + 8 for playable cells
const NUM_PLAYABLE_CELLS = GRID_SIZE - 1; // 8

interface BingoGridProps {
  onBingo: (type: string) => void;
}

const BingoGrid: React.FC<BingoGridProps> = ({ onBingo }) => {
  // State to store the checked status of each playable cell (8x8 grid)
  // Initialize with a function to ensure it only runs once and is correctly structured
  const [checkedCells, setCheckedCells] = useState<boolean[][]>(() => {
    const initialGrid: boolean[][] = [];
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      initialGrid.push(Array(NUM_PLAYABLE_CELLS).fill(false));
    }
    return initialGrid;
  });

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
    // Check rows
    for (let i = 0; i < NUM_PLAYABLE_CELLS; i++) {
      // Ensure checkedCells[i] exists before calling .every()
      if (checkedCells[i] && checkedCells[i].every(cell => cell)) {
        onBingo(`row ${i + 1}`);
        return;
      }
    }

    // Check columns
    for (let j = 0; j < NUM_PLAYABLE_CELLS; j++) {
      // Ensure each row exists before accessing row[j]
      if (checkedCells.every(row => row && row[j])) {
        onBingo(`column ${j + 1}`);
        return;
      }
    }

    // Check main diagonal (top-left to bottom-right)
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][i])) {
      onBingo('main diagonal');
      return;
    }

    // Check anti-diagonal (top-right to bottom-left)
    if (Array(NUM_PLAYABLE_CELLS).fill(null).every((_, i) => checkedCells[i] && checkedCells[i][NUM_PLAYABLE_CELLS - 1 - i])) {
      onBingo('anti-diagonal');
      return;
    }

    // Check full grid
    if (checkedCells.every(row => row && row.every(cell => cell))) {
      onBingo('full grid');
      return;
    }
  }, [checkedCells, onBingo]);

  useEffect(() => {
    checkBingo();
  }, [checkedCells, checkBingo]);

  return (
    <div
      className="grid gap-1 p-4 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-lg shadow-xl"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {/* Top-left empty corner */}
      <div className="w-16 h-16 flex items-center justify-center"></div>

      {/* Top row labels */}
      {fruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="w-16 h-16 flex items-center justify-center bg-yellow-300 rounded-md shadow-sm">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="w-16 h-16 flex items-center justify-center bg-yellow-300 rounded-md shadow-sm">
            <FruitIcon fruit={fruits[rowIndex]} size="lg" />
          </div>

          {/* Playable cells */}
          {Array(NUM_PLAYABLE_CELLS).fill(null).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="w-16 h-16 flex flex-col items-center justify-center bg-white rounded-md shadow-sm cursor-pointer hover:bg-yellow-50 transition-colors duration-200"
              onClick={() => toggleCell(rowIndex, colIndex)}
            >
              <div className="flex space-x-1 mb-1">
                <FruitIcon fruit={fruits[rowIndex]} size="sm" />
                <FruitIcon fruit={fruits[colIndex]} size="sm" />
              </div>
              <Checkbox
                checked={checkedCells[rowIndex][colIndex]}
                onCheckedChange={() => toggleCell(rowIndex, colIndex)}
                className="w-4 h-4"
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;