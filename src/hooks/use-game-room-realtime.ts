import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess } from '@/utils/toast';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface PlayerScore {
  id: string;
  name: string;
  caipisCount: number;
  isMe: boolean;
}

interface GameRoomRealtimeData {
  partyBingoAlerts: BingoAlert[];
  playerScores: PlayerScore[];
  newPlayerJoinedName: string;
  showNewPlayerAlert: boolean;
  setShowNewPlayerAlert: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAndSetAllGameStates: (currentGridSize: number) => Promise<void>;
  initialAlertsLoaded: boolean;
}

// New function to count unique caipis
const countCheckedCaipis = (grid: boolean[][], selectedFruits: string[], gridSize: number): number => {
  if (!grid || grid.length === 0 || !selectedFruits || selectedFruits.length !== gridSize) {
    return 0;
  }

  const uniqueCaipis = new Set<string>();
  const CENTER_CELL_INDEX = Math.floor(gridSize / 2);

  const currentDisplayFruits = [...selectedFruits];

  const limeIndex = currentDisplayFruits.indexOf('lime');
  if (limeIndex !== -1 && limeIndex !== CENTER_CELL_INDEX) {
    [currentDisplayFruits[CENTER_CELL_INDEX], currentDisplayFruits[limeIndex]] = [currentDisplayFruits[limeIndex], currentDisplayFruits[CENTER_CELL_INDEX]];
  } else if (limeIndex === -1) {
    console.warn("Lime not found in selected fruits for caipi counting, returning 0.");
    return 0;
  }

  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    for (let colIndex = 0; colIndex < gridSize; colIndex++) {
      const isCenterCell = rowIndex === CENTER_CELL_INDEX && colIndex === CENTER_CELL_INDEX;

      if (grid[rowIndex][colIndex] && !isCenterCell) {
        const fruit1 = currentDisplayFruits[rowIndex];
        const fruit2 = currentDisplayFruits[colIndex];
        const combination = [fruit1, fruit2].sort().join('-');
        uniqueCaipis.add(combination);
      }
    }
  }
  return uniqueCaipis.size;
};


export const useGameRoomRealtime = (
  partyId: string | undefined,
  gridSize: number,
  myGridData: boolean[][],
  setMyGridData: React.Dispatch<React.SetStateAction<boolean[][]>>,
  setPlayerSelectedFruits: React.Dispatch<React.SetStateAction<string[]>>,
  setGridSize: React.Dispatch<React.SetStateAction<number>>,
  initializeOrUpdateGameState: (currentPartyId: string, currentUser: any, currentSelectedFruits: string[], currentGridSize: number) => Promise<void>
): GameRoomRealtimeData => {
  const { user } = useSession();

  const [partyBingoAlerts, setPartyBingoAlerts] = useState<BingoAlert[]>([]);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [showNewPlayerAlert, setShowNewPlayerAlert] = useState(false);
  const [newPlayerJoinedName, setNewPlayerJoinedName] = useState('');
  const [initialAlertsLoaded, setInitialAlertsLoaded] = useState(false);

  const partyBingoAlertsRef = useRef<BingoAlert[]>([]);

  useEffect(() => {
    partyBingoAlertsRef.current = partyBingoAlerts;
  }, [partyBingoAlerts]);

  const fetchAndSetAllGameStates = useCallback(async (currentGridSize: number) => {
    if (!partyId || !user) return;

    const { data: allGameStates, error: allGameStatesError } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', partyId);

    if (allGameStatesError) {
      console.error('useGameRoomRealtime - Error fetching all game states:', allGameStatesError);
      return;
    }

    const scores: PlayerScore[] = allGameStates.map(gs => ({
      id: gs.player_id,
      name: gs.player_name,
      caipisCount: countCheckedCaipis(gs.grid_data || [], gs.selected_fruits || [], currentGridSize),
      isMe: gs.player_id === user.id,
    }));
    setPlayerScores(scores);

    const myGameState = allGameStates.find(gs => gs.player_id === user.id);
    if (myGameState) {
      const centerCellIndex = Math.floor(currentGridSize / 2);
      const fetchedGrid = myGameState.grid_data || Array(currentGridSize).fill(null).map(() => Array(currentGridSize).fill(false));
      if (fetchedGrid.length !== currentGridSize || (fetchedGrid.length > 0 && fetchedGrid[0].length !== currentGridSize)) {
        const newGrid = Array(currentGridSize).fill(null).map(() => Array(currentGridSize).fill(false));
        newGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(newGrid);
      } else {
        fetchedGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(fetchedGrid);
      }
      setPlayerSelectedFruits(myGameState.selected_fruits || []);
    }
  }, [partyId, user, setMyGridData, setPlayerSelectedFruits]);

  const fetchInitialPartyAlerts = useCallback(async () => {
    if (!partyId) return;
    const { data: party, error } = await supabase
      .from('rooms')
      .select('bingo_alerts')
      .eq('id', partyId)
      .single();

    if (error) {
      console.error('useGameRoomRealtime - Error fetching initial party alerts:', error);
      return;
    }
    setPartyBingoAlerts(party?.bingo_alerts || []);
    partyBingoAlertsRef.current = party?.bingo_alerts || [];
    setInitialAlertsLoaded(true);
  }, [partyId]);

  useEffect(() => {
    if (!partyId || !user) return;

    fetchInitialPartyAlerts();

    const channel = supabase
      .channel(`party:${partyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${partyId}`,
        },
        async (payload) => {
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
            setPlayerScores(prevScores => {
              const newCaipisCount = countCheckedCaipis(updatedGameState.grid_data || [], updatedGameState.selected_fruits || [], gridSize);
              return prevScores.map(score =>
                score.id === updatedGameState.player_id
                  ? { ...score, caipisCount: newCaipisCount, name: updatedGameState.player_name }
                  : score
              );
            });

            if (updatedGameState.player_id === user.id) {
              const centerCellIndex = Math.floor(gridSize / 2);
              const updatedGrid = updatedGameState.grid_data || Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
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
          filter: `id=eq.${partyId}`,
        },
        async (payload) => {
          const updatedParty = payload.new as { last_refreshed_at?: string; bingo_alerts?: BingoAlert[]; grid_size?: number };

          if (updatedParty.last_refreshed_at) {
            await fetchAndSetAllGameStates(gridSize);
          }

          if (updatedParty.bingo_alerts) {
            setPartyBingoAlerts(updatedParty.bingo_alerts || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, user, gridSize, myGridData, setMyGridData, setPlayerSelectedFruits, setGridSize, fetchAndSetAllGameStates, initializeOrUpdateGameState, playerScores, fetchInitialPartyAlerts]);

  return {
    partyBingoAlerts,
    playerScores,
    newPlayerJoinedName,
    showNewPlayerAlert,
    setShowNewPlayerAlert,
    fetchAndSetAllGameStates,
    initialAlertsLoaded,
  };
};