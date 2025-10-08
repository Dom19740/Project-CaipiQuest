import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, Loader2, LogOut, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface PartySidebarProps {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  setGridSize: (size: number) => void;
  setCreatedBy: (id: string | null) => void;
  setCreatedByName: (name: string | null) => void;
  setBingoAlerts: (alerts: any[]) => void;
  setFullGridBingoAchievedBy: (id: string | null) => void;
  setPlayers: (players: { id: string; name: string }[]) => void;
  players: { id: string; name: string }[];
  createdBy: string | null;
  createdByName: string | null;
  gridSize: number;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  setRoomId,
  setGridSize,
  setCreatedBy,
  setCreatedByName,
  setBingoAlerts,
  setFullGridBingoAchievedBy,
  setPlayers,
  players,
  createdBy,
  createdByName,
  gridSize,
}) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        if (profile && profile.first_name) {
          setPlayerName(profile.first_name);
        } else if (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (roomId) {
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, payload => {
          if (payload.eventType === 'UPDATE') {
            const newRoom = payload.new as any;
            setGridSize(newRoom.grid_size);
            setCreatedBy(newRoom.created_by);
            setCreatedByName(newRoom.created_by_name);
            setBingoAlerts(newRoom.bingo_alerts || []);
            setFullGridBingoAchievedBy(newRoom.full_grid_bingo_achieved_by);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const currentPlayers = Object.values(newState).map((state: any) => ({
            id: state[0].user_id,
            name: state[0].player_name,
          }));
          setPlayers(currentPlayers);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: userId, player_name: playerName });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [roomId, userId, playerName, setGridSize, setCreatedBy, setCreatedByName, setBingoAlerts, setFullGridBingoAchievedBy, setPlayers]);

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      showSuccess('Party code copied!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleLeaveParty = async () => {
    setLoading(true);
    try {
      if (roomId && userId) {
        const { data: room, error: fetchRoomError } = await supabase
          .from('rooms')
          .select('created_by')
          .eq('id', roomId)
          .single();

        if (fetchRoomError) {
          throw fetchRoomError;
        }

        if (room && room.created_by === userId) {
          // If the current user is the creator, delete the room
          const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId);

          if (deleteError) {
            throw deleteError;
          }
          showSuccess('Party disbanded.');
        } else {
          showSuccess('Left the party.');
        }
      }
      setRoomId(null);
      navigate('/lobby');
    } catch (error: any) {
      showError(`Error leaving party: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRoom = async () => {
    setLoading(true);
    try {
      if (roomId && userId && createdBy === userId) {
        const { error } = await supabase
          .from('rooms')
          .update({ last_refreshed_at: new Date().toISOString() })
          .eq('id', roomId);

        if (error) {
          throw error;
        }
        showSuccess('Room refreshed!');
      } else {
        showError('Only the party creator can refresh the room.');
      }
    } catch (error: any) {
      showError(`Error refreshing room: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          {roomId && (
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
        {roomId && (
          <div className="space-y-2">
            <Label htmlFor="party-code" className="text-orange-800 dark:text-orange-200">Party Code</Label>
            <Input
              id="party-code"
              type="text"
              value={roomId}
              readOnly
              className="bg-orange-50 dark:bg-gray-700 border-orange-200 dark:border-orange-600 text-orange-900 dark:text-orange-100 font-mono text-center text-lg"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-orange-800 dark:text-orange-200">Players ({players.length})</Label>
          <div className="bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-orange-600 rounded-md p-3 h-32 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-orange-600 dark:text-orange-300 text-sm italic">No players yet...</p>
            ) : (
              <ul className="space-y-1">
                {players.map((player) => (
                  <li key={player.id} className="flex items-center text-orange-900 dark:text-orange-100">
                    <Users className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
                    {player.name} {player.id === createdBy && '(Host)'}
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

        {createdBy && createdByName && (
          <div className="text-sm text-orange-800 dark:text-orange-200">
            Host: <span className="font-semibold">{createdByName}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          {createdBy === userId && (
            <Button
              onClick={handleRefreshRoom}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh Room
            </Button>
          )}
          <Button
            onClick={handleLeaveParty}
            disabled={loading}
            variant="destructive"
            className="w-full flex items-center justify-center"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            {createdBy === userId ? 'Disband Party' : 'Leave Party'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartySidebar;