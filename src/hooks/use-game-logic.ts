import { useCallback, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string; // Added playerId
  canonicalId?: string; // NEW: Canonical ID for the bingo condition (e.g., 'row-0', 'diag-1', 'full-grid')
}

// Moved alertIdCounter into a useRef for better encapsulation
// and to ensure it's unique per hook instance, not globally.
// Date.now() is the primary source of uniqueness, this just adds a secondary increment.
const useAlertIdGenerator = () => {
  const alertIdCounterRef = useRef(0);
  const generateAlertId = useCallback(() => {
    alertIdCounterRef.current += 1;
    return `alert-${alertIdCounterRef.current}-${Date.now()}`;
  }, []);
  return generateAlertId;
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
  const generateAlertId = useAlertIdGenerator(); // Use the new hook for ID generation
  const [showWinAnimation, setShowWinAnimation] = useState(false); // New state for win animation

  const handleCellToggle = useCallback(async (row: number, col: number) => {
    if (!myGameStateId || !user || !partyId) return; // Changed from roomId
    const centerCellIndex = Math.floor(gridSize / 2);
    if (row === centerCellIndex && col === centerCellIndex) return;

    const newGridData = myGridData.map(r => [...r]);
    const newState = !newGridData[row][col];
    newGridData[row][col] = newState;
    // Restored symmetric toggling logic
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

  const handleBingo = useCallback(async (type: 'rowCol' | 'diagonal' | 'fullGrid', baseMessage: string, canonicalId: string) => { // Added canonicalId
    if (!partyId || !user || !myPlayerName) return; // Changed from roomId

    const { data: currentParty, error: fetchPartyError } = await supabase
      .from('rooms')
      .select('bingo_alerts, full_grid_bingo_achieved_by') // Fetch new column
      .eq('id', partyId)
      .single();

    if (fetchPartyError) {
      showError('Failed to fetch party alerts.');
      console.error('useGameLogic - Error fetching party alerts for bingo:', fetchPartyError);
      return;
    }

    const existingAlerts = currentParty?.bingo_alerts || [];
    const alreadyAlerted = existingAlerts.some(alert => alert.canonicalId === canonicalId && alert.playerId === user.id);

    if (alreadyAlerted) {
      console.log(`Bingo for ${canonicalId} by ${myPlayerName} already recorded in DB. Skipping.`);
      return;
    }

    const message = `BINGO! ${myPlayerName} ${baseMessage}`;
    const newAlert: BingoAlert = { id: generateAlertId(), type, message, playerName: myPlayerName, playerId: user.id, canonicalId };

    const updatedAlerts = [newAlert, ...existingAlerts];
    let updatePayload: { bingo_alerts: BingoAlert[]; full_grid_bingo_achieved_by?: string } = { bingo_alerts: updatedAlerts };

    // Logic for full grid bingo animation
    if (type === 'fullGrid') {
      if (!currentParty.full_grid_bingo_achieved_by) {
        // This player is the first to achieve a full grid bingo
        updatePayload.full_grid_bingo_achieved_by = user.id;
        setShowWinAnimation(true); // Trigger animation for this player
      } else {
        console.log(`Full grid bingo already achieved by ${currentParty.full_grid_bingo_achieved_by}. Not triggering animation for ${user.id}.`);
      }
    }

    const { error: updatePartyAlertsError } = await supabase
      .from('rooms')
      .update(updatePayload)
      .eq('id', partyId);

    if (updatePartyAlertsError) {
      showError('Failed to record bingo alert globally.');
      console.error('useGameLogic - Error recording global bingo:', updatePartyAlertsError);
    } else {
      showSuccess(message);
    }
  }, [partyId, user, myPlayerName, generateAlertId]);

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
    if (!partyId || !user) return;

    await fetchAndSetAllGameStates(gridSize);
    showSuccess('Your data has been refreshed!');

    const { error } = await supabase
      .from('rooms')
      .update({ last_refreshed_at: new Date().toISOString() })
      .eq('id', partyId)
      .eq('created_by', user.id);

    if (error) {
      showError('Failed to trigger global refresh for others. Only the party creator can do this.');
      console.error('useGameLogic - Error triggering global refresh:', error);
    }
  }, [partyId, user, gridSize, fetchAndSetAllGameStates]);

  return {
    handleCellToggle,
    handleBingo,
    handleResetGame,
    handleGlobalRefresh,
    showWinAnimation,
    setShowWinAnimation,
  };
};