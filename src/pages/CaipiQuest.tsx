import React, { useState, useEffect } from 'react';
import BingoGrid from '@/components/BingoGrid';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess } from '@/utils/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
}

const CaipiQuest: React.FC = () => {
  const [bingoAlerts, setBingoAlerts] = useState<BingoAlert[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.1,
    initialVelocityX: { min: -5, max: 5 },
    initialVelocityY: { min: -10, max: -5 },
  });

  const handleBingo = (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => {
    showSuccess(message);
    setBingoAlerts(prev => [{ id: Date.now().toString(), type, message }, ...prev]); // Prepend new alerts

    // Trigger confetti
    setShowConfetti(true);
    if (type === 'fullGrid') {
      setConfettiConfig({
        numberOfPieces: 800,
        recycle: false,
        gravity: 0.3,
        initialVelocityX: { min: -15, max: 15 },
        initialVelocityY: { min: -20, max: -10 },
      });
    } else {
      setConfettiConfig({
        numberOfPieces: 200,
        recycle: false,
        gravity: 0.1,
        initialVelocityX: { min: -5, max: 5 },
        initialVelocityY: { min: -10, max: -5 },
      });
    }

    // Hide confetti after a short duration
    setTimeout(() => {
      setShowConfetti(false);
    }, type === 'fullGrid' ? 5000 : 2000); // Longer duration for full grid
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'diagonal':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lime-50 to-emerald-100 relative overflow-hidden">
      {showConfetti && <Confetti {...confettiConfig} />}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-8 drop-shadow-lg">
        CaipiQuest Bingo!
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <BingoGrid onBingo={handleBingo} />
        <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
          <CardHeader className="bg-lime-200 border-b border-lime-400">
            <CardTitle className="text-lime-800 text-2xl">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {bingoAlerts.length === 0 ? (
              <p className="text-gray-600 italic">No bingo alerts yet...</p>
            ) : (
              <ul className="space-y-2">
                {bingoAlerts.map((alert) => (
                  <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm ${getAlertClasses(alert.type)}`}>
                    {alert.message}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default CaipiQuest;