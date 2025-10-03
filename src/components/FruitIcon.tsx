import React from 'react';
import FruitSVG from './FruitSVG'; // NEW: Import FruitSVG

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4', // Smaller SVG size
    md: 'w-6 h-6', // Medium SVG size
    lg: 'w-8 h-8', // Larger SVG size
  };

  const effectiveSizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`}>
      <FruitSVG fruit={fruit} className="w-full h-full" />
    </span>
  );
};

export default FruitIcon;