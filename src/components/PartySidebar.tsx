import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Share2, Copy, Trophy } from 'lucide-react'; // Added Trophy icon
import { showSuccess, showError } from '@/utils/toast';
import LeavePartyDialog from './LeavePartyDialog'; // Import LeavePartyDialog
import { Input } from '@/components/ui/input'; // Import Input for player name editing

// Import interfaces from the hook where they are defined
import { BingoAlert, PlayerScore } from '@/hooks/use-game-room-realtime';

interface PartySidebarProps {
  partyCode: string;
  playerScores: PlayerScore[]; // Renamed from 'players' to match prop name
  alerts: BingoAlert[]; // Added alerts prop
  currentUserId: string; // Added currentUserId prop
  onRefreshPlayers: () => void; // Added onRefreshPlayers prop
  onLeaveParty: () => void;
  myPlayerName: string; // Added myPlayerName prop
  setMyPlayerName: React.Dispatch<React.SetStateAction<string>>; // Added setMyPlayerName prop
  // Removed isHost as it's not being passed or used
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
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(partyCode);
      showSuccess('Party code copied to clipboard!');
    } catch (err) {
      showError('Failed to copy party code.');
      console.error('Failed to copy party code:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my CaipiQuest Bingo Party!',
          text: `Join my CaipiQuest Bingo party with code: ${partyCode}`,
          url: window.location.href,
        });
        showSuccess('Party code shared!');
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          showError('Failed to share party code.');
          console.error('Error sharing:', error);
        }
      }
    } else {
      handleCopyCode();
      showSuccess('Party code copied to clipboard (Web Share not supported).');
    }
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-800 dark:text-green-200 bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700';
      case 'diagonal':
        return 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-3xl p-4 animate-pulse';
      default:
        return 'text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
    }
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setMyPlayerName(newName);
    localStorage.setItem('playerName', newName); // Update local storage immediately
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
        </CardTitle>
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-800 rounded-lg border border-orange-200 dark:border-orange-700 shadow-inner">
          <div className="flex items-center justify-center mb-2">
            <Users className="mr-2 h-5 w-5 text-orange-700 dark:text-orange-200" />
            <span className="text-lg font-medium text-orange-800 dark:text-orange-100">Share Code</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-50 tracking-wider">
              {partyCode}
            </span>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={handleCopyCode}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full flex items-center text-sm"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button
              onClick={handleShare}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-full flex items-center text-sm"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-100 mb-2">Your Name</h3>
          <Input
            type="text"
            value={myPlayerName}
            onChange={handlePlayerNameChange}
            className="w-full text-center border-orange-600 focus:border-orange-800 focus:ring-orange-800 text-base py-2 h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-700 dark:placeholder:text-gray-300"
            aria-label="Your Player Name"
          />
        </div>

        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-100 mb-3">Players ({playerScores.length})</h3>
        <ul className="space-y-2 mb-4">
          {playerScores.sort((a, b) => b.caipisCount - a.caipisCount).map((player) => (
            <li key={player.id} className={`flex items-center justify-between p-2 rounded-md shadow-sm ${player.isMe ? 'bg-orange-200 dark:bg-orange-700' : 'bg-orange-100 dark:bg-orange-800'} text-orange-800 dark:text-orange-100`}>
              <span className="flex items-center">
                <Users className="mr-2 h-4 w-4" /> {player.name} {player.isMe ? '(You)' : ''}
              </span>
              <span className="flex items-center text-sm font-bold">
                <Trophy className="mr-1 h-4 w-4 text-yellow-500" /> {player.caipisCount}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-100 mb-3">Bingo Alerts</h3>
        <div className="max-h-[150px] overflow-y-auto p-2 bg-orange-50 dark:bg-orange-800 rounded-lg border border-orange-200 dark:border-orange-700 shadow-inner">
          {alerts.length === 0 ? (
            <p className="text-gray-800 dark:text-gray-300 italic text-sm">No bingo alerts yet...</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm ${getAlertClasses(alert.type)}`}>
                  {alert.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-orange-200 dark:border-orange-600 bg-orange-100/80 dark:bg-orange-700/80 rounded-b-xl">
        <LeavePartyDialog onConfirm={onLeaveParty} />
      </CardFooter>
    </Card>
  );
};

export default PartySidebar;