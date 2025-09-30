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
import RoomSidebar from '@/components/RoomSidebar'; // Import the new component

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
}

interface PlayerScore {
  id: string;
  name: string;
  squaresClicked: number;
  isMe: boolean;
}

const NUM_PLAYABLE_CELLS = 9;

let alertIdCounter = 0;
const generateAlertId = () => {
  alertIdCounter += 1;
  return `alert-${alertIdCounter}-${Date.now()}`;
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useSession();

  const [roomCode, setRoomCode] = useState<string>('');
  const [roomCreatorId, setRoomCreatorId] = useState<string | null>(null);
  const [myGameStateId, setMyGameStateId] = useState<string | null>(null);
  const [myGridData, setMyGridData] = useState<boolean[][]>(Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
  const [roomBingoAlerts, setRoomBingoAlerts] = useState<BingoAlert[]>([]); // Alerts for the entire room
  const [myPlayerName, setMyPlayerName] = useState<string>(localStorage.getItem('playerName') || '');
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.1,
    initialVelocityX: { min: -5, max: 5 },
    initialVelocityY: { min: -10, max: -5 },
  });
  const [resetKey, setResetKey] = useState(0);

  const [showNewPlayerAlert, setShowNewPlayerAlert] = useState(false);
  const [newPlayerJoinedName, setNewPlayerJoinedName] = useState('');

  const countCheckedSquares = (grid: boolean[][]): number => {
    if (!grid || grid.length === 0) return 0;
    return grid.flat().filter(Boolean).length;
  };

  useEffect(() => {
    if (user) {
      console.log("GameRoom - User ID for this session:", user.id);
    }
  }, [user]);

  const fetchAndSetAllGameStates = useCallback(async () => {
    if (!roomId || !user) return;

    console.log("GameRoom - Fetching all game states...");
    const { data: allGameStates, error: allGameStatesError } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', roomId);

    if (allGameStatesError) {
      console.error('Error fetching all game states:', allGameStatesError);
      return;
    }

    const scores: PlayerScore[] = allGameStates.map(gs => ({
      id: gs.player_id,
      name: gs.player_name,
      squaresClicked: countCheckedSquares(gs.grid_data || []),
      isMe: gs.player_id === user.id,
    }));
    setPlayerScores(scores);
    console.log("Fetched and set player scores:", scores);

    const myGameState = allGameStates.find(gs => gs.player_id === user.id);
    if (myGameState) {
      setMyGameStateId(myGameState.id);
      setMyGridData(myGameState.grid_data || Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
      setMyPlayerName(myGameState.player_name);
    }
  }, [roomId, user]);

  useEffect(() => {
    if (isLoading || !user || !roomId) {
      if (!isLoading && !user) {
        console.warn("GameRoom - No user session or room ID, redirecting to lobby.");
        navigate('/lobby');
      }
      return;
    }

    const fetchInitialData = async () => {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('code, created_by, bingo_alerts') // Fetch bingo_alerts from rooms
        .eq('id', roomId)
        .single();

      if (roomError) {
        showError('Failed to load room. It might not exist or you do not have access.');
        console.error('GameRoom - Error fetching room:', roomError);
        navigate('/lobby');
        return;
      }
      setRoomCode(room.code);
      setRoomCreatorId(room.created_by);
      setRoomBingoAlerts(room.bingo_alerts || []); // Set initial room alerts

      await fetchAndSetAllGameStates();
    };

    fetchInitialData();
  }, [user, roomId, navigate, isLoading, fetchAndSetAllGameStates]);

  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`GameRoom - Subscribing to room:${roomId} for user: ${user.id}`);

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
          console.log(`Realtime - game_states event received by user ${user.id} in room ${roomId}:`, payload.eventType, payload.new);

          if (payload.eventType === 'INSERT') {
            const newGameState = payload.new as { id: string; player_id: string; player_name: string; grid_data: boolean[][] };
            if (newGameState.player_id !== user.id) {
              setNewPlayerJoinedName(newGameState.player_name);
              setShowNewPlayerAlert(true);
            }
            await fetchAndSetAllGameStates();

          } else if (payload.eventType === 'DELETE') {
            await fetchAndSetAllGameStates();

          } else if (payload.eventType === 'UPDATE') {
            const updatedGameState = payload.new as { id: string; player_id: string; player_name: string; grid_data: boolean[][] };
            console.log("Realtime - game_states update received:", updatedGameState);

            setPlayerScores(prevScores => {
              const newSquaresClicked = countCheckedSquares(updatedGameState.grid_data || []);
              const updatedScores = prevScores.map(score =>
                score.id === updatedGameState.player_id
                  ? { ...score, squaresClicked: newSquaresClicked, name: updatedGameState.player_name }
                  : score
              );
              console.log("Realtime - Updated player scores (UPDATE):", updatedScores);
              return updatedScores;
            });

            if (updatedGameState.player_id === user.id) {
              setMyGridData(updatedGameState.grid_data || Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          console.log(`Realtime - rooms table UPDATE event received for room ${roomId}:`, payload.new);
          const updatedRoom = payload.new as { last_refreshed_at?: string; bingo_alerts?: BingoAlert[] };

          // Handle global refresh signal
          if (updatedRoom.last_refreshed_at) {
            console.log("Realtime - Room refresh signal received. Triggering full game states fetch.");
            await fetchAndSetAllGameStates();
          }

          // Handle global bingo alerts
          if (updatedRoom.bingo_alerts) {
            setRoomBingoAlerts(prevRoomBingoAlerts => {
              const incomingAlerts = updatedRoom.bingo_alerts || [];
              // Trigger confetti only if there are truly new alerts compared to the previous state
              const newAlertsForConfetti = incomingAlerts.filter(
                (incomingAlert: BingoAlert) => !prevRoomBingoAlerts.some(existingAlert => existingAlert.id === incomingAlert.id)
              );

              if (newAlertsForConfetti.length > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
              }
              // Always update the state to the latest from the database
              return incomingAlerts;
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`GameRoom - Unsubscribing from room:${roomId}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, user, fetchAndSetAllGameStates]);

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user || !roomId) return;

    const newGridData = myGridData.map(r => [...r]);
    const newState = !newGridData[row][col];
    newGridData[row][col] = newState;
    if (row !== col) {
      newGridData[col][row] = newState;
    }
    setMyGridData(newGridData);

    const { error: updateGameStateError } = await supabase
      .from('game_states')
      .update({ grid_data: newGridData, updated_at: new Date().toISOString() })
      .eq('id', myGameStateId);

    if (updateGameStateError) {
      showError('Failed to update grid state.');
      console.error('Error updating grid:', updateGameStateError);
    } else {
      await fetchAndSetAllGameStates();

      if (user.id === roomCreatorId) {
        console.log("GameRoom - Player is room creator, triggering global refresh via rooms table update.");
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ last_refreshed_at: new Date().toISOString() })
          .eq('id', roomId)
          .eq('created_by', user.id);

        if (updateRoomError) {
          console.error('Error triggering global refresh from cell toggle:', updateRoomError);
        }
      } else {
        console.log("GameRoom - Player is not room creator, global refresh not triggered from cell toggle due to RLS.");
      }
    }
  }, [myGridData, myGameStateId, user, roomId, roomCreatorId, fetchAndSetAllGameStates]);

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string) => {
    if (!roomId || !user || !myPlayerName) return;

    const message = `BINGO! ${myPlayerName} ${baseMessage}`;
    const newAlert: BingoAlert = { id: generateAlertId(), type, message, playerName: myPlayerName };

    // Fetch current alerts from the room, add the new one, then update the room
    const { data: currentRoom, error: fetchRoomError } = await supabase
      .from('rooms')
      .select('bingo_alerts')
      .eq('id', roomId)
      .single();

    if (fetchRoomError) {
      showError('Failed to fetch room alerts.');
      console.error('Error fetching room alerts for bingo:', fetchRoomError);
      return;
    }

    const existingAlerts = currentRoom?.bingo_alerts || [];
    const updatedAlerts = [newAlert, ...existingAlerts];

    const { error: updateRoomAlertsError } = await supabase
      .from('rooms')
      .update({ bingo_alerts: updatedAlerts })
      .eq('id', roomId);

    if (updateRoomAlertsError) {
      showError('Failed to record bingo alert globally.');
      console.error('Error recording global bingo:', updateRoomAlertsError);
    } else {
      showSuccess(message);
    }
  }, [roomId, user, myPlayerName]);

  const handleResetGame = async () => {
    if (!myGameStateId || !user) return;

    const { error } = await supabase
      .from('game_states')
      .update({
        grid_data: Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)),
        updated_at: new Date().toISOString(),
      })
      .eq('id', myGameStateId);

    if (error) {
      showError('Failed to reset your game.');
      console.error('Error resetting game:', error);
    } else {
      showSuccess('Your game has been reset!');
      setResetKey(prev => prev + 1);
      setMyGridData(Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
    }
  };

  const handleGlobalRefresh = async () => {
    if (!roomId || !user) return;

    await fetchAndSetAllGameStates();
    showSuccess('Your data has been refreshed!');

    console.log("GameRoom - Triggering global refresh by updating rooms.last_refreshed_at");
    const { error } = await supabase
      .from('rooms')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', roomId)
      .eq('created_by', user.id);

    if (error) {
      showError('Failed to trigger global refresh for others. Only the room creator can do this.');
      console.error('Error triggering global refresh:', error);
    }
  };

  // The getAlertClasses function is no longer needed as the alerts panel is removed.
  // Keeping it commented out in case it's needed for future features.
  // const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
  //   switch (type) {
  //     case 'rowCol':
  //       return 'text-green-700 bg-green-100 border-green-300';
  //     case 'diagonal':
  //       return 'text-blue-700 bg-blue-100 border-blue-300';
  //     case 'fullGrid':
  //       return 'text-white bg-gradient-to-r from-purple-600 to-pink-700 border-purple-800 text-3xl font-extrabold p-4 animate-pulse';
  //     default:
  //       return 'text-gray-700 bg-gray-100 border-gray-300';
  //   }
  // };

  if (isLoading || !user || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-100 to-emerald-200">
        <p className="text-xl text-gray-700">Loading game room...</p>
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
          initialGridState={myGridData}
          onCellToggle={handleCellToggle}
        />
        <div className="flex flex-col gap-4">
          {roomCode && <RoomSidebar roomCode={roomCode} playerScores={playerScores} />} {/* Use the new RoomSidebar */}
          
          {/* The Alerts panel is removed from here */}

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
          <Button onClick={handleGlobalRefresh} className="w-full lg:w-80 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Refresh Data (Global)
          </Button>
          <Button onClick={() => navigate('/lobby')} className="w-full lg:w-80 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Leave Room
          </Button>
        </div>
      </div>

      <AlertDialog open={showNewPlayerAlert} onOpenChange={setShowNewPlayerAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Player Joined!</AlertDialogTitle>
            <AlertDialogDescription>
              {newPlayerJoinedName} has entered the room!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNewPlayerAlert(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MadeWithDyad />
    </div>
  );
};

export default GameRoom;