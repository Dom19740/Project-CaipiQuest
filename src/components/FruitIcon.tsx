import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojis: { [key: string]: string } = {
  lime: '🍈', // Changed to melon for a green-ish look
  passionfruit: '💜',
  lemon: '🍋', // Lemon remains yellow
  strawberry: '🍓',
  mango: '🥭',
  pineapple: '🍍',
  red_fruits: '🍒',
  guava: '🍐', // Changed to pear
  ginger: '🫚',
  tangerine: '🍊',
  kiwi: '🥝',
  cashew: '🌰',
  dragon_fruit: '🐉',
  banana: '🍌',
  plum: '🫐',
  watermelon: '🍉',
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-base', // Roughly 16px
    md: 'text-xl',   // Roughly 24px
    lg: 'text-2xl',  // Roughly 32px
  };

  const effectiveSizeClass = sizeClasses[size];
  const emoji = fruitEmojis[fruit.toLowerCase().replace(/\s/g, '_')] || '❓'; // Fallback emoji

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`} role="img" aria-label={fruit.replace(/_/g, ' ')}>
      {emoji}
    </span>
  );
};

export default FruitIcon;