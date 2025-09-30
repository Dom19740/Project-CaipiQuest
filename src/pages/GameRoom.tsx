import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import RoomSidebar from '@/components/RoomSidebar';

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

let alertIdCounter = 0;
const generateAlertId = () => {
  alertIdCounter += 1;
  return `alert-${alertIdCounter}-${Date.now()}`;
};

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFruits, gridSize: initialGridSize } = (location.state || {}) as { selectedFruits?: string[]; gridSize?: number };
  const { user, isLoading } = useSession();

  const [gridSize, setGridSize] = useState<number>(initialGridSize || 5); // Default to 5
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomCreatorId, setRoomCreatorId] = useState<string | null>(null);
  const [myGameStateId, setMyGameStateId] = useState<string | null>(null);
  const [myGridData, setMyGridData] = useState<boolean[][]>(Array(gridSize).fill(Array(gridSize).fill(false)));
  const [roomBingoAlerts, setRoomBingoAlerts] = useState<BingoAlert[]>([]);
  const [myPlayerName, setMyPlayerName] = useState<string>(localStorage.getItem('playerName') || '');
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [playerSelectedFruits, setPlayerSelectedFruits] = useState<string[]>([]);

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

  // Function to initialize or update player's game state
  const initializeOrUpdateGameState = useCallback(async (currentRoomId: string, currentUser: any, currentSelectedFruits: string[], currentGridSize: number) => {
    if (!currentUser || !currentRoomId || !currentSelectedFruits || currentSelectedFruits.length !== currentGridSize) {
      console.error("Missing data for initializeOrUpdateGameState:", { currentUser, currentRoomId, currentSelectedFruits, currentGridSize });
      return;
    }

    const playerNameFromStorage = localStorage.getItem('playerName') || `Player ${Math.floor(Math.random() * 1000)}`;
    const centerCellIndex = Math.floor(currentGridSize / 2);

    // Check if player already has a game state in this room
    const { data: existingGameState, error: existingGameStateError } = await supabase
      .from('game_states')
      .select('id, player_name, grid_data, selected_fruits')
      .eq('room_id', currentRoomId)
      .eq('player_id', currentUser.id)
      .single();

    if (existingGameStateError && existingGameStateError.code !== 'PGRST116') {
      console.error('GameRoom - Error checking existing game state:', existingGameStateError.message);
      showError('Failed to load your game state.');
      return;
    }

    let initialGrid = Array(currentGridSize).fill(null).map(() => Array(currentGridSize).fill(false));
    initialGrid[centerCellIndex][centerCellIndex] = true; // Center cell (Lime) is always pre-checked

    if (!existingGameState) {
      // Create new game state
      const { data: newGameState, error: createError } = await supabase
        .from('game_states')
        .insert({
          room_id: currentRoomId,
          player_id: currentUser.id,
          player_name: playerNameFromStorage,
          grid_data: initialGrid,
          selected_fruits: currentSelectedFruits,
        })
        .select()
        .single();

      if (createError) {
        console.error('GameRoom - Error creating game state:', createError.message);
        showError('Failed to create your game state.');
        return;
      }
      setMyGameStateId(newGameState.id);
      setMyGridData(newGameState.grid_data);
      setMyPlayerName(newGameState.player_name);
      setPlayerSelectedFruits(newGameState.selected_fruits);
      showSuccess('Your game state has been initialized!');
    } else {
      // Update existing game state (e.g., if player name changed or fruits changed)
      const updatePayload: { player_name: string; selected_fruits: string[]; grid_data?: boolean[][]; updated_at: string } = {
        player_name: playerNameFromStorage,
        selected_fruits: currentSelectedFruits,
        updated_at: new Date().toISOString(),
      };

      // Only reset grid_data if selected_fruits or gridSize have changed
      const existingGrid = existingGameState.grid_data || Array(currentGridSize).fill(Array(currentGridSize).fill(false));
      const existingFruits = existingGameState.selected_fruits || [];

      if (JSON.stringify(existingFruits) !== JSON.stringify(currentSelectedFruits) || existingGrid.length !== currentGridSize) {
        updatePayload.grid_data = initialGrid;
        showSuccess('Your fruits or grid size have been updated and grid reset!');
      } else {
        // If fruits and grid size haven't changed, use existing grid data, ensuring center is checked
        existingGrid[centerCellIndex][centerCellIndex] = true;
        updatePayload.grid_data = existingGrid;
      }

      const { data: updatedGameState, error: updateError } = await supabase
        .from('game_states')
        .update(updatePayload)
        .eq('id', existingGameState.id)
        .select()
        .single();

      if (updateError) {
        console.error('GameRoom - Error updating game state:', updateError.message);
        showError('Failed to update your game state.');
        return;
      }
      setMyGameStateId(updatedGameState.id);
      setMyGridData(updatedGameState.grid_data);
      setMyPlayerName(updatedGameState.player_name);
      setPlayerSelectedFruits(updatedGameState.selected_fruits);
      showSuccess('Your game state has been updated!');
    }
  }, [user]);

  const fetchAndSetAllGameStates = useCallback(async (currentGridSize: number) => {
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
      const centerCellIndex = Math.floor(currentGridSize / 2);

      // Ensure grid_data is initialized to currentGridSize x currentGridSize if it's null or different size
      const fetchedGrid = myGameState.grid_data || Array(currentGridSize).fill(Array(currentGridSize).fill(false));
      if (fetchedGrid.length !== currentGridSize || (fetchedGrid.length > 0 && fetchedGrid[0].length !== currentGridSize)) {
        // If grid size is wrong, re-initialize with center checked
        const newGrid = Array(currentGridSize).fill(Array(currentGridSize).fill(false));
        newGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(newGrid);
      } else {
        // Ensure center is checked even if loaded from DB
        fetchedGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(fetchedGrid);
      }
      setMyPlayerName(myGameState.player_name);
      setPlayerSelectedFruits(myGameState.selected_fruits || []);
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
        .select('code, created_by, bingo_alerts, grid_size') // Fetch grid_size
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
      setRoomBingoAlerts(room.bingo_alerts || []);
      const currentRoomGridSize = room.grid_size || 5; // Use room's grid_size
      setGridSize(currentRoomGridSize);

      // Fetch player's existing game state to get their selected fruits
      const { data: playerGameState, error: playerGameStateError } = await supabase
        .from('game_states')
        .select('selected_fruits')
        .eq('room_id', roomId)
        .eq('player_id', user.id)
        .single();

      if (playerGameStateError && playerGameStateError.code !== 'PGRST116') {
        console.error('Error fetching player game state for fruits:', playerGameStateError);
        showError('Failed to retrieve your fruit selection.');
        navigate('/lobby');
        return;
      }

      const fruitsToUse = selectedFruits && selectedFruits.length === currentRoomGridSize
        ? selectedFruits
        : (playerGameState?.selected_fruits || []);

      if (!fruitsToUse || fruitsToUse.length !== currentRoomGridSize) {
        showError(`Please select exactly ${currentRoomGridSize} fruits before entering the game room.`);
        navigate('/select-fruits', { state: { roomId, gridSize: currentRoomGridSize } });
        return;
      }

      await initializeOrUpdateGameState(roomId, user, fruitsToUse, currentRoomGridSize);
      await fetchAndSetAllGameStates(currentRoomGridSize);
    };

    fetchInitialData();
  }, [user, roomId, navigate, isLoading, selectedFruits, initialGridSize, initializeOrUpdateGameState, fetchAndSetAllGameStates]);

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
            await fetchAndSetAllGameStates(gridSize);

          } else if (payload.eventType === 'DELETE') {
            await fetchAndSetAllGameStates(gridSize);

          } else if (payload.eventType === 'UPDATE') {
            const updatedGameState = payload.new as { id: string; player_id: string; player_name: string; grid_data: boolean[][]; selected_fruits: string[] };
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
              const centerCellIndex = Math.floor(gridSize / 2);
              // Ensure center is checked even if loaded from DB
              const updatedGrid = updatedGameState.grid_data || Array(gridSize).fill(Array(gridSize).fill(false));
              updatedGrid[centerCellIndex][centerCellIndex] = true;
              setMyGridData(updatedGrid);
              setPlayerSelectedFruits(updatedGameState.selected_fruits || []);
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
          const updatedRoom = payload.new as { last_refreshed_at?: string; bingo_alerts?: BingoAlert[]; grid_size?: number };

          // Handle global refresh signal
          if (updatedRoom.last_refreshed_at) {
            console.log("Realtime - Room refresh signal received. Triggering full game states fetch.");
            await fetchAndSetAllGameStates(gridSize);
          }

          // Handle global bingo alerts
          if (updatedRoom.bingo_alerts) {
            setRoomBingoAlerts(prevRoomBingoAlerts => {
              const incomingAlerts = updatedRoom.bingo_alerts || [];
              const newAlertsForConfetti = incomingAlerts.filter(
                (incomingAlert: BingoAlert) => !prevRoomBingoAlerts.some(existingAlert => existingAlert.id === incomingAlert.id)
              );

              if (newAlertsForConfetti.length > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
              }
              return incomingAlerts;
            });
          }
          // Handle grid size update (though typically set at room creation)
          if (updatedRoom.grid_size && updatedRoom.grid_size !== gridSize) {
            setGridSize(updatedRoom.grid_size);
            // Potentially trigger a grid reset or re-initialization if grid size changes mid-game
            showError(`Room grid size changed to ${updatedRoom.grid_size}x${updatedRoom.grid_size}. Your grid might reset.`);
            await initializeOrUpdateGameState(roomId, user, playerSelectedFruits, updatedRoom.grid_size);
            setResetKey(prev => prev + 1); // Force BingoGrid reset
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`GameRoom - Unsubscribing from room:${roomId}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, user, gridSize, playerSelectedFruits, fetchAndSetAllGameStates, initializeOrUpdateGameState]);

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user || !roomId) return;
    const centerCellIndex = Math.floor(gridSize / 2);
    if (row === centerCellIndex && col === centerCellIndex) return; // Prevent toggling the center cell (Lime)

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
      await fetchAndSetAllGameStates(gridSize);

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
  }, [myGridData, myGameStateId, user, roomId, roomCreatorId, gridSize, fetchAndSetAllGameStates]);

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string) => {
    if (!roomId || !user || !myPlayerName) return;

    const message = `BINGO! ${myPlayerName} ${baseMessage}`;
    const newAlert: BingoAlert = { id: generateAlertId(), type, message, playerName: myPlayerName };

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
    if (!myGameStateId || !user || !playerSelectedFruits) return;

    const centerCellIndex = Math.floor(gridSize / 2);
    let initialGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    initialGrid[centerCellIndex][centerCellIndex] = true; // Center cell (Lime) is always pre-checked

    const { error } = await supabase
      .from('game_states')
      .update({
        grid_data: initialGrid,
        updated_at: new Date().toISOString(),
        selected_fruits: playerSelectedFruits,
      })
      .eq('id', myGameStateId);

    if (error) {
      showError('Failed to reset your game.');
      console.error('Error resetting game:', error);
    } else {
      showSuccess('Your game has been reset!');
      setResetKey(prev => prev + 1);
      setMyGridData(initialGrid);
    }
  };

  const handleGlobalRefresh = async () => {
    if (!roomId || !user) return;

    await fetchAndSetAllGameStates(gridSize);
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

  if (isLoading || !user || !roomId || playerSelectedFruits.length !== gridSize) {
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
        CaipiQuest Bingo!
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <BingoGrid
          onBingo={handleBingo}
          resetKey={resetKey}
          initialGridState={myGridData}
          onCellToggle={handleCellToggle}
          selectedFruits={playerSelectedFruits}
          gridSize={gridSize} // Pass gridSize
        />
        <div className="flex flex-col gap-4">
          {roomCode && <RoomSidebar roomCode={roomCode} playerScores={playerScores} />}
          
          <Card className="w-full lg:w-80 bg-white/90 backdrop-blur-sm shadow-xl border-lime-400 border-2">
            <CardHeader className="bg-lime-200 border-b border-lime-400">
              <CardTitle className="text-lime-800 text-2xl">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {roomBingoAlerts.length === 0 ? (
                <p className="text-gray-600 italic">No bingo alerts yet...</p>
              ) : (
                <ul className="space-y-2">
                  {roomBingoAlerts.map((alert) => (
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