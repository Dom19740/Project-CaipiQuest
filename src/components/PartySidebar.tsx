import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Share2, LogOut, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface PartySidebarProps {
  roomId: string;
  roomCode: string;
  createdBy: string | null;
  createdByName: string | null;
  onLeaveParty: () => void;
  onRefreshPlayers: () => void;
  players: { id: string; name: string }[];
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  roomCode,
  createdBy,
  createdByName,
  onLeaveParty,
  onRefreshPlayers,
  players,
}) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setCurrentUserName(user?.user_metadata?.full_name || user?.email || null);
    };
    fetchUser();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    showSuccess('Party code copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Fruit Bingo Party!',
          text: `Join my Fruit Bingo party with code: ${roomCode}`,
          url: window.location.href,
        });
        showSuccess('Party code shared!');
      } catch (error) {
        console.error('Error sharing:', error);
        showError('Failed to share party code.');
      }
    } else {
      handleCopyCode();
      showError('Web Share API not supported. Code copied to clipboard instead.');
    }
  };

  const isCreator = currentUserId === createdBy;

  return (
    <Card className="w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-orange-400 dark:border-orange-700 text-card-foreground">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Share Code
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onRefreshPlayers} className="text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100">
              <RefreshCcw className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLeaveParty} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
          {isCreator ? "You are the party host." : `Hosted by: ${createdByName || 'Unknown'}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div>
          <Label htmlFor="party-code" className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 block">
            Party Code
          </Label>
          <div className="flex space-x-2">
            <Input
              id="party-code"
              type="text"
              value={roomCode}
              readOnly
              className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={handleCopyCode} variant="secondary" className="bg-orange-200 hover:bg-orange-300 dark:bg-orange-800 dark:hover:bg-orange-700 text-orange-800 dark:text-orange-200">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
        </div>
        <Button onClick={handleShare} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Users className="mr-2 h-5 w-5" /> Players ({players.length})
          </h3>
          <ul className="space-y-1 max-h-40 overflow-y-auto pr-2">
            {players.map((player) => (
              <li key={player.id} className="flex items-center text-gray-800 dark:text-gray-200">
                <span className={`h-2 w-2 rounded-full mr-2 ${player.id === currentUserId ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {player.name} {player.id === currentUserId && '(You)'}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p>Party ID: {roomId}</p>
      </CardFooter>
    </Card>
  );
};

export default PartySidebar;