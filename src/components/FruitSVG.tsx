import React from 'react';

interface FruitSVGProps {
  fruit: string;
  className?: string;
}

const FruitSVG: React.FC<FruitSVGProps> = ({ fruit, className }) => {
  const size = "24"; // Default SVG size for consistency

  const fruitSVGs: { [key: string]: JSX.Element } = {
    lime: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#8BC34A"/>
        <path d="M10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10Z" fill="#689F38"/>
        <path d="M12 14C12 12.9 12.9 12 14 12C15.1 12 16 12.9 16 14C16 15.1 15.1 16 14 16C12.9 16 12 15.1 12 14Z" fill="#689F38"/>
        <path d="M8 14C8 12.9 8.9 12 10 12C11.1 12 12 12.9 12 14C12 15.1 11.1 16 10 16C8.9 16 8 15.1 8 14Z" fill="#689F38"/>
      </svg>
    ),
    passionfruit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#9C27B0"/>
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="#7B1FA2"/>
        <circle cx="12" cy="12" r="4" fill="#E0BBE4"/>
      </svg>
    ),
    lemon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M21.4 11.5C20.8 8.5 18.5 6.2 15.5 5.6C14.5 5.4 13.5 5.3 12.5 5.3C11.5 5.3 10.5 5.4 9.5 5.6C6.5 6.2 4.2 8.5 3.6 11.5C3.4 12.5 3.3 13.5 3.3 14.5C3.3 15.5 3.4 16.5 3.6 17.5C4.2 20.5 6.5 22.8 9.5 23.4C10.5 23.6 11.5 23.7 12.5 23.7C13.5 23.7 14.5 23.6 15.5 23.4C18.5 22.8 20.8 20.5 21.4 17.5C21.6 16.5 21.7 15.5 21.7 14.5C21.7 13.5 21.6 12.5 21.4 11.5Z" fill="#FFEB3B"/>
        <path d="M12 2C12 2 10 4 10 5C10 6 12 8 12 8C12 8 14 6 14 5C14 4 12 2 12 2Z" fill="#795548"/>
      </svg>
    ),
    strawberry: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C8.5 2 5.5 5 5.5 9C5.5 13 12 22 12 22C12 22 18.5 13 18.5 9C18.5 5 15.5 2 12 2Z" fill="#F44336"/>
        <circle cx="9" cy="9" r="1" fill="#D32F2F"/>
        <circle cx="15" cy="9" r="1" fill="#D32F2F"/>
        <circle cx="12" cy="13" r="1" fill="#D32F2F"/>
        <path d="M12 2L10 5H14L12 2Z" fill="#4CAF50"/>
      </svg>
    ),
    mango: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#FFC107"/>
        <path d="M12 18C12 18 10 20 10 22C10 24 14 24 14 22C14 20 12 18 12 18Z" fill="#795548"/>
      </svg>
    ),
    pineapple: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C10 2 8 4 8 6V18C8 20 10 22 12 22C14 22 16 20 16 18V6C16 4 14 2 12 2Z" fill="#FFD700"/>
        <path d="M12 2L10 5H14L12 2Z" fill="#4CAF50"/>
        <path d="M12 6L10 9H14L12 6Z" fill="#4CAF50"/>
        <path d="M12 10L10 13H14L12 10Z" fill="#4CAF50"/>
        <path d="M12 14L10 17H14L12 14Z" fill="#4CAF50"/>
      </svg>
    ),
    red_fruits: ( // Cherries
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="8" cy="14" r="4" fill="#D32F2F"/>
        <circle cx="16" cy="14" r="4" fill="#D32F2F"/>
        <path d="M8 10L10 4L14 4L16 10" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    guava: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#FFB74D"/>
        <path d="M12 18C12 18 10 20 10 22C10 24 14 24 14 22C14 20 12 18 12 18Z" fill="#795548"/>
        <circle cx="12" cy="10" r="3" fill="#FF8A65"/>
      </svg>
    ),
    ginger: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#FFCC80"/>
        <path d="M12 18C12 18 10 20 10 22C10 24 14 24 14 22C14 20 12 18 12 18Z" fill="#795548"/>
        <path d="M12 10C12 10 10 12 10 14C10 16 14 16 14 14C14 12 12 10 12 10Z" fill="#FFAB40"/>
      </svg>
    ),
    tangerine: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#FF9800"/>
        <path d="M12 2C12 2 10 4 10 5C10 6 12 8 12 8C12 8 14 6 14 5C14 4 12 2 12 2Z" fill="#4CAF50"/>
      </svg>
    ),
    kiwi: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <ellipse cx="12" cy="12" rx="10" ry="8" fill="#8BC34A"/>
        <path d="M12 4C12 4 10 6 10 8C10 10 12 12 12 12C12 12 14 10 14 8C14 6 12 4 12 4Z" fill="#689F38"/>
        <circle cx="12" cy="12" r="2" fill="#212121"/>
      </svg>
    ),
    cashew: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#FFCC80"/>
        <path d="M12 18C12 18 10 20 10 22C10 24 14 24 14 22C14 20 12 18 12 18Z" fill="#795548"/>
        <path d="M12 10C12 10 10 12 10 14C10 16 14 16 14 14C14 12 12 10 12 10Z" fill="#FFAB40"/>
      </svg>
    ),
    dragon_fruit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#F48FB1"/>
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="#E91E63"/>
        <circle cx="12" cy="12" r="2" fill="#FFFFFF"/>
      </svg>
    ),
    banana: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C12 2 10 4 10 5C10 6 12 8 12 8C12 8 14 6 14 5C14 4 12 2 12 2Z" fill="#795548"/>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#FFEB3B"/>
      </svg>
    ),
    plum: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" fill="#673AB7"/>
        <path d="M12 2C12 2 10 4 10 5C10 6 12 8 12 8C12 8 14 6 14 5C14 4 12 2 12 2Z" fill="#4CAF50"/>
      </svg>
    ),
    watermelon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2Z" fill="#F44336"/>
        <path d="M12 18C12 18 10 20 10 22C10 24 14 24 14 22C14 20 12 18 12 18Z" fill="#4CAF50"/>
        <circle cx="9" cy="9" r="1" fill="#212121"/>
        <circle cx="15" cy="9" r="1" fill="#212121"/>
        <circle cx="12" cy="13" r="1" fill="#212121"/>
      </svg>
    ),
  };

  const fruitKey = fruit.toLowerCase().replace(/\s/g, '_');
  return fruitSVGs[fruitKey] || (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2"/>
      <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ); // Default '?' icon
};

export default FruitSVG;