import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BingoGrid from '@/components/BingoGrid';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
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
import { useSession } from '@/components/SessionContextProvider';
import RoomInfo from '@/components/RoomInfo';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string; // To show who got the bingo
}

const NUM_PLAYABLE_CELLS = 9; // Define this here for consistency

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useSession();

  const [roomCode, setRoomCode] = useState<string>('');
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [myGameStateId, setMyGameStateId] = useState<string | null>(null);
  const [myGridData, setMyGridData] = useState<boolean[][]>(Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
  const [allBingoAlerts, setAllBingoAlerts] = useState<BingoAlert[]>([]); // Global alerts from all players
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.1,
    initialVelocityX: { min: -5, max: 5 },
    initialVelocityY: { min: -10, max: -5 },
  });
  const [resetKey, setResetKey] = useState(0); // Key to force BingoGrid reset

  // Fetch initial room and player data
  useEffect(() => {
    if (!user || !roomId) {
      navigate('/login');
      return;
    }

    const fetchRoomAndGameState = async () => {
      // Fetch room details
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('code')
        .eq('id', roomId)
        .single();

      if (roomError) {
        showError('Failed to load room. It might not exist or you do not have access.');
        console.error('Error fetching room:', roomError);
        navigate('/lobby');
        return;
      }
      setRoomCode(room.code);

      // Fetch current player's game state
      const { data: gameState, error: gameStateError } = await supabase
        .from('game_states')
        .select('*')
        .eq('room_id', roomId)
        .eq('player_id', user.id)
        .single();

      if (gameStateError) {
        showError('Failed to load your game state. Please try rejoining the room.');
        console.error('Error fetching game state:', gameStateError);
        navigate('/lobby');
        return;
      }
      setMyGameStateId(gameState.id);
      setMyGridData(gameState.grid_data || Array(NUM_PLAYABLE_CELLs).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
      setAllBingoAlerts(gameState.bingo_alerts || []);
    };

    fetchRoomAndGameState();
  }, [user, roomId, navigate]);

  // Realtime subscription for player count and global alerts
  useEffect(() => {
    if (!roomId || !user) return;

    // Subscribe to changes in game_states for this room
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Handle player count updates
          const { data: playersInRoom, error: playersError } = await supabase
            .from('game_states')
            .select('player_id');
          if (!playersError) {
            setPlayerCount(playersInRoom.length);
          }

          // Handle bingo alerts from any player in the room
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedGameState = payload.new as { player_id: string; bingo_alerts: BingoAlert[] };
            
            // Fetch player's profile to get their name
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', updatedGameState.player_id)
              .single();

            const playerName = profile && profile.first_name ? profile.first_name : 'A player';

            // Only add new alerts that are not already present
            const newAlerts = (updatedGameState.bingo_alerts || []).filter(
              (newAlert: BingoAlert) => !allBingoAlerts.some(existingAlert => existingAlert.id === newAlert.id)
            ).map((alert: BingoAlert) => ({ ...alert, playerName }));

            if (newAlerts.length > 0) {
              setAllBingoAlerts(prev => [...newAlerts, ...prev]);
              // Trigger confetti for any new bingo
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 2000);
            }

            // If it's *my* game state being updated, update my grid data
            if (updatedGameState.player_id === user.id) {
              setMyGridData((payload.new as { grid_data: boolean[][] }).grid_data || Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
            }
          }
        }
      )
      .subscribe();

    // Initial player count fetch
    supabase.from('game_states').select('player_id').eq('room_id', roomId)
      .then(({ data, error }) => {
        if (!error) setPlayerCount(data.length);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, allBingoAlerts]); // Depend on allBingoAlerts to correctly filter new alerts

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user) return;

    const newGridData = myGridData.map(r => [...r]);
    const newState = !newGridData[row][col];
    newGridData[row][col] = newState;
    if (row !== col) {
      newGridData[col][row] = newState;
    }
    setMyGridData(newGridData); // Optimistic update

    const { error } = await supabase
      .from('game_states')
      .update({ grid_data: newGridData, updated_at: new Date().toISOString() })
      .eq('id', myGameStateId);

    if (error) {
      showError('Failed to update grid state.');
      console.error('Error updating grid:', error);
      // Revert optimistic update if error
      // setMyGridData(prevGridData);
    }
  }, [myGridData, myGameStateId, user]);

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', message: string) => {
    if (!myGameStateId || !user) return;

    const newAlert: BingoAlert = { id: Date.now().toString(), type, message };
    const updatedAlerts = [newAlert, ...allBingoAlerts]; // Add new alert to the beginning

    const { error } = await supabase
      .from('game_states')
      .update({ bingo_alerts: updatedAlerts, updated_at: new Date().toISOString() })
      .eq('id', myGameStateId);

    if (error) {
      showError('Failed to record bingo alert.');
      console.error('Error recording bingo:', error);
    } else {
      showSuccess(message); // Show toast for the current player
    }

    // Confetti is handled by the realtime listener for all players
  }, [myGameStateId, user, allBingoAlerts]);

  const handleResetGame = async () => {
    if (!myGameStateId || !user) return;

    // Reset my grid data and alerts in the database
    const { error } = await supabase
      .from('game_states')
      .update({
        grid_data: Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)),
        bingo_alerts: [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', myGameStateId);

    if (error) {
      showError('Failed to reset your game.');
      console.error('Error resetting game:', error);
    } else {
      showSuccess('Your game has been reset!');
      setResetKey(prev => prev + 1); // Trigger BingoGrid reset
      setMyGridData(Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
      // The global alerts will be updated via realtime listener if other players reset
      // For local display, we might want to clear it immediately or wait for the update
      // For now, let's rely on the realtime update to keep it consistent.
    }
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'diagonal':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  if (!user || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200">
        <p className="text-xl text-gray-700">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-lime-50 to-emerald-100 relative overflow-hidden">
      {showConfetti && <Confetti {...confettiConfig} />}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-8 drop-shadow-lg">
        CaipiQuest Multiplayer!
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <BingoGrid
          onBingo={handleBingo}
          resetKey={resetKey}
          initialGridState={myGridData} // Pass initial state
          onCellToggle={handleCellToggle} // Pass toggle handler
        />
        <div className="flex flex-col gap-4">
          {roomCode && <RoomInfo roomCode={roomCode} playerCount={playerCount} />}
          <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
            <CardHeader className="bg-lime-200 border-b border-lime-400">
              <CardTitle className="text-lime-800 text-2xl">Global Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {allBingoAlerts.length === 0 ? (
                <p className="text-gray-600 italic">No bingo alerts yet...</p>
              ) : (
                <ul className="space-y-2">
                  {allBingoAlerts.map((alert) => (
                    <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm ${getAlertClasses(alert.type)}`}>
                      {alert.playerName ? `${alert.playerName}: ` : ''}{alert.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full lg:w-80 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                Reset My Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will clear *your* current bingo grid and *your* alerts, starting your game fresh in this room. Other players' grids will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetGame}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => navigate('/lobby')} className="w-full lg:w-80 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Leave Room
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default GameRoom;