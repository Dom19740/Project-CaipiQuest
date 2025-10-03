import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { showError } from '@/utils/toast';
import FruitIcon from '@/components/FruitIcon';
import { MadeWithDyad } from '@/components/made-with-dyad';

// Full list of fruits with English names and emojis
const allFruitsData = [
  { name: 'lime', emoji: '🟢' },
  { name: 'passionfruit', emoji: '💜' },
  { name: 'lemon', emoji: '🍋' },
  { name: 'strawberry', emoji: '🍓' },
  { name: 'mango', emoji: '🥭' },
  { name: 'pineapple', emoji: '🍍' },
  { name: 'red_fruits', emoji: '🍒' },
  { name: 'guava', emoji: '🍑' },
  { name: 'ginger', emoji: '🌳' },
  { name: 'tangerine', emoji: '🍊' },
  { name: 'kiwi', emoji: '🥝' },
  { name: 'cashew', emoji: '🌰' },
];

const FruitSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = location.state || {};

  const fixedGridSize = 5; // Hardcode grid size to 5
  const [selectedFruits, setSelectedFruits] = useState<string[]>(['lime']); // Lime is pre-selected
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      showError("Party ID not found. Please create or join a party first.");
      navigate('/lobby');
    }
  }, [roomId, navigate]);

  const handleFruitToggle = (fruitName: string, isChecked: boolean) => {
    if (fruitName === 'lime') return; // Lime is always selected and cannot be deselected

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-4 border-lime-400">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-4 drop-shadow-lg">
            Choose Your Fruits
          </CardTitle>
          <CardDescription className="text-xl text-gray-700 mb-6">
            Select 5 fruits for your bingo grid. Lime is already chosen for the center!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {allFruitsData.map((fruit) => (
              <div
                key={fruit.name}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all duration-200 ease-in-out
                  ${selectedFruits.includes(fruit.name) ? 'bg-lime-200 border-lime-500 shadow-md' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                  ${fruit.name === 'lime' ? 'cursor-not-allowed bg-lime-300 border-lime-600' : 'cursor-pointer hover:scale-105'}
                `}
                onClick={() => handleFruitToggle(fruit.name, !selectedFruits.includes(fruit.name))}
              >
                <FruitIcon fruit={fruit.name} size="sm" />
                <span className="mt-1 text-sm font-medium text-gray-800 text-center">
                  {fruit.name.replace(/_/g, ' ')} {/* Display English name, replace underscores */}
                </span>
              </div>
            ))}
          </div>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <Button
            onClick={handleProceed}
            disabled={isProceedDisabled}
            className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg"
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