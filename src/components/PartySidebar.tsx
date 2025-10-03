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
        ? 'text-red-700 bg-red-100 border-red-300' // Current user: Red
        : 'text-green-700 bg-green-100 border-green-300'; // Others: Green
    case 'diagonal':
      return isMyAlert
        ? 'text-blue-700 bg-blue-100 border-blue-300' // Current user: Blue
        : 'text-yellow-700 bg-yellow-100 border-yellow-300'; // Others: Yellow
    case 'fullGrid':
      return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse'; // Fancy for everyone
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300';
  }
};

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, playerScores, alerts, currentUserId }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2 rounded-xl">
      <CardHeader className="bg-lime-200 border-b border-lime-400 rounded-t-xl">
        <CardTitle className="text-lg text-lime-800 flex items-center justify-between mb-2">
          <span className="flex items-center">
            Party: {partyCode}
          </span>
          <span className="flex items-center text-base">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
        <p className="text-gray-700 text-sm">Share this code with friends to play together!</p>
      </CardHeader>
      <CardContent className="p-4">
        {/* Alerts Section */}
        <div className="mb-4 pb-4 border-b border-gray-200 max-h-[150px] overflow-y-auto"> {/* Added max-h and overflow */}
          {alerts.length === 0 ? (
            <p className="text-gray-600 italic text-sm">No bingo alerts yet...</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm ${getAlertClasses(alert, currentUserId)}`}>
                  {alert.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Player List Section */}
        <h3 className="text-md font-semibold text-lime-700 mb-2">Players</h3>
        {playerScores.length === 0 ? (
          <p className="text-gray-600 italic text-sm">No players in this party yet.</p>
        ) : (
          <ul className="space-y-2">
            {playerScores.map((player) => (
              <li
                key={player.id}
                className={cn(
                  "flex justify-between items-center p-2 rounded-md border text-sm",
                  player.isMe ? "bg-lime-100 border-lime-400 font-bold" : "bg-gray-50 border-gray-200"
                )}
              >
                <span className="text-gray-800">{player.name} {player.isMe && "(You)"}</span>
                <span className="text-gray-600">{player.caipisCount} Caipis</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;