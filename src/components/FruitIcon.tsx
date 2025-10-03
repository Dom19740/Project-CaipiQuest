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
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const data = fruitData[fruit.toLowerCase()];
  const emoji = data?.emoji || '❓';

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]}`} role="img" aria-label={fruit}>
      {emoji}
    </span>
  );
};

export default FruitIcon;