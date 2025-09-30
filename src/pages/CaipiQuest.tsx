import React, { useState } from 'react';
import BingoGrid from '@/components/BingoGrid';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess } from '@/utils/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CaipiQuest: React.FC = () => {
  const [bingoAlerts, setBingoAlerts] = useState<string[]>([]);

  const handleBingo = (type: string) => {
    const message = `BINGO! You completed a ${type}!`;
    showSuccess(message);
    setBingoAlerts(prev => [...prev, message]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lime-50 to-emerald-100">
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
                {bingoAlerts.map((alert, index) => (
                  <li key={index} className="text-green-700 font-medium bg-green-100 p-2 rounded-md border border-green-300 shadow-sm">
                    {alert}
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