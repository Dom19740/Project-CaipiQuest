import React from 'react';

interface FruitIconProps {
  fruit: string;
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojis: { [key: string]: string } = {
  passionfruit: '🥭', // Using mango for passionfruit as a placeholder emoji
  lemon: '🍋',
  strawberry: '🍓',
  mango: '🥭',
  lime: '🟢', // Using green circle for lime to distinguish from lemon
  pineapple: '🍍',
  pitaya: '🐉', // Using dragon emoji for pitaya (dragon fruit)
  plum: '🍑', // Using peach emoji for plum
  ginger: '🌳', // Using tree emoji as a placeholder for ginger
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const emoji = fruitEmojis[fruit.toLowerCase()] || '❓';
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <span className={`inline-block ${sizeClasses[size]}`} role="img" aria-label={fruit}>
      {emoji}
    </span>
  );
};

export default FruitIcon;