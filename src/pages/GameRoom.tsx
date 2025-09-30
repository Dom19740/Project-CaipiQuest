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
import PlayerScoreList from '@/components/PlayerScoreList'; // Import the new component

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string; // To show who got the bingo
}

interface PlayerScore {
  id: string;
  name: string;
  squaresClicked: number;
  isMe: boolean;
}

const NUM_PLAYABLE_CELLS = 9; // Define this here for consistency

// Simple counter for generating unique alert IDs
let alertIdCounter = 0;
const generateAlertId = () => {
  alertIdCounter += 1;
  return `alert-${alertIdCounter}-${Date.now()}`; // Combine counter with timestamp for uniqueness
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useSession();

  const [roomCode, setRoomCode] = useState<string>('');
  // Removed playerNamesInRoom state, will derive from playerScores
  const [myGameStateId, setMyGameStateId] = useState<string | null>(null);
  const [myGridData, setMyGridData] = useState<boolean[][]>(Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
  const [allBingoAlerts, setAllBingoAlerts] = useState<BingoAlert[]>([]); // Global alerts from all players
  const [myPlayerName, setMyPlayerName] = useState<string>(localStorage.getItem('playerName') || ''); // Get player name from local storage
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]); // New state for player scores

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.1,
    initialVelocityX: { min: -5, max: 5 },
    initialVelocityY: { min: -10, max: -5 },
  });
  const [resetKey, setResetKey] = useState(0); // Key to force BingoGrid reset

  // Helper to count checked squares
  const countCheckedSquares = (grid: boolean[][]): number => {
    if (!grid || grid.length === 0) return 0;
    return grid.flat().filter(Boolean).length;
  };

  useEffect(() => {
    if (user) {
      console.log("GameRoom - User ID for this session:", user.id);
    }
  }, [user]);

  // Fetch initial room and player data
  useEffect(() => {
    if (isLoading || !user || !roomId) {
      if (!isLoading && !user) {
        navigate('/lobby');
      }
      return;
    }

    const fetchRoomAndGameStates = async () => {
      // Fetch room details (only code, player_names is removed)
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

      // Fetch all game states for this room to get players and their scores
      const { data: allGameStates, error: allGameStatesError } = await supabase
        .from('game_states')
        .select('*')
        .eq('room_id', roomId);

      if (allGameStatesError) {
        showError('Failed to load game states for the room.');
        console.error('Error fetching all game states:', allGameStatesError);
        navigate('/lobby');
        return;
      }

      const scores: PlayerScore[] = allGameStates.map(gs => ({
        id: gs.player_id,
        name: gs.player_name,
        squaresClicked: countCheckedSquares(gs.grid_data || []),
        isMe: gs.player_id === user.id,
      }));
      setPlayerScores(scores);
      console.log("Initial player scores:", scores);


      // Find current player's game state
      const myGameState = allGameStates.find(gs => gs.player_id === user.id);

      if (!myGameState) {
        showError('Your game state not found. Please try rejoining the room.');
        console.error('My game state not found for user:', user.id, 'in room:', roomId);
        navigate('/lobby');
        return;
      }
      setMyGameStateId(myGameState.id);
      setMyGridData(myGameState.grid_data || Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
      setAllBingoAlerts(myGameState.bingo_alerts || []);
    };

    fetchRoomAndGameStates();
  }, [user, roomId, navigate, isLoading]);

  // Realtime subscription for game states (to update player scores and global alerts)
  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`GameRoom - Subscribing to room:${roomId} for user: ${user.id}`);

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Re-fetch all game states to get the most current list of players and their data
          const { data: allGameStates, error: allGameStatesError } = await supabase
            .from('game_states')
            .select('*')
            .eq('room_id', roomId);

          if (allGameStatesError) {
            console.error('Realtime - Error fetching all game states on update:', allGameStatesError);
            return;
          }

          const scores: PlayerScore[] = allGameStates.map(gs => ({
            id: gs.player_id,
            name: gs.player_name,
            squaresClicked: countCheckedSquares(gs.grid_data || []),
            isMe: gs.player_id === user.id,
          }));
          setPlayerScores(scores);
          console.log("Realtime - Updated player scores:", scores);

          // Process alerts and my grid data only if it's an UPDATE or INSERT
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedGameState = payload.new as { id: string; player_id: string; player_name: string; bingo_alerts: BingoAlert[]; grid_data: boolean[][] };
            console.log("Realtime - game_states update received:", updatedGameState);
            
            // Handle bingo alerts from any player in the room
            setAllBingoAlerts(prevAllBingoAlerts => {
              const newAlerts = (updatedGameState.bingo_alerts || []).filter(
                (newAlert: BingoAlert) => !prevAllBingoAlerts.some(existingAlert => existingAlert.id === newAlert.id)
              ).map((alert: BingoAlert) => ({ ...alert, playerName: updatedGameState.player_name }));

              if (newAlerts.length > 0) {
                // Trigger confetti for any new bingo
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
                const combinedAlerts = [...newAlerts, ...prevAllBingoAlerts];
                console.log("Realtime - New bingo alerts:", combinedAlerts);
                return combinedAlerts;
              }
              return prevAllBingoAlerts;
            });

            // If it's *my* game state being updated, update my grid data
            if (updatedGameState.player_id === user.id) {
              setMyGridData(updatedGameState.grid_data || Array(NUM_PLAYABLE_CELLS).fill(Array(NUM_PLAYABLE_CELLS).fill(false)));
            }
          }
        }
      )
      // Removed subscription for 'rooms' table updates as player_names is no longer there
      .subscribe();

    return () => {
      console.log(`GameRoom - Unsubscribing from room:${roomId} for user: ${user.id}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

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

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string) => {
    if (!myGameStateId || !user || !myPlayerName) return; // Ensure myPlayerName is available

    const message = `BINGO! ${myPlayerName} ${baseMessage}`;
    const newAlert: BingoAlert = { id: generateAlertId(), type, message, playerName: myPlayerName };
    
    setAllBingoAlerts(prevAllBingoAlerts => {
      const updatedAlerts = [newAlert, ...prevAllBingoAlerts];
      
      supabase
        .from('game_states')
        .update({ bingo_alerts: updatedAlerts, updated_at: new Date().toISOString() })
        .eq('id', myGameStateId)
        .then(({ error }) => {
          if (error) {
            showError('Failed to record bingo alert.');
            console.error('Error recording bingo:', error);
          } else {
            showSuccess(message); // Show toast for the current player
          }
        });
      return updatedAlerts;
    });

    // Confetti is handled by the realtime listener for all players
  }, [myGameStateId, user, myPlayerName]);

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
          {roomCode && <RoomInfo roomCode={roomCode} playerCount={playerScores.length} />}
          <PlayerScoreList playerScores={playerScores} /> {/* New PlayerScoreList component */}
          <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
            <CardHeader className="bg-lime-200 border-b border-lime-400">
              <CardTitle className="text-lime-800 text-2xl">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {allBingoAlerts.length === 0 ? (
                <p className="text-gray-600 italic">No bingo alerts yet...</p>
              ) : (
                <ul className="space-y-2">
                  {allBingoAlerts.map((alert) => (
                    <li key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm ${getAlertClasses(alert.type)}`}>
                      {alert.message}
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