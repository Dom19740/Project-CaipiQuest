import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';

interface GameRoomData {
  gridSize: number;
  roomCode: string;
  roomCreatorId: string | null;
  myGameStateId: string | null;
  myGridData: boolean[][];
  myPlayerName: string;
  playerSelectedFruits: string[];
  isLoadingInitialData: boolean;
  initializeOrUpdateGameState: (currentRoomId: string, currentUser: any, currentSelectedFruits: string[], currentGridSize: number) => Promise<void>;
  setMyGridData: React.Dispatch<React.SetStateAction<boolean[][]>>;
  setPlayerSelectedFruits: React.Dispatch<React.SetStateAction<string[]>>;
  setGridSize: React.Dispatch<React.SetStateAction<number>>;
}

export const useGameRoomData = (roomId: string | undefined, initialSelectedFruitsFromState: string[] | undefined, initialGridSizeFromState: number | undefined): GameRoomData => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isLoadingSession } = useSession();

  const [gridSize, setGridSize] = useState<number>(initialGridSizeFromState || 5);
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomCreatorId, setRoomCreatorId] = useState<string | null>(null);
  const [myGameStateId, setMyGameStateId] = useState<string | null>(null);
  const [myGridData, setMyGridData] = useState<boolean[][]>(Array(gridSize).fill(Array(gridSize).fill(false)));
  const [myPlayerName, setMyPlayerName] = useState<string>(localStorage.getItem('playerName') || '');
  const [playerSelectedFruits, setPlayerSelectedFruits] = useState<string[]>([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  const initializeOrUpdateGameState = useCallback(async (currentRoomId: string, currentUser: any, currentSelectedFruits: string[], currentGridSize: number) => {
    if (!currentUser || !currentRoomId || !currentSelectedFruits || currentSelectedFruits.length !== currentGridSize) {
      console.error("Missing data for initializeOrUpdateGameState:", { currentUser, currentRoomId, currentSelectedFruits, currentGridSize });
      return;
    }

    const playerNameFromStorage = localStorage.getItem('playerName') || `Player ${Math.floor(Math.random() * 1000)}`;
    const centerCellIndex = Math.floor(currentGridSize / 2);

    const { data: existingGameState, error: existingGameStateError } = await supabase
      .from('game_states')
      .select('id, player_name, grid_data, selected_fruits')
      .eq('room_id', currentRoomId)
      .eq('player_id', currentUser.id)
      .single();

    if (existingGameStateError && existingGameStateError.code !== 'PGRST116') {
      console.error('useGameRoomData - Error checking existing game state:', existingGameStateError.message);
      showError('Failed to load your game state.');
      return;
    }

    let initialGrid = Array(currentGridSize).fill(null).map(() => Array(currentGridSize).fill(false));
    initialGrid[centerCellIndex][centerCellIndex] = true;

    if (!existingGameState) {
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
        console.error('useGameRoomData - Error creating game state:', createError.message);
        showError('Failed to create your game state.');
        return;
      }
      setMyGameStateId(newGameState.id);
      setMyGridData(newGameState.grid_data);
      setMyPlayerName(newGameState.player_name);
      setPlayerSelectedFruits(newGameState.selected_fruits);
    } else {
      const updatePayload: { player_name: string; selected_fruits: string[]; grid_data?: boolean[][]; updated_at: string } = {
        player_name: playerNameFromStorage,
        selected_fruits: currentSelectedFruits,
        updated_at: new Date().toISOString(),
      };

      const existingGrid = existingGameState.grid_data || Array(currentGridSize).fill(Array(currentGridSize).fill(false));
      const existingFruits = existingGameState.selected_fruits || [];

      if (JSON.stringify(existingFruits) !== JSON.stringify(currentSelectedFruits) || existingGrid.length !== currentGridSize) {
        updatePayload.grid_data = initialGrid;
      } else {
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
        console.error('useGameRoomData - Error updating game state:', updateError.message);
        showError('Failed to update your game state.');
        return;
      }
      setMyGameStateId(updatedGameState.id);
      setMyGridData(updatedGameState.grid_data);
      setMyPlayerName(updatedGameState.player_name);
      setPlayerSelectedFruits(updatedGameState.selected_fruits);
    }
  }, []);

  useEffect(() => {
    if (isLoadingSession || !user || !roomId) {
      if (!isLoadingSession && !user) {
        console.warn("useGameRoomData - No user session or room ID, redirecting to lobby.");
        navigate('/lobby');
      }
      return;
    }

    const fetchInitialData = async () => {
      setIsLoadingInitialData(true);
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('code, created_by, bingo_alerts, grid_size')
        .eq('id', roomId)
        .single();

      if (roomError) {
        showError('Failed to load room. It might not exist or you do not have access.');
        console.error('useGameRoomData - Error fetching room:', roomError);
        navigate('/lobby');
        setIsLoadingInitialData(false);
        return;
      }
      setRoomCode(room.code);
      setRoomCreatorId(room.created_by);
      const currentRoomGridSize = room.grid_size || 5;
      setGridSize(currentRoomGridSize);

      const { data: playerGameState, error: playerGameStateError } = await supabase
        .from('game_states')
        .select('selected_fruits')
        .eq('room_id', roomId)
        .eq('player_id', user.id)
        .single();

      if (playerGameStateError && playerGameStateError.code !== 'PGRST116') {
        console.error('useGameRoomData - Error fetching player game state for fruits:', playerGameStateError);
        showError('Failed to retrieve your fruit selection.');
        navigate('/lobby');
        setIsLoadingInitialData(false);
        return;
      }

      const fruitsToUse = initialSelectedFruitsFromState && initialSelectedFruitsFromState.length === currentRoomGridSize
        ? initialSelectedFruitsFromState
        : (playerGameState?.selected_fruits || []);

      if (!fruitsToUse || fruitsToUse.length !== currentRoomGridSize) {
        showError(`Please select exactly ${currentRoomGridSize} fruits before entering the game room.`);
        navigate('/select-fruits', { state: { roomId, gridSize: currentRoomGridSize } });
        setIsLoadingInitialData(false);
        return;
      }

      await initializeOrUpdateGameState(roomId, user, fruitsToUse, currentRoomGridSize);
      setIsLoadingInitialData(false);
    };

    fetchInitialData();
  }, [user, roomId, navigate, isLoadingSession, initialSelectedFruitsFromState, initialGridSizeFromState, initializeOrUpdateGameState]);

  return {
    gridSize,
    roomCode,
    roomCreatorId,
    myGameStateId,
    myGridData,
    myPlayerName,
    playerSelectedFruits,
    isLoadingInitialData,
    initializeOrUpdateGameState,
    setMyGridData,
    setPlayerSelectedFruits,
    setGridSize,
  };
};