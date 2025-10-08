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
    case 'diagonal': // Both rowCol and diagonal will use the same color scheme
      return isMyAlert
        ? 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700'
        : 'text-yellow-800 dark:text-yellow-200 bg-yellow-300 dark:bg-yellow-800 border-yellow-500 dark:border-yellow-700';
    case 'fullGrid':
      // Full grid alerts remain distinct and celebratory
      return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-3xl p-4 animate-pulse';
    default:
      return 'text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
  }
};

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, playerScores, alerts, currentUserId }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-xl border-lime-500 dark:border-lime-600 border-4 rounded-2xl text-card-foreground p-4">
      <CardHeader className="bg-lime-400/80 dark:bg-lime-800/80 border-b border-lime-600 dark:border-lime-700 rounded-2xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-lime-900 dark:text-lime-100 flex items-center justify-between mb-2 font-normal">
          <span className="flex items-center">
            Party: {partyCode}
          </span>
          <span className="flex items-center text-base sm:text-lg">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
        <p className="text-gray-900 dark:text-gray-200 text-sm sm:text-base">Share this code with friends to play together!</p>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Alerts Section */}
        <div className="bg-yellow-200/70 dark:bg-yellow-900/70 border border-yellow-500 dark:border-yellow-800 rounded-lg p-3 shadow-inner max-h-[180px] overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-gray-800 dark:text-gray-300 italic text-sm sm:text-base">No bingo alerts yet...</p>
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
        <div className="bg-lime-200/70 dark:bg-lime-900/70 border border-lime-500 dark:border-lime-800 rounded-lg p-3 shadow-inner">
          {playerScores.length === 0 ? (
            <p className="text-gray-800 dark:text-gray-300 italic text-sm sm:text-base">No players in this party yet.</p>
          ) : (
            <ul className="space-y-2">
              {playerScores.map((player) => (
                <li
                  key={player.id}
                  className={cn(
                    "flex justify-between items-center p-2 rounded-md border text-sm sm:text-base",
                    player.isMe ? "bg-lime-300 dark:bg-lime-800 border-lime-600 dark:border-lime-700 text-gray-900 dark:text-gray-100" : "bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-900 dark:text-gray-200"
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