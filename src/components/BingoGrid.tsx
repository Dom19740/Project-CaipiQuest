import React, { useState, useEffect, useCallback, useRef } from 'react';
import FruitIcon from './FruitIcon';
import { Button } from '@/components/ui/button'; // Import Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Import DialogClose for the 'X' button
} from "@/components/ui/dialog"; // Import Dialog components
import { X } from 'lucide-react'; // Import X icon for closing

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

  const reportedBingosRef = useRef<Set<string>>(new Set());
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set()); // Stores "row-col" strings for highlighting

  useEffect(() => {
    if (resetKey !== 0) {
      reportedBingosRef.current = new Set();
    }
    // This ref is primarily for preventing rapid re-triggering from UI changes.
    // The `useGameLogic` hook handles per-player deduplication in the database.
  }, [resetKey]);

  useEffect(() => {
    const newHighlightedCells = new Set<string>();
    partyBingoAlerts.forEach(alert => {
      if (alert.type === 'rowCol' || alert.type === 'diagonal') {
        const [type, indexStr] = alert.canonicalId?.split('-') || [];
        const index = parseInt(indexStr);

        if (type === 'row' && !isNaN(index)) {
          for (let col = 0; col < gridSize; col++) {
            newHighlightedCells.add(`${index}-${col}`);
          }
        } else if (type === 'col' && !isNaN(index)) {
          for (let row = 0; row < gridSize; row++) {
            newHighlightedCells.add(`${row}-${index}`);
          }
        } else if (type === 'diag' && index === 1) { // Main diagonal
          for (let i = 0; i < gridSize; i++) {
            newHighlightedCells.add(`${i}-${i}`);
          }
        } else if (type === 'diag' && index === 2) { // Anti-diagonal
          for (let i = 0; i < gridSize; i++) {
            newHighlightedCells.add(`${i}-${gridSize - 1 - i}`);
          }
        }
      }
    });
    setHighlightedCells(newHighlightedCells);
  }, [partyBingoAlerts, gridSize]);


  const checkBingo = useCallback(() => {
    if (!checkedCells || checkedCells.length === 0) return;

    const checkLine = (line: boolean[], type: 'rowCol' | 'diagonal', message: string, canonicalId: string) => {
      if (line.every(cell => cell) && !reportedBingosRef.current.has(canonicalId)) {
        onBingo(type, message, canonicalId);
        reportedBingosRef.current.add(canonicalId);
      }
    };

    // Check rows
    for (let i = 0; i < gridSize; i++) {
      checkLine(checkedCells[i], 'rowCol', `completed a line!`, `row-${i}`);
    }

    // Check columns
    for (let j = 0; j < gridSize; j++) {
      const column = Array(gridSize).fill(false).map((_, i) => checkedCells[i][j]);
      checkLine(column, 'rowCol', `completed a line!`, `col-${j}`);
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
      {/* Top-left button for selected fruits */}
      <div className="aspect-square flex items-center justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-full h-full bg-white dark:bg-gray-800 text-lime-900 dark:text-lime-100 rounded-md shadow-md border-2 border-lime-500 dark:border-lime-600 text-2xl hover:scale-105 transition-transform"
              aria-label="View selected fruits"
            >
              🛒
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 p-6 text-card-foreground [&>button]:hidden">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 drop-shadow-lg mb-2">
                Your Chosen Fruits
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {selectedFruits.map((fruit, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700">
                  <FruitIcon fruit={fruit} size="md" />
                  <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {fruit.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top row labels */}
      {displayFruits.map((fruit, index) => (
        <div key={`col-label-${index}`} className="aspect-square flex items-center justify-center bg-white dark:bg-gray-800 text-lime-900 dark:text-lime-100 rounded-md shadow-md border-2 border-lime-500 dark:border-lime-600">
          <FruitIcon fruit={fruit} size="lg" />
        </div>
      ))}

      {/* Grid cells */}
      {Array(gridSize).fill(null).map((_, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Left column labels */}
          <div className="aspect-square flex items-center justify-center bg-white dark:bg-gray-800 text-lime-900 dark:text-lime-100 rounded-md shadow-md border-2 border-lime-500 dark:border-lime-600">
            <FruitIcon fruit={displayFruits[rowIndex]} size="lg" />
          </div>

          {/* Playable cells */}
          {Array(gridSize).fill(null).map((_, colIndex) => {
            const isCenterCell = rowIndex === CENTER_CELL_INDEX && colIndex === CENTER_CELL_INDEX;
            const fruit1 = displayFruits[rowIndex];
            const fruit2 = displayFruits[colIndex];

            const isChecked = checkedCells[rowIndex][colIndex];
            const isHighlighted = highlightedCells.has(`${rowIndex}-${colIndex}`);

            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`aspect-square flex flex-col items-center justify-center rounded-md shadow-sm transition-all duration-200 ease-in-out border-2 border-gray-500 dark:border-gray-600
                  ${isCenterCell ? 'bg-lime-500 dark:bg-lime-800 cursor-not-allowed' :
                    isChecked && isHighlighted ? 'bg-yellow-400 dark:bg-yellow-700 hover:bg-yellow-500 dark:hover:bg-yellow-600 hover:scale-105' : // Highlighted and checked
                    isChecked ? 'bg-lime-400 dark:bg-lime-700 hover:bg-lime-500 dark:hover:bg-lime-600 hover:scale-105' : // Just checked
                    'bg-white dark:bg-gray-800 hover:bg-lime-200 dark:hover:bg-gray-700 hover:scale-105' // Not checked
                  }
                `}
                onClick={() => !isCenterCell && onCellToggle(rowIndex, colIndex)}
              >
                <div className="flex space-x-1 mb-1">
                  <FruitIcon fruit={fruit1} size="sm" />
                  <FruitIcon fruit={fruit2} size="sm" />
                </div>
                {isCenterCell && <span className="text-xs text-lime-900 dark:text-lime-100">FREE</span>}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BingoGrid;