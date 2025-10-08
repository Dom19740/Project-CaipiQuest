import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojiMap: { [key: string]: string } = {
  lime: '🍋‍🟩',
  passionfruit: '💜',
  lemon: '🍋',
  strawberry: '🍓',
  mango: '🥭',
  pineapple: '🍍',
  red_fruits: '🍒',
  guava: '🍈',
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
    sm: 'text-base', // Smaller emoji size
    md: 'text-xl', // Medium emoji size
    lg: 'text-2xl', // Larger emoji size
  };

  const effectiveSizeClass = sizeClasses[size];
  const NormalizedFruitName = fruit.toLowerCase().replace(/\s/g, '_');
  const emoji = fruitEmojiMap[NormalizedFruitName];

  if (!emoji) {
    console.warn(`No emoji found for fruit: ${fruit}`);
    return <span className={effectiveSizeClass}>❓</span>;
  }

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`}>
      {emoji}
    </span>
  );
};

export default FruitIcon;