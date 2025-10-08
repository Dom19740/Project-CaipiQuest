import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, RefreshCcw, Crown, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

interface PlayerScore {
  player_id: string;
  player_name: string;
  score: number;
  is_creator: boolean;
  full_grid_bingo_achieved: boolean;
}

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  player_name: string;
  player_id: string;
}

interface PartySidebarProps {
  partyCode: string;
  playerScores: PlayerScore[];
  alerts: BingoAlert[];
  currentUserId: string;
  onRefreshPlayers: () => void;
  onLeaveParty: () => void;
  myPlayerName: string;
  setMyPlayerName: (name: string) => void;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  partyCode,
  playerScores,
  alerts,
  currentUserId,
  onRefreshPlayers,
  onLeaveParty,
  myPlayerName,
  setMyPlayerName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState(myPlayerName);

  useEffect(() => {
    setTempPlayerName(myPlayerName);
  }, [myPlayerName]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(partyCode);
    showSuccess('Party code copied!');
  };

  const handleSaveName = async () => {
    if (!tempPlayerName.trim()) {
      showError("Player name cannot be empty.");
      return;
    }
    if (tempPlayerName === myPlayerName) {
      setIsEditingName(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('game_states')
        .update({ player_name: tempPlayerName })
        .eq('player_id', currentUserId)
        .eq('room_id', localStorage.getItem('lastActiveRoomId')) // Ensure we update for the current room
        .select();

      if (error) throw error;

      setMyPlayerName(tempPlayerName);
      showSuccess("Player name updated!");
      setIsEditingName(false);
      onRefreshPlayers(); // Refresh to show updated name in player list
    } catch (error: any) {
      console.error("Error updating player name:", error.message);
      showError(`Failed to update name: ${error.message}`);
    }
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid', playerId: string) => {
    const isMyAlert = playerId === currentUserId;
    switch (type) {
      case 'rowCol':
        return `text-green-800 dark:text-green-200 ${isMyAlert ? 'bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700' : 'bg-green-200 dark:bg-green-900 border-green-400 dark:border-green-800'}`;
      case 'diagonal':
        return `text-blue-800 dark:text-blue-200 ${isMyAlert ? 'bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700' : 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-800'}`;
      case 'fullGrid':
        return `text-white ${isMyAlert ? 'bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900' : 'bg-gradient-to-r from-purple-700 to-pink-800 border-purple-800'} text-lg p-3 animate-pulse`;
      default:
        return 'text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          <span className="text-orange-700 dark:text-orange-300 text-lg sm:text-xl font-bold flex items-center">
            {partyCode}
            <Button variant="ghost" size="icon" onClick={handleCopyCode} className="ml-2 h-8 w-8 text-orange-600 dark:text-orange-400 hover:bg-orange-200/50 dark:hover:bg-orange-600/50">
              <Copy className="h-4 w-4" />
            </Button>
          </span>
        </CardTitle>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Share this code with friends to play together</p>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* My Player Name Section */}
        <div className="flex items-center justify-between bg-orange-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-orange-200 dark:border-gray-600">
          {isEditingName ? (
            <Input
              type="text"
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
              className="flex-grow mr-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-orange-400 dark:border-orange-600"
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveName();
                }
              }}
              autoFocus
            />
          ) : (
            <span className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              {myPlayerName} (You)
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
            className="text-orange-600 dark:text-orange-400 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
          >
            {isEditingName ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          </Button>
        </div>

        {/* Player List */}
        <div>
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
            Players ({playerScores.length})
            <Button variant="ghost" size="icon" onClick={onRefreshPlayers} className="ml-2 h-8 w-8 text-orange-600 dark:text-orange-400 hover:bg-orange-200/50 dark:hover:bg-orange-600/50">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {playerScores.length === 0 ? (
              <li className="text-gray-600 dark:text-gray-400 italic">No players yet. Share the code!</li>
            ) : (
              playerScores.map((player) => (
                <li key={player.player_id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <span className={`font-medium ${player.player_id === currentUserId ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {player.player_name} {player.player_id === currentUserId && "(You)"}
                  </span>
                  <div className="flex items-center">
                    {player.is_creator && <Crown className="h-4 w-4 text-yellow-500 mr-2" title="Party Creator" />}
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Score: {player.score}</span>
                    {player.full_grid_bingo_achieved && <AlertCircle className="h-4 w-4 text-red-500 ml-2" title="Full Grid Bingo Achieved!" />}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Alerts Section */}
        <div>
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3">Bingo Alerts</h3>
          <div className="bg-yellow-100/70 dark:bg-yellow-900/70 border border-yellow-400 dark:border-yellow-800 rounded-lg shadow-inner p-3 max-h-40 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 italic text-sm">No bingo alerts yet...</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm ${getAlertClasses(alert.type, alert.player_id)}`}>
                    {alert.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Leave Party Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full bg-red-700 hover:bg-red-800 text-white py-3 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-base sm:text-lg h-12">
              Leave Party
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 text-card-foreground p-6 rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl sm:text-2xl">Are you sure you want to leave?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-900 dark:text-gray-300 text-base sm:text-lg">
                You will leave this party. You can rejoin later if you have the code.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-12 text-base sm:text-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveParty} className="h-12 text-base sm:text-lg">Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default PartySidebar;