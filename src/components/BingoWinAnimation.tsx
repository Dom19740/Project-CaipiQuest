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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
      <div className="relative p-8 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 text-center animate-pop-in max-w-lg w-full mx-4">
        <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 drop-shadow-lg mb-4 animate-bounce-text">
          BINGO!
        </h2>
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 animate-fade-in-up">
          You win!!
        </p>
      </div>
    </div>
  );
};

export default BingoWinAnimation;