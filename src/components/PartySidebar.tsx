import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface PlayerScore {
  id: string;
  name: string;
  caipisCount: number;
  isMe: boolean;
}

interface PartySidebarProps {
  partyCode: string;
  playerScores: PlayerScore[];
  alerts: BingoAlert[];
  currentUserId: string | null;
}

const getAlertClasses = (alert: BingoAlert, currentUserId: string | null) => {
  const isMyAlert = alert.playerId === currentUserId;

  switch (alert.type) {
    case 'rowCol':
      return isMyAlert
        ? 'text-red-800 dark:text-red-200 bg-red-200 dark:bg-red-800 border-red-400 dark:border-red-600'
        : 'text-green-800 dark:text-green-200 bg-green-200 dark:bg-green-800 border-green-400 dark:border-green-600';
    case 'diagonal':
      return isMyAlert
        ? 'text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-800 border-blue-400 dark:border-blue-600'
        : 'text-yellow-800 dark:text-yellow-200 bg-yellow-200 dark:bg-yellow-800 border-yellow-400 dark:border-yellow-600';
    case 'fullGrid':
      return 'text-white bg-gradient-to-r from-purple-700 to-pink-800 border-purple-900 text-3xl font-extrabold p-4 animate-pulse';
    default:
      return 'text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600';
  }
};

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, playerScores, alerts, currentUserId }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-lime-500 dark:border-lime-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-lime-300/80 dark:bg-lime-800/80 border-b border-lime-500 dark:border-lime-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-lime-900 dark:text-lime-100 flex items-center justify-between mb-2">
          <span className="flex items-center">
            Party: {partyCode}
          </span>
          <span className="flex items-center text-base sm:text-lg">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
        <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base">Share this code with friends to play together!</p>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Alerts Section */}
        <div className="bg-yellow-100/70 dark:bg-yellow-900/70 border border-yellow-400 dark:border-yellow-700 rounded-lg p-3 shadow-inner max-h-[180px] overflow-y-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-3">Bingo Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300 italic text-sm sm:text-base">No bingo alerts yet...</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm sm:text-base ${getAlertClasses(alert, currentUserId)}`}>
                  {alert.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Player List Section */}
        <div className="bg-blue-100/70 dark:bg-blue-900/70 border border-blue-400 dark:border-blue-700 rounded-lg p-3 shadow-inner">
          <h3 className="text-lg sm:text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">Players</h3>
          {playerScores.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300 italic text-sm sm:text-base">No players in this party yet.</p>
          ) : (
            <ul className="space-y-2">
              {playerScores.map((player) => (
                <li
                  key={player.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md border text-sm sm:text-base",
                    player.isMe ? "bg-lime-200 dark:bg-lime-800 border-lime-500 dark:border-lime-700 font-bold text-gray-900 dark:text-gray-100" : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  )}
                >
                  <span className="text-inherit">{player.name} {player.isMe && "(You)"}</span>
                  <span className="text-inherit">{player.caipisCount} Caipis</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartySidebar;