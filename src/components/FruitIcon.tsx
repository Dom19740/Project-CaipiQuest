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
  // lime: '🍋‍🟩', // Removed the ZWJ emoji for lime
  plum: '🫐',
};

const fruitImages: { [key: string]: string } = {
  lime: '/lime.png', // Path to the lime image
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: { emoji: 'text-base', img: 'w-4 h-4' },
    md: { emoji: 'text-xl', img: 'w-6 h-6' },
    lg: { emoji: 'text-4xl', img: 'w-8 h-8' },
  };

  const effectiveSizeClass = sizeClasses[size];
  const lowerCaseFruit = fruit.toLowerCase().replace(/\s/g, '_');

  if (fruitImages[lowerCaseFruit]) {
    return (
      <img
        src={fruitImages[lowerCaseFruit]}
        alt={fruit.replace(/_/g, ' ')}
        className={`inline-block ${effectiveSizeClass.img}`}
      />
    );
  }

  const emoji = fruitEmojis[lowerCaseFruit] || '❓'; // Fallback emoji

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass.emoji}`} role="img" aria-label={fruit.replace(/_/g, ' ')}>
      {emoji}
    </span>
  );
};

export default FruitIcon;