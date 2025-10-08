import React from 'react';
import LimeIcon from '@/assets/fruits/lime.svg?react'; // Import SVG as a React component

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojiMap: { [key: string]: string } = {
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
    sm: 'w-4 h-4', // Tailwind classes for SVG size
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const effectiveSizeClass = sizeClasses[size];
  const normalizedFruitName = fruit.toLowerCase().replace(/\s/g, '_');

  if (normalizedFruitName === 'lime') {
    return <LimeIcon className={`inline-flex items-center justify-center text-lime-600 dark:text-lime-400 ${effectiveSizeClass}`} />;
  }

  const emoji = fruitEmojiMap[normalizedFruitName];

  if (!emoji) {
    console.warn(`No emoji found for fruit: ${fruit}`);
    return <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`}>❓</span>;
  }

  // For emojis, we use text size classes
  const emojiTextSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span className={`inline-flex items-center justify-center ${emojiTextSizeClasses[size]}`}>
      {emoji}
    </span>
  );
};

export default FruitIcon;