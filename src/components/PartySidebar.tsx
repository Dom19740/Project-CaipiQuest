import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, RefreshCcw, Crown, XCircle, Edit, Save, User } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
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
import { Input } from '@/components/ui/input';

interface PlayerScore {
  player_id: string;
  player_name: string;
  score: number;
  is_creator: boolean;
  selected_fruits: string[];
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
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempPlayerName(myPlayerName);
  }, [myPlayerName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

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
        .eq('room_id', supabase.channel('any')._channelId) // Use the current room ID from the channel
        .select();

      if (error) throw error;

      setMyPlayerName(tempPlayerName);
      showSuccess('Name updated successfully!');
      setIsEditingName(false);
      onRefreshPlayers(); // Refresh player list to show updated name
    } catch (error: any) {
      console.error('Error updating player name:', error.message);
      showError(`Failed to update name: ${error.message}`);
    }
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-800 dark:text-green-200 bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700';
      case 'diagonal':
        return 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-lg p-2 animate-pulse';
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
          <Badge variant="secondary" className="bg-orange-500 dark:bg-orange-400 text-white dark:text-gray-900 text-base sm:text-lg px-3 py-1 rounded-full">
            {partyCode}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Share this code with friends to play together.</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-grow">
            <User className="mr-2 h-5 w-5 text-gray-700 dark:text-gray-300" />
            {isEditingName ? (
              <Input
                ref={nameInputRef}
                type="text"
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  }
                }}
                className="flex-grow h-8 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-500"
              />
            ) : (
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{myPlayerName}</span>
            )}
          </div>
          {isEditingName ? (
            <Button variant="ghost" size="icon" onClick={handleSaveName} className="ml-2 h-8 w-8 text-green-600 hover:text-green-700">
              <Save className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="ml-2 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Edit className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <Users className="mr-2 h-5 w-5" /> Players
          </h3>
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-40 overflow-y-auto shadow-inner">
            {playerScores.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 italic">No players yet...</p>
            ) : (
              <ul className="space-y-2">
                {playerScores
                  .sort((a, b) => b.score - a.score) // Sort by score descending
                  .map((player) => (
                    <li key={player.player_id} className="flex items-center justify-between text-gray-800 dark:text-gray-200 text-base">
                      <span className="flex items-center">
                        {player.is_creator && <Crown className="h-4 w-4 mr-1 text-yellow-500" />}
                        {player.player_name} {player.player_id === currentUserId && "(You)"}
                      </span>
                      <Badge className="bg-orange-200 dark:bg-orange-600 text-orange-800 dark:text-orange-100 font-bold">
                        {player.score}
                      </Badge>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <XCircle className="mr-2 h-5 w-5" /> Alerts
          </h3>
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 max-h-40 overflow-y-auto shadow-inner">
            {alerts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 italic">No bingo alerts yet...</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm ${getAlertClasses(alert.type)}`}>
                    <span className="font-bold">{alert.player_name}:</span> {alert.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-4 border-t border-orange-200 dark:border-orange-600 bg-orange-100/80 dark:bg-orange-700/80 rounded-b-xl">
        <Button
          onClick={handleCopyCode}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md shadow-md transition-all duration-300 text-base h-10 flex items-center justify-center"
        >
          <Copy className="mr-2 h-5 w-5" /> Copy Party Code
        </Button>
        <Button
          onClick={onRefreshPlayers}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-md transition-all duration-300 text-base h-10 flex items-center justify-center"
        >
          <RefreshCcw className="mr-2 h-5 w-5" /> Refresh Players
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md shadow-md transition-all duration-300 text-base h-10 flex items-center justify-center">
              Leave Party
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-800 text-card-foreground p-6 rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl sm:text-2xl">Are you sure you want to leave?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-900 dark:text-gray-300 text-base sm:text-lg">
                You will exit this party. You can rejoin later if you have the code.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-12 text-base sm:text-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveParty} className="h-12 text-base sm:text-lg">Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default PartySidebar;