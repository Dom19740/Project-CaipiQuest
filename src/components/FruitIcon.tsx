import React from 'react';

interface FruitIconProps {
  fruit: string;
  size?: 'sm' | 'md' | 'lg';
}

const fruitEmojis: { [key: string]: string } = {
  lime: '🍋',
  passionfruit: '🥭', // Using mango for passionfruit as a placeholder emoji
  pineapple: '🍍',
  mango: '🥭',
  strawberry: '🍓',
  cashew: '🌰', // Using chestnut for cashew as a placeholder emoji
  ginger: '🫚', // Using ginger root emoji
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