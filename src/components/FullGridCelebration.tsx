import React from 'react';
import { Button } from '@/components/ui/button';

interface FullGridCelebrationProps {
  onClose: () => void;
}

const FullGridCelebration: React.FC<FullGridCelebrationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-lime-400 via-emerald-400 to-pink-400 bg-opacity-90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-8 border-lime-600 p-8 text-center max-w-lg w-full transform scale-95 animate-scale-in">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 mb-6 drop-shadow-lg animate-bounce-once">
          🎉 BINGO! FULL GRID! 🎉
        </h2>
        <p className="text-2xl text-gray-800 font-semibold mb-8">
          You've completed the entire CaipiQuest grid! Amazing!
        </p>
        <Button
          onClick={onClose}
          className="px-8 py-4 text-lg bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default FullGridCelebration;