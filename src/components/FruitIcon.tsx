import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
  showPortuguese?: boolean; // New prop to show Portuguese name
}

const fruitData: { [key: string]: { emoji: string; portuguese: string } } = {
  lime: { emoji: '🟢', portuguese: 'Limão' },
  passionfruit: { emoji: '💜', portuguese: 'Maracujá' },
  lemon: { emoji: '🍋', portuguese: 'Limão Siciliano' },
  strawberry: { emoji: '🍓', portuguese: 'Morango' },
  mango: { emoji: '🥭', portuguese: 'Manga' },
  pineapple: { emoji: '🍍', portuguese: 'Abacaxi' },
  red_fruits: { emoji: '🍒', portuguese: 'Frutas Vermelhas' }, // Changed from dragonfruit/Pitaya
  guava: { emoji: '🍑', portuguese: 'Goiaba' }, // Changed from plum/Ameixa
  ginger: { emoji: '🌳', portuguese: 'Gengibre' },
  tangerine: { emoji: '🍊', portuguese: 'Tangerina' }, // Changed from banana/Banana
  kiwi: { emoji: '🥝', portuguese: 'Kiwi' },
  cashew: { emoji: '🌰', portuguese: 'Caju' }, // Added Caju
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md', showPortuguese = false }) => {
  const data = fruitData[fruit.toLowerCase()];
  const emoji = data?.emoji || '❓';

  const sizeClasses = {
    sm: 'text-base', // Reduced from text-xl
    md: 'text-xl',   // Reduced from text-2xl
    lg: 'text-2xl',   // Reduced from text-3xl
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]}`} role="img" aria-label={fruit}>
      {emoji} {showPortuguese && <span className="ml-2 text-base">{data?.portuguese}</span>}
    </span>
  );
};

export default FruitIcon;