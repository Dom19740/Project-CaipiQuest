import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojis: { [key: string]: string } = {
  passionfruit: '💜',
  lemon: '🍋',
  strawberry: '🍓',
  mango: '🥭',
  pineapple: '🍍',
  red_fruits: '🍒',
  guava: '🍐',
  ginger: '🫚',
  tangerine: '🍊',
  kiwi: '🥝',
  cashew: '🌰',
  dragon_fruit: '🐉',
  banana: '🍌',
  watermelon: '🍉',
  lime: '🍋‍🟩', // Added emoji for lime
  plum: '🫐', // Updated emoji for plum
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: { emoji: 'text-base', circle: 'w-4 h-4' },
    md: { emoji: 'text-xl', circle: 'w-6 h-6' },
    lg: { emoji: 'text-2xl', circle: 'w-8 h-8' },
  };

  const effectiveSizeClass = sizeClasses[size];
  const lowerCaseFruit = fruit.toLowerCase().replace(/\s/g, '_');

  // Removed specific rendering for lime and plum, now they use emojis from fruitEmojis

  const emoji = fruitEmojis[lowerCaseFruit] || '❓'; // Fallback emoji

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass.emoji}`} role="img" aria-label={fruit.replace(/_/g, ' ')}>
      {emoji}
    </span>
  );
};

export default FruitIcon;