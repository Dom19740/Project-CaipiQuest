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
import FullGridCelebration from '@/components/FullGridCelebration'; // NEW: Import the new celebration component

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
}

const FIXED_GRID_SIZE = 5;

const CaipiQuest: React.FC = () => {
  const [bingoAlerts, setBingoAlerts] = useState<BingoAlert[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showFullGridCelebration, setShowFullGridCelebration] = useState(false); // NEW: State for full grid celebration

  const [checkedCells, setCheckedCells] = useState<boolean[][]>(
    Array(FIXED_GRID_SIZE).fill(null).map(() => Array(FIXED_GRID_SIZE).fill(false))
  );

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

    if (type === 'fullGrid') {
      setShowFullGridCelebration(true); // Trigger the new celebration
    }
  };

  const handleResetGame = () => {
    setResetKey(prev => prev + 1);
    setBingoAlerts([]);
    setCheckedCells(Array(FIXED_GRID_SIZE).fill(null).map(() => Array(FIXED_GRID_SIZE).fill(false)));
    setShowFullGridCelebration(false); // Ensure celebration is hidden on reset
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'diagonal':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-12 pb-8 px-4 bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 relative overflow-hidden">
      {showFullGridCelebration && <FullGridCelebration onClose={() => setShowFullGridCelebration(false)} />} {/* NEW: Render celebration */}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-8 drop-shadow-lg">
        CaipiQuest Bingo!
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
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
        <div className="flex flex-col gap-4">
          <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
            <CardHeader className="bg-lime-200 border-b border-lime-400">
              <CardTitle className="text-lime-800 text-2xl">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {bingoAlerts.length === 0 ? (
                <p className="text-gray-600 italic">No bingo alerts yet...</p>
              ) : (
                <ul className="space-y-2">
                  {bingoAlerts.map((alert) => (
                    <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm ${getAlertClasses(alert.type)}`}>
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full lg:w-80 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                Reset Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear the current bingo grid and all alerts, starting a new game.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetGame}>Continue</AlertDialogAction>
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