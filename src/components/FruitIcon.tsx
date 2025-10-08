import React from 'react';

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const effectiveSizeClass = sizeClasses[size];
  const normalizedFruitName = fruit.toLowerCase().replace(/\s/g, '_');

  // Construct the path to the PNG image
  const imagePath = `/src/assets/fruit_pngs/${normalizedFruitName}.png`;
  const defaultImagePath = `/src/assets/fruit_pngs/default_fruit.png`;

  return (
    <img
      src={imagePath}
      alt={fruit.replace(/_/g, ' ')}
      className={`inline-flex items-center justify-center object-contain ${effectiveSizeClass}`}
      onError={(e) => {
        // Fallback to a default image if the specific fruit PNG is not found
        e.currentTarget.src = defaultImagePath;
        e.currentTarget.onerror = null; // Prevent infinite loop if default also fails
        console.warn(`PNG not found for fruit: ${fruit}. Using default.`);
      }}
    />
  );
};

export default FruitIcon;