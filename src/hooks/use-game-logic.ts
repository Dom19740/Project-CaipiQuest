import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';

export const useGameLogic = (
  roomId: string | undefined,
  myGameStateId: string | null,
  myGridData: boolean[][],
  setMyGridData: React.Dispatch<React.SetStateAction<boolean[][]>>,
  myPlayerName: string,
  roomCreatorId: string | null,
  playerSelectedFruits: string[],
  gridSize: number,
  fetchAndSetAllGameStates: (currentGridSize: number) => Promise<void>,
  setResetKey: React.Dispatch<React.SetStateAction<number>>
) => {
  const { user } = useSession();

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user || !roomId) return;
    const centerCellIndex = Math.floor(gridSize / 2);
    if (row === centerCellIndex && col === centerCellIndex) return;

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
      console.error('useGameLogic - Error updating grid:', updateGameStateError);
    } else {
      await fetchAndSetAllGameStates(gridSize);

      if (user.id === roomCreatorId) {
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ last_refreshed_at: new Date().toISOString() })
          .eq('id', roomId)
          .eq('created_by', user.id);

        if (updateRoomError) {
          console.error('useGameLogic - Error triggering global refresh from cell toggle:', updateRoomError);
        }
      }
    }
  }, [myGridData, myGameStateId, user, roomId, roomCreatorId, gridSize, fetchAndSetAllGameStates, setMyGridData]);

  // Removed handleBingo function and related alert generation logic

  const handleResetGame = useCallback(async () => {
    if (!myGameStateId || !user || !playerSelectedFruits) return;

    const centerCellIndex = Math.floor(gridSize / 2);
    let initialGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    initialGrid[centerCellIndex][centerCellIndex] = true;

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
      console.error('useGameLogic - Error resetting game:', error);
    } else {
      showSuccess('Your game has been reset!');
      setResetKey(prev => prev + 1);
      setMyGridData(initialGrid);
    }
  }, [myGameStateId, user, playerSelectedFruits, gridSize, setResetKey, setMyGridData]);

  const handleGlobalRefresh = useCallback(async () => {
    if (!roomId || !user) return;

    await fetchAndSetAllGameStates(gridSize);
    showSuccess('Your data has been refreshed!');

    const { error } = await supabase
      .from('rooms')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', roomId)
      .eq('created_by', user.id);

    if (error) {
      showError('Failed to trigger global refresh for others. Only the room creator can do this.');
      console.error('useGameLogic - Error triggering global refresh:', error);
    }
  }, [roomId, user, gridSize, fetchAndSetAllGameStates]);

  return {
    handleCellToggle,
    // handleBingo, // Removed
    handleResetGame,
    handleGlobalRefresh,
  };
};