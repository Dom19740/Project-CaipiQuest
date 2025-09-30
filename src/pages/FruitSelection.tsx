import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { showError } from '@/utils/toast';
import FruitIcon from '@/components/FruitIcon';
import { MadeWithDyad } from '@/components/made-with-dyad';

// Full list of fruits with English names, Portuguese names, and emojis
const allFruitsData = [
  { name: 'lime', portuguese: 'Limão', emoji: '🟢' },
  { name: 'passionfruit', portuguese: 'Maracujá', emoji: '💜' },
  { name: 'lemon', portuguese: 'Limão Siciliano', emoji: '🍋' },
  { name: 'strawberry', portuguese: 'Morango', emoji: '🍓' },
  { name: 'mango', portuguese: 'Manga', emoji: '🥭' },
  { name: 'pineapple', portuguese: 'Abacaxi', emoji: '🍍' },
  { name: 'red_fruits', portuguese: 'Frutas Vermelhas', emoji: '🍒' }, // Changed from dragonfruit
  { name: 'guava', portuguese: 'Goiaba', emoji: '🍑' }, // Changed from plum
  { name: 'ginger', portuguese: 'Gengibre', emoji: '🌳' },
  { name: 'tangerine', portuguese: 'Tangerina', emoji: '🍊' }, // Changed from banana
  { name: 'kiwi', portuguese: 'Kiwi', emoji: '🥝' },
  { name: 'cashew', portuguese: 'Caju', emoji: '🌰' }, // Added Caju
];

const FruitSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, gridSize: initialGridSize } = location.state || {};

  const [gridSize, setGridSize] = useState<number>(initialGridSize || 5); // Default to 5 if not provided
  const [selectedFruits, setSelectedFruits] = useState<string[]>(['lime']); // Lime is pre-selected
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !initialGridSize) {
      showError("Room ID or grid size not found. Please create or join a room first.");
      navigate('/lobby');
    } else {
      setGridSize(initialGridSize);
    }
  }, [roomId, initialGridSize, navigate]);

  const handleFruitToggle = (fruitName: string, isChecked: boolean) => {
    if (fruitName === 'lime') return; // Lime is always selected and cannot be deselected

    if (isChecked) {
      if (selectedFruits.length < gridSize) {
        setSelectedFruits(prev => [...prev, fruitName]);
        setError(null);
      } else {
        setError(`You can select a maximum of ${gridSize} fruits.`);
      }
    } else {
      setSelectedFruits(prev => prev.filter(f => f !== fruitName));
      setError(null);
    }
  };

  const handleProceed = () => {
    if (selectedFruits.length !== gridSize) {
      setError(`Please select exactly ${gridSize} fruits. You have selected ${selectedFruits.length}.`);
      return;
    }
    navigate(`/game/${roomId}`, { state: { selectedFruits, gridSize } }); // Pass gridSize to GameRoom
  };

  const isProceedDisabled = selectedFruits.length !== gridSize;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-100 p-4">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border-4 border-lime-400">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-4 drop-shadow-lg">
            Choose Your Fruits
          </CardTitle>
          <CardDescription className="text-xl text-gray-700 mb-6">
            Select exactly {gridSize} fruits for your {gridSize}x{gridSize} bingo grid. Lime is already chosen for the center!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {allFruitsData.map((fruit) => (
              <div key={fruit.name} className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id={fruit.name}
                  checked={selectedFruits.includes(fruit.name)}
                  onCheckedChange={(checked) => handleFruitToggle(fruit.name, checked as boolean)}
                  disabled={fruit.name === 'lime'}
                  className={fruit.name === 'lime' ? 'cursor-not-allowed' : ''}
                />
                <Label htmlFor={fruit.name} className="flex items-center cursor-pointer text-lg font-medium text-gray-800">
                  <FruitIcon fruit={fruit.name} size="md" />
                  <span className="ml-2">{fruit.portuguese}</span>
                </Label>
              </div>
            ))}
          </div>
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}
          <Button
            onClick={handleProceed}
            disabled={isProceedDisabled}
            className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg"
          >
            Start Game ({selectedFruits.length}/{gridSize})
          </Button>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default FruitSelection;