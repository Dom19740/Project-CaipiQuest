import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { showError } from '@/utils/toast';
import FruitIcon from '@/components/FruitIcon';
import { MadeWithDyad } from '@/components/made-with-dyad';

const allFruitsData = [
  { name: 'lime' },
  { name: 'passionfruit' },
  { name: 'lemon' },
  { name: 'strawberry' },
  { name: 'mango' },
  { name: 'pineapple' },
  { name: 'red_fruits' },
  { name: 'guava' },
  { name: 'ginger' },
  { name: 'tangerine' },
  { name: 'kiwi' },
  { name: 'cashew' },
  { name: 'dragon_fruit' },
  { name: 'banana' },
  { name: 'plum' },
  { name: 'watermelon' },
];

const FruitSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = location.state || {};

  const fixedGridSize = 5;
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]); // Changed: Initial state is now empty
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      showError("Party ID not found. Please create or join a party first.");
      navigate('/lobby');
    }
  }, [roomId, navigate]);

  const handleFruitToggle = (fruitName: string, isChecked: boolean) => {
    // Removed: if (fruitName === 'lime') return; - Lime can now be freely selected
    if (isChecked) {
      if (selectedFruits.length < fixedGridSize) {
        setSelectedFruits(prev => [...prev, fruitName]);
        setError(null);
      } else {
        setError(`You can select a maximum of ${fixedGridSize} fruits.`);
      }
    } else {
      setSelectedFruits(prev => prev.filter(f => f !== fruitName));
      setError(null);
    }
  };

  const handleProceed = () => {
    if (selectedFruits.length !== fixedGridSize) {
      setError(`Please select exactly ${fixedGridSize} fruits. You have selected ${selectedFruits.length}.`);
      return;
    }
    navigate(`/game/${roomId}`, { state: { selectedFruits, gridSize: fixedGridSize } });
  };

  const isProceedDisabled = selectedFruits.length !== fixedGridSize;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 mb-4 drop-shadow-lg">
            Choose Your Fruits
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-6 leading-relaxed">
            Select 5 fruits for your bingo grid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {allFruitsData.map((fruit) => (
              <div
                key={fruit.name}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 border rounded-lg transition-all duration-200 ease-in-out
                  ${selectedFruits.includes(fruit.name) ? 'bg-lime-400 dark:bg-lime-700 border-lime-700 dark:border-lime-500 shadow-md' : 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'}
                  ${fruit.name === 'lime' ? 'cursor-pointer hover:scale-105' : 'cursor-pointer hover:scale-105'}
                `}
                onClick={() => handleFruitToggle(fruit.name, !selectedFruits.includes(fruit.name))}
              >
                <FruitIcon fruit={fruit.name} size="lg" />
                <span className="mt-2 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 text-center">
                  {fruit.name.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          {error && <p className="text-red-700 dark:text-red-400 text-center mb-4 text-base sm:text-lg">{error}</p>}
          <Button
            onClick={handleProceed}
            disabled={isProceedDisabled}
            className="w-full bg-caipi hover:bg-caipi-hover text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg h-14"
          >
            Start Game ({selectedFruits.length}/{fixedGridSize})
          </Button>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default FruitSelection;