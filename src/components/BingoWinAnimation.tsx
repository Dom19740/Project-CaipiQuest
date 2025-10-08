import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

interface BingoWinAnimationProps {
  show: boolean;
  onClose: () => void;
}

const BingoWinAnimation: React.FC<BingoWinAnimationProps> = ({ show, onClose }) => {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onClose();
      }, 5000); // Confetti and message visible for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          initialVelocityY={20}
          confettiSource={{ x: 0, y: height / 2, w: width, h: 0 }}
          tweenDuration={5000}
        />
      )}
      <div className="relative p-10 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 dark:from-yellow-600 dark:via-orange-700 dark:to-pink-800 rounded-3xl shadow-glow border-8 border-white dark:border-gray-900 text-center animate-pop-in max-w-lg w-full mx-4 transform rotate-3">
        <h2 className="text-6xl sm:text-7xl text-white drop-shadow-lg mb-4 animate-bounce-text uppercase font-extrabold font-sans">
          BINGO!
        </h2>
        <p className="text-4xl sm:text-5xl text-white animate-fade-in-up uppercase font-bold font-sans">
          You win!!
        </p>
      </div>
    </div>
  );
};

export default BingoWinAnimation;