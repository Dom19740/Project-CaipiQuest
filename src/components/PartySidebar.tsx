import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerScore {
  id: string;
  name: string;
  caipisCount: number; // Changed from squaresClicked
  isMe: boolean;
}

interface PartySidebarProps {
  partyCode: string;
  playerScores: PlayerScore[];
}

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, playerScores }) => {
  const playerCount = playerScores.length;

  return (
    <Card className="w-full flex-1 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
      <CardHeader className="bg-lime-200 border-b border-lime-400">
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
        {playerScores.length === 0 ? (
          <p className="text-gray-600 italic">No players in this party yet.</p>
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
                <span className="text-gray-600">{player.caipisCount} caipis</span> {/* Changed text and prop */}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;