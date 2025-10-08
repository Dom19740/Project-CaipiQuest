import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, Loader2, LogOut, RefreshCcw } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

// Define PlayerScore and BingoAlert interfaces for clarity
interface PlayerScore {
  id: string;
  name: string;
  caipisCount: number;
  isMe: boolean;
}

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface PartySidebarProps {
  partyCode: string; // The room code to display
  playerScores: PlayerScore[]; // List of players and their scores
  alerts: BingoAlert[]; // List of bingo alerts (not directly used in this component, but kept for consistency if needed later)
  currentUserId: string; // The ID of the current user
  partyCreatorId: string | null; // The ID of the party creator
  partyCreatorName: string | null; // The name of the party creator
  gridSize: number; // The grid size
  onRefreshPlayers: () => void; // Function to refresh player data (only for host)
  onLeaveParty: () => void; // Function to leave/disband the party
  myPlayerName: string; // The current user's player name (not directly used in this component, but kept for consistency if needed later)
  setMyPlayerName: (name: string) => void; // Function to update current user's player name (not directly used in this component, but kept for consistency if needed later)
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  partyCode,
  playerScores,
  // alerts, // Not directly used in this component's current rendering
  currentUserId,
  partyCreatorId,
  partyCreatorName,
  gridSize,
  onRefreshPlayers,
  onLeaveParty,
  // myPlayerName, // Not directly used in this component's current rendering
  // setMyPlayerName, // Not directly used in this component's current rendering
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false); // Keep loading for local actions like refresh/leave

  const handleCopyCode = () => {
    if (partyCode) {
      navigator.clipboard.writeText(partyCode);
      setIsCopied(true);
      showSuccess('Party code copied!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleLeavePartyClick = () => {
    // This will now just call the prop function, GameRoom handles the Supabase logic
    onLeaveParty();
  };

  const handleRefreshRoomClick = async () => {
    if (partyCreatorId === currentUserId) {
      setLoading(true);
      try {
        await onRefreshPlayers(); // Call the prop function to trigger refresh in parent
        showSuccess('Room refreshed!');
      } catch (error: any) {
        showError(`Error refreshing room: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      showError('Only the party creator can refresh the room.');
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          {partyCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
            >
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </CardTitle>
        <CardDescription className="text-sm text-orange-800 dark:text-orange-200 mt-1">
          Share the code with friends to play together
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {partyCode && (
          <div className="space-y-2">
            <Label htmlFor="party-code" className="text-orange-800 dark:text-orange-200">Party Code</Label>
            <Input
              id="party-code"
              type="text"
              value={partyCode}
              readOnly
              className="bg-orange-50 dark:bg-gray-700 border-orange-200 dark:border-orange-600 text-orange-900 dark:text-orange-100 font-mono text-center text-lg"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-orange-800 dark:text-orange-200">Players ({playerScores.length})</Label>
          <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-orange-600 rounded-md p-3 h-32 overflow-y-auto">
            {playerScores.length === 0 ? (
              <p className="text-orange-600 dark:text-orange-300 text-sm italic">No players yet...</p>
            ) : (
              <ul className="space-y-1">
                {playerScores.map((player) => (
                  <li key={player.id} className="flex items-center text-orange-900 dark:text-orange-100">
                    <Users className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                    {player.name} {player.id === partyCreatorId && '(Host)'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-orange-800 dark:text-orange-200">Grid Size</Label>
          <Input
            type="number"
            value={gridSize}
            readOnly
            className="bg-orange-50 dark:bg-gray-700 border-orange-200 dark:border-orange-600 text-orange-900 dark:text-orange-100 text-center"
          />
        </div>

        {partyCreatorId && partyCreatorName && (
          <div className="text-sm text-orange-800 dark:text-orange-200">
            Host: <span className="font-semibold">{partyCreatorName}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {partyCreatorId === currentUserId && (
            <Button
              onClick={handleRefreshRoomClick}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh Room
            </Button>
          )}
          <Button
            onClick={handleLeavePartyClick}
            disabled={loading}
            variant="destructive"
            className="w-full flex items-center justify-center"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {partyCreatorId === currentUserId ? 'Disband Party' : 'Leave Party'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartySidebar;