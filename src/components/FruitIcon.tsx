import React from 'react';

// Import all SVG icons dynamically
const fruitSvgMap: { [key: string]: React.FunctionComponent<React.SVGProps<SVGSVGElement>> } = {
  lime: React.lazy(() => import('@/assets/fruits/lime.svg?react')),
  passionfruit: React.lazy(() => import('@/assets/fruits/passionfruit.svg?react')),
  lemon: React.lazy(() => import('@/assets/fruits/lemon.svg?react')),
  strawberry: React.lazy(() => import('@/assets/fruits/strawberry.svg?react')),
  mango: React.lazy(() => import('@/assets/fruits/mango.svg?react')),
  pineapple: React.lazy(() => import('@/assets/fruits/pineapple.svg?react')),
  red_fruits: React.lazy(() => import('@/assets/fruits/red_fruits.svg?react')),
  guava: React.lazy(() => import('@/assets/fruits/guava.svg?react')),
  ginger: React.lazy(() => import('@/assets/fruits/ginger.svg?react')),
  tangerine: React.lazy(() => import('@/assets/fruits/tangerine.svg?react')),
  kiwi: React.lazy(() => import('@/assets/fruits/kiwi.svg?react')),
  cashew: React.lazy(() => import('@/assets/fruits/cashew.svg?react')),
  dragon_fruit: React.lazy(() => import('@/assets/fruits/dragon_fruit.svg?react')),
  banana: React.lazy(() => import('@/assets/fruits/banana.svg?react')),
  plum: React.lazy(() => import('@/assets/fruits/plum.svg?react')),
  watermelon: React.lazy(() => import('@/assets/fruits/watermelon.svg?react')),
};

interface FruitIconProps {
  fruit: string; // This will be the English name
  size?: 'sm' | 'md' | 'lg';
}

const FruitIcon: React.FC<FruitIconProps> = ({ fruit, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5', // Smaller SVG size
    md: 'w-7 h-7', // Medium SVG size
    lg: 'w-9 h-9', // Larger SVG size
  };

  const effectiveSizeClass = sizeClasses[size];
  const NormalizedFruitName = fruit.toLowerCase().replace(/\s/g, '_');
  const SvgComponent = fruitSvgMap[NormalizedFruitName];

  if (!SvgComponent) {
    console.warn(`No SVG found for fruit: ${fruit}`);
    return <span className={`inline-flex items-center justify-center ${effectiveSizeClass}`}>❓</span>;
  }

  return (
    <React.Suspense fallback={<div className={effectiveSizeClass} />}>
      <SvgComponent className={`inline-flex items-center justify-center ${effectiveSizeClass}`} />
    </React.Suspense>
  );
};

export default FruitIcon;