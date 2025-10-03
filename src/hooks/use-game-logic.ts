import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string; // Added playerId
}

let alertIdCounter = 0;
const generateAlertId = () => {
  alertIdCounter += 1;
  return `alert-${alertIdCounter}-${Date.now()}`;
};

export const useGameLogic = (
  partyId: string | undefined, // Changed from roomId
  myGameStateId: string | null,
  myGridData: boolean[][],
  setMyGridData: React.Dispatch<React.SetStateAction<boolean[][]>>,
  myPlayerName: string,
  partyCreatorId: string | null, // Changed from roomCreatorId
  playerSelectedFruits: string[],
  gridSize: number,
  fetchAndSetAllGameStates: (currentGridSize: number) => Promise<void>,
  setResetKey: React.Dispatch<React.SetStateAction<number>>
) => {
  const { user } = useSession();

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user || !partyId) return; // Changed from roomId
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

      if (user.id === partyCreatorId) { // Changed from roomCreatorId
        const { error: updatePartyError } = await supabase // Changed from updateRoomError
          .from('rooms')
          .update({ last_refreshed_at: new Date().toISOString() })
          .eq('id', partyId) // Changed from roomId
          .eq('created_by', user.id);

        if (updatePartyError) { // Changed from updateRoomError
          console.error('useGameLogic - Error triggering global refresh from cell toggle:', updatePartyError); // Changed from updateRoomError
        }
      }
    }
  }, [myGridData, myGameStateId, user, partyId, partyCreatorId, gridSize, fetchAndSetAllGameStates, setMyGridData]); // Changed from roomId, roomCreatorId

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string) => {
    if (!partyId || !user || !myPlayerName) return; // Changed from roomId

    const message = `BINGO! ${myPlayerName} ${baseMessage}`;
    const newAlert: BingoAlert = { id: generateAlertId(), type, message, playerName: myPlayerName, playerId: user.id };

    const { data: currentParty, error: fetchPartyError } = await supabase // Changed from currentRoom, fetchRoomError
      .from('rooms')
      .select('bingo_alerts')
      .eq('id', partyId) // Changed from roomId
      .single();

    if (fetchPartyError) { // Changed from fetchRoomError
      showError('Failed to fetch party alerts.'); // Changed from room alerts
      console.error('useGameLogic - Error fetching party alerts for bingo:', fetchPartyError); // Changed from room alerts, fetchRoomError
      return;
    }

    const existingAlerts = currentParty?.bingo_alerts || []; // Changed from currentRoom
    const updatedAlerts = [newAlert, ...existingAlerts];

    const { error: updatePartyAlertsError } = await supabase // Changed from updateRoomAlertsError
      .from('rooms')
      .update({ bingo_alerts: updatedAlerts })
      .eq('id', partyId); // Changed from roomId

    if (updatePartyAlertsError) { // Changed from updateRoomAlertsError
      showError('Failed to record bingo alert globally.');
      console.error('useGameLogic - Error recording global bingo:', updatePartyAlertsError); // Changed from updateRoomAlertsError
    } else {
      showSuccess(message);
    }
  }, [partyId, user, myPlayerName]); // Changed from roomId

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
    if (!partyId || !user) return; // Changed from roomId

    await fetchAndSetAllGameStates(gridSize);
    showSuccess('Your data has been refreshed!');

    const { error } = await supabase
      .from('rooms')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', partyId) // Changed from roomId
      .eq('created_by', user.id);

    if (error) {
      showError('Failed to trigger global refresh for others. Only the party creator can do this.'); // Changed from room creator
      console.error('useGameLogic - Error triggering global refresh:', error);
    }
  }, [partyId, user, gridSize, fetchAndSetAllGameStates]); // Changed from roomId

  return {
    handleCellToggle,
    handleBingo,
    handleResetGame,
    handleGlobalRefresh,
  };
};