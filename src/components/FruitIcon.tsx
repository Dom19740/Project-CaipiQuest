import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojiMap: { [key: string]: string } = {
  lime: '🍋',
  passionfruit: '💜', // Using purple heart as a vibrant stand-in for passionfruit
  lemon: '🍋',
  strawberry: '🍓',
  mango: '🥭',
  pineapple: '🍍',
  red_fruits: '🍒', // Cherries
  guava: '🍈', // Using melon as a vibrant stand-in for guava
  ginger: '🫚', // Ginger root emoji
  tangerine: '🍊',
  kiwi: '🥝',
  cashew: '🌰', // Cashew nut emoji
  dragon_fruit: '🐉', // Using dragon emoji as a vibrant stand-in for dragon fruit
  banana: '🍌',
  plum: '🫐', // Using blueberries as a vibrant stand-in for plum
  watermelon: '🍉',
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-base', // Smaller emoji size
    md: 'text-xl', // Medium emoji size
    lg: 'text-3xl', // Larger emoji size
  };

  const effectiveSizeClass = sizeClasses[size];
  const emoji = fruitEmojiMap[fruit.toLowerCase().replace(/\s/g, '_')] || '❓'; // Default to '?' emoji

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`}>
      {emoji}
    </span>
  );
};

export default FruitIcon;