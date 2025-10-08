import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

// Mapping all fruit names to their PNG paths in src/assets/fruit_pngs
const fruitImages: { [key: string]: string } = {
  passionfruit: '/src/assets/fruit_pngs/passionfruit.png',
  lemon: '/src/assets/fruit_pngs/lemon.png',
  strawberry: '/src/assets/fruit_pngs/strawberry.png',
  mango: '/src/assets/fruit_pngs/mango.png',
  pineapple: '/src/assets/fruit_pngs/pineapple.png',
  red_fruits: '/src/assets/fruit_pngs/berries.png', // Assuming 'berries.png' for 'red_fruits'
  guava: '/src/assets/fruit_pngs/guava.png',
  ginger: '/src/assets/fruit_pngs/ginger.png',
  tangerine: '/src/assets/fruit_pngs/tangerine.png',
  kiwi: '/src/assets/fruit_pngs/kiwi.png',
  cashew: '/src/assets/fruit_pngs/cashew.png',
  dragon_fruit: '/src/assets/fruit_pngs/dragon.png', // Assuming 'dragon.png' for 'dragon_fruit'
  banana: '/src/assets/fruit_pngs/banana.png',
  watermelon: '/src/assets/fruit_pngs/watermelon.png',
  lime: '/src/assets/fruit_pngs/lime.png',
  plum: '/src/assets/fruit_pngs/plum.png',
};

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const effectiveSizeClass = sizeClasses[size];
  const lowerCaseFruit = fruit.toLowerCase().replace(/\s/g, '_');

  const imagePath = fruitImages[lowerCaseFruit];

  if (!imagePath) {
    console.warn(`Fruit image not found for: ${fruit}. Using placeholder.`);
    return (
      <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`} role="img" aria-label={fruit.replace(/_/g, ' ')}>
        ❓
      </span>
    );
  }

  return (
    <img
      src={imagePath}
      alt={fruit.replace(/_/g, ' ')}
      className={`inline-block ${effectiveSizeClass}`}
    />
  );
};

export default FruitIcon;