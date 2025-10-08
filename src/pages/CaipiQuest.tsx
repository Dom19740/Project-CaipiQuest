import React, { useState, useEffect, useCallback } from 'react';
import BingoGrid from '@/components/BingoGrid';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess } from '@/utils/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
}

const FIXED_GRID_SIZE = 5;
const CENTER_CELL_INDEX = Math.floor(FIXED_GRID_SIZE / 2);

const CaipiQuest: React.FC = () => {
  const [bingoAlerts, setBingoAlerts] = useState<BingoAlert[]>([]);
  const [resetKey, setResetKey] = useState(0);

  const initializeGrid = useCallback(() => {
    const newGrid = Array(FIXED_GRID_SIZE).fill(null).map(() => Array(FIXED_GRID_SIZE).fill(false));
    newGrid[CENTER_CELL_INDEX][CENTER_CELL_INDEX] = true;
    return newGrid;
  }, []);

  const [checkedCells, setCheckedCells] = useState<boolean[][]>(initializeGrid);

  const defaultSinglePlayerFruits = [
    'passionfruit', 'lemon', 'strawberry', 'mango', 'lime',
    'pineapple', 'red_fruits', 'guava', 'ginger', 'tangerine'
  ].slice(0, FIXED_GRID_SIZE);

  const handleCellToggle = useCallback((row: number, col: number) => {
    setCheckedCells(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      const newState = !newGrid[row][col];
      newGrid[row][col] = newState;
      return newGrid;
    });
  }, []);

  const handleBingo = (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string) => {
    const message = `BINGO! You ${baseMessage}`;
    showSuccess(message);
    setBingoAlerts(prev => [{ id: Date.now().toString(), type, message }, ...prev]);
  };

  const handleResetGame = () => {
    setResetKey(prev => prev + 1);
    setBingoAlerts([]);
    setCheckedCells(initializeGrid());
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-800 dark:text-green-200 bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700';
      case 'diagonal':
        return 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-3xl p-4 animate-pulse';
      default:
        return 'text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-12 pb-8 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600 relative overflow-hidden">
      <h1 className="text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 mb-8 drop-shadow-lg">
        CaipiQuest Bingo!
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl">
        <BingoGrid
          onBingo={handleBingo}
          resetKey={resetKey}
          initialGridState={checkedCells}
          onCellToggle={handleCellToggle}
          selectedFruits={defaultSinglePlayerFruits}
          gridSize={FIXED_GRID_SIZE}
          partyBingoAlerts={[]}
          initialAlertsLoaded={true}
        />
        <div className="flex flex-col gap-4 w-full lg:w-80">
          <Card className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-lime-600 dark:border-lime-700 border-2 text-card-foreground p-4 rounded-xl">
            <CardHeader className="bg-lime-400/80 dark:bg-lime-800/80 border-b border-lime-600 dark:border-lime-700 rounded-t-xl p-4">
              <CardTitle className="text-xl sm:text-2xl text-lime-900 dark:text-lime-100">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-yellow-200/70 dark:bg-yellow-900/70 border border-yellow-500 dark:border-yellow-800 rounded-lg shadow-inner max-h-[200px] overflow-y-auto">
              {bingoAlerts.length === 0 ? (
                <p className="text-gray-800 dark:text-gray-300 italic text-base sm:text-lg">No bingo alerts yet...</p>
              ) : (
                <ul className="space-y-2">
                  {bingoAlerts.map((alert) => (
                    <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm sm:text-base ${getAlertClasses(alert.type)}`}>
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full bg-red-800 hover:bg-red-900 text-white py-3 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-base sm:text-lg h-12">
                Reset Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-gray-800 text-card-foreground p-6 rounded-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl sm:text-2xl">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-900 dark:text-gray-300 text-base sm:text-lg">
                  This action will clear the current bingo grid and all alerts, starting a new game.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-12 text-base sm:text-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetGame} className="h-12 text-base sm:text-lg">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default CaipiQuest;