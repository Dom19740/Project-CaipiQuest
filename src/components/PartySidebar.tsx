import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Share2, Copy } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface PartySidebarProps {
  partyCode: string;
  players: { id: string; name: string }[];
  onLeaveParty: () => void;
  isHost: boolean;
}

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, players, onLeaveParty, isHost }) => {
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
          title: 'Join my Fruit Bingo Party!',
          text: `Join my Fruit Bingo party with code: ${partyCode}`,
          url: window.location.href, // Or a specific join URL if available
        });
        showSuccess('Party code shared!');
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          showError('Failed to share party code.');
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyCode();
      showSuccess('Party code copied to clipboard (Web Share not supported).');
    }
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
        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-100 mb-3">Players ({players.length})</h3>
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.id} className="flex items-center text-orange-700 dark:text-orange-200">
              <Users className="mr-2 h-4 w-4" /> {player.name} {player.id === localStorage.getItem('player_id') ? '(You)' : ''}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-4 border-t border-orange-200 dark:border-orange-600 bg-orange-100/80 dark:bg-orange-700/80 rounded-b-xl">
        <Button
          onClick={onLeaveParty}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-full"
        >
          Leave Party
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PartySidebar;