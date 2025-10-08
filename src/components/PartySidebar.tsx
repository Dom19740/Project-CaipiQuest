import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, Loader2, XCircle, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/components/AuthProvider';

interface PartySidebarProps {
  roomId: string | null;
  onRoomCreated: (roomCode: string) => void;
  onRoomJoined: (roomCode: string) => void;
  onRoomLeft: () => void;
  onRoomRefreshed: () => void;
  isHost: boolean;
  roomCode: string | null;
  players: { id: string; name: string }[];
  roomCreatorName: string | null;
  lastRefreshedAt: string | null;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  onRoomCreated,
  onRoomJoined,
  onRoomLeft,
  onRoomRefreshed,
  isHost,
  roomCode,
  players,
  roomCreatorName,
  lastRefreshedAt,
}) => {
  const [newRoomCode, setNewRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user) {
      showError("You must be logged in to create a party.");
      navigate('/login');
      return;
    }
    setLoading(true);
    const code = newRoomCode || generateRandomCode();
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code: code, created_by: user.id, created_by_name: user.email || 'Anonymous' })
        .select()
        .single();

      if (error) throw error;

      onRoomCreated(data.code);
      showSuccess(`Party "${data.code}" created!`);
      setNewRoomCode('');
    } catch (error: any) {
      showError(`Error creating party: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user) {
      showError("You must be logged in to join a party.");
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', joinRoomCode.toUpperCase())
        .single();

      if (error) throw error;

      onRoomJoined(data.code);
      showSuccess(`Joined party "${data.code}"!`);
      setJoinRoomCode('');
    } catch (error: any) {
      showError(`Error joining party: ${error.message || 'Party not found.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      // Optionally remove player from game_states or handle cleanup
      onRoomLeft();
      showSuccess("Left the party.");
    } catch (error: any) {
      showError(`Error leaving party: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomCode]);

  const handleRefreshRoom = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ last_refreshed_at: new Date().toISOString() })
        .eq('id', roomId);

      if (error) throw error;
      onRoomRefreshed();
      showSuccess("Party refreshed!");
    } catch (error: any) {
      showError(`Error refreshing party: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-4 border-orange-600 dark:border-orange-700 text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Share Code
          </span>
          <div className="flex items-center space-x-2">
            {roomId && isHost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshRoom}
                disabled={loading}
                className="text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCcw className="h-5 w-5" />}
              </Button>
            )}
            {roomId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeaveRoom}
                disabled={loading}
                className="text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </CardTitle>
        {roomCreatorName && (
          <CardDescription className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Created by: {roomCreatorName}
          </CardDescription>
        )}
        {lastRefreshedAt && (
          <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
            Last refreshed: {new Date(lastRefreshedAt).toLocaleTimeString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {!roomId ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-room-code" className="text-gray-800 dark:text-gray-200">Create New Party</Label>
              <div className="flex space-x-2">
                <Input
                  id="new-room-code"
                  placeholder="Optional code"
                  value={newRoomCode}
                  onChange={(e) => setNewRoomCode(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-orange-300 dark:border-orange-600"
                />
                <Button onClick={handleCreateRoom} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="join-room-code" className="text-gray-800 dark:text-gray-200">Join Existing Party</Label>
              <div className="flex space-x-2">
                <Input
                  id="join-room-code"
                  placeholder="Enter party code"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value)}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-orange-300 dark:border-orange-600"
                />
                <Button onClick={handleJoinRoom} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="party-code" className="text-gray-800 dark:text-gray-200">Party Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="party-code"
                  value={roomCode || ''}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-orange-300 dark:border-orange-600"
                />
                <Button onClick={handleCopyCode} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-800 dark:text-gray-200">Players ({players.length})</Label>
              <ul className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                {players.map((player) => (
                  <li key={player.id} className="py-1 text-gray-800 dark:text-gray-200 text-sm">
                    {player.name} {player.id === user?.id && '(You)'} {player.id === roomId && '(Host)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;