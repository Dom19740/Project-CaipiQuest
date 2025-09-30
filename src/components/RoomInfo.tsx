import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface RoomInfoProps {
  roomCode: string;
  playerCount: number;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ roomCode, playerCount }) => {
  return (
    <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
      <CardHeader className="bg-lime-200 border-b border-lime-400">
        <CardTitle className="text-lime-800 text-2xl flex items-center justify-between">
          Room: {roomCode}
          <span className="flex items-center text-lg">
            <Users className="mr-2 h-5 w-5" /> {playerCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-gray-700">Share this code with friends to play together!</p>
      </CardContent>
    </Card>
  );
};

export default RoomInfo;