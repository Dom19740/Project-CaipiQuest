import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitData: { [key: string]: { emoji: string } } = {
  lime: { emoji: '🟢' },
  passionfruit: { emoji: '💜' },
  lemon: { emoji: '🍋' },
  strawberry: { emoji: '🍓' },
  mango: { emoji: '🥭' },
  pineapple: { emoji: '🍍' },
  red_fruits: { emoji: '🍒' },
  guava: { emoji: '🍑' },
  ginger: { emoji: '🌳' },
  tangerine: { emoji: '🍊' },
  kiwi: { emoji: '🥝' },
  cashew: { emoji: '🌰' },
  dragon_fruit: { emoji: '🐉' },
  banana: { emoji: '🍌' },
  plum: { emoji: '🟣' },
  watermelon: { emoji: '🍉' },
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const data = fruitData[fruit.toLowerCase()];
  const emoji = data?.emoji || '❓';

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-xl', // Changed 'lg' from 'text-2xl' to 'text-xl' for consistency
  };

  // Removed special handling for lime to ensure all 'lg' icons are 'text-xl'
  const effectiveSizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${effectiveSizeClass}`} role="img" aria-label={fruit}>
      {emoji}
    </span>
  );
};

export default FruitIcon;