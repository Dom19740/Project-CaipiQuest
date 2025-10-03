import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerScore {
  id: string;
  name: string;
  squaresClicked: number;
  isMe: boolean;
}

interface RoomSidebarProps {
  roomCode: string;
  playerScores: PlayerScore[];
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({ roomCode, playerScores }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
      <CardHeader className="bg-lime-200 border-b border-lime-400">
        <CardTitle className="text-lime-800 text-2xl flex items-center justify-between mb-2">
          <span className="flex items-center">
            Room: {roomCode}
          </span>
          <span className="flex items-center text-lg">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
        <p className="text-gray-700 text-sm">Share this code with friends to play together!</p>
      </CardHeader>
      <CardContent className="p-4">
        {playerScores.length === 0 ? (
          <p className="text-gray-600 italic">No players in this room yet.</p>
        ) : (
          <ul className="space-y-2">
            {playerScores.map((player) => (
              <li
                key={player.id}
                className={cn(
                  "flex justify-between items-center p-2 rounded-md border",
                  player.isMe ? "bg-lime-100 border-lime-400 font-bold" : "bg-gray-50 border-gray-200"
                )}
              >
                <span className="text-gray-800">{player.name} {player.isMe && "(You)"}</span>
                <span className="text-gray-600">{player.squaresClicked} squares</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RoomSidebar;