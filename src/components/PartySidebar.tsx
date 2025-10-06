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
  alerts: BingoAlert[]; // NEW: Alerts prop
  currentUserId: string | null; // NEW: Current user ID prop
}

const getAlertClasses = (alert: BingoAlert, currentUserId: string | null) => {
  const isMyAlert = alert.playerId === currentUserId;

  switch (alert.type) {
    case 'rowCol':
      return isMyAlert
        ? 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' // Current user: Red
        : 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700'; // Others: Green
    case 'diagonal':
      return isMyAlert
        ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' // Current user: Blue
        : 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700'; // Others: Yellow
    case 'fullGrid':
      return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse'; // Fancy for everyone
    default:
      return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
  }
};

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, playerScores, alerts, currentUserId }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-lime-400 dark:border-lime-700 border-2 rounded-xl text-card-foreground">
      <CardHeader className="bg-lime-200 dark:bg-lime-900 border-b border-lime-400 dark:border-lime-700 rounded-t-xl">
        <CardTitle className="text-lg sm:text-xl text-lime-800 dark:text-lime-200 flex items-center justify-between mb-2">
          <span className="flex items-center">
            Party: {partyCode}
          </span>
          <span className="flex items-center text-base sm:text-lg">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
        <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Share this code with friends to play together!</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Alerts Section */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 max-h-[150px] overflow-y-auto"> {/* Added max-h and overflow */}
          {alerts.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 italic text-sm sm:text-base">No bingo alerts yet...</p>
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
        <h3 className="text-md sm:text-lg font-semibold text-lime-700 dark:text-lime-300 mb-2">Players</h3>
        {playerScores.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic text-sm sm:text-base">No players in this party yet.</p>
        ) : (
          <ul className="space-y-2">
            {playerScores.map((player) => (
              <li
                key={player.id}
                className={cn(
                  "flex justify-between items-center p-2 rounded-md border text-sm sm:text-base",
                  player.isMe ? "bg-lime-100 dark:bg-lime-800 border-lime-400 dark:border-lime-600 font-bold text-gray-900 dark:text-gray-100" : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                )}
              >
                <span className="text-inherit">{player.name} {player.isMe && "(You)"}</span>
                <span className="text-inherit">{player.caipisCount} Caipis</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;