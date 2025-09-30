import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
}

interface RoomAlertsCardProps {
  alerts: BingoAlert[];
}

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

const RoomAlertsCard: React.FC<RoomAlertsCardProps> = ({ alerts }) => {
  return (
    <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
      <CardHeader className="bg-lime-200 border-b border-lime-400">
        <CardTitle className="text-lime-800 text-2xl">Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {alerts.length === 0 ? (
          <p className="text-gray-600 italic">No bingo alerts yet...</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm ${getAlertClasses(alert.type)}`}>
                {alert.message}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomAlertsCard;