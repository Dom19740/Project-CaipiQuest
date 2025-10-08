import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Users, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/components/SessionContextProvider'; // Corrected import

interface PartySidebarProps {
  roomId: string;
  roomCode: string;
  players: { id: string; name: string }[];
  onRefreshPlayers: () => void;
  createdBy: string | null;
  createdByName: string | null;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  roomCode,
  players,
  onRefreshPlayers,
  createdBy,
  createdByName,
}) => {
  const [copied, setCopied] = useState(false);
  const { user } = useSession(); // Corrected hook usage
  const currentUserId = user?.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    showSuccess('Party code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshRoom = async () => {
    if (!roomId) return;

    const { error } = await supabase
      .from('rooms')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', roomId);

    if (error) {
      showError('Failed to refresh room status.');
      console.error('Error refreshing room:', error);
    } else {
      onRefreshPlayers();
      showSuccess('Room refreshed!');
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Share Code
          </span>
          {currentUserId === createdBy && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefreshRoom}
              className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
              title="Refresh Room"
            >
              <RefreshCcw className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-orange-800 dark:text-orange-200 text-sm mt-2">
          Share this code with your friends to invite them to your party!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="room-code" className="sr-only">
            Party Code
          </Label>
          <Input
            id="room-code"
            readOnly
            value={roomCode}
            className="flex-1 bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700 text-orange-900 dark:text-orange-100 font-mono text-lg"
          />
          <Button onClick={handleCopy} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Copy className="mr-2 h-4 w-4" /> {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Players ({players.length})</h3>
          <ul className="space-y-1">
            {players.map((player) => (
              <li key={player.id} className="flex items-center text-orange-800 dark:text-orange-200">
                <Users className="mr-2 h-4 w-4" /> {player.name}
                {player.id === createdBy && <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">(Host)</span>}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-orange-200 dark:border-orange-700 text-sm text-orange-700 dark:text-orange-300">
        {createdByName && (
          <p>
            Party created by <span className="font-semibold">{createdByName}</span>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PartySidebar;