import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess } from '@/utils/toast';

interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
}

interface PlayerScore {
  id: string;
  name: string;
  squaresClicked: number;
  isMe: boolean;
}

interface GameRoomRealtimeData {
  partyBingoAlerts: BingoAlert[]; // Changed from roomBingoAlerts
  playerScores: PlayerScore[];
  showConfetti: boolean;
  confettiConfig: {
    numberOfPieces: number;
    recycle: boolean;
    gravity: number;
    initialVelocityX: { min: number; max: number; };
    initialVelocityY: { min: number; max: number; };
  };
  newPlayerJoinedName: string;
  showNewPlayerAlert: boolean;
  setShowNewPlayerAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAndSetAllGameStates: (currentGridSize: number) => Promise<void>;
  setConfettiConfig: React.Dispatch<React.SetStateAction<{
    numberOfPieces: number;
    recycle: boolean;
    gravity: number;
    initialVelocityX: { min: number; max: number; };
    initialVelocityY: { min: number; max: number; };
  }>>;
}

const countCheckedSquares = (grid: boolean[][]): number => {
  if (!grid || grid.length === 0) return 0;
  return grid.flat().filter(Boolean).length;
};

export const useGameRoomRealtime = (
  partyId: string | undefined, // Changed from roomId
  gridSize: number,
  myGridData: boolean[][],
  setMyGridData: React.Dispatch<React.SetStateAction<boolean[][]>>,
  setPlayerSelectedFruits: React.Dispatch<React.SetStateAction<string[]>>,
  setGridSize: React.Dispatch<React.SetStateAction<number>>,
  initializeOrUpdateGameState: (currentPartyId: string, currentUser: any, currentSelectedFruits: string[], currentGridSize: number) => Promise<void> // Changed from currentRoomId
): GameRoomRealtimeData => {
  const { user } = useSession();

  const [partyBingoAlerts, setPartyBingoAlerts] = useState<BingoAlert[]>([]); // Changed from roomBingoAlerts
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.1,
    initialVelocityX: { min: -5, max: 5 },
    initialVelocityY: { min: -10, max: -5 },
  });
  const [showNewPlayerAlert, setShowNewPlayerAlert] = useState(false);
  const [newPlayerJoinedName, setNewPlayerJoinedName] = useState('');

  const fetchAndSetAllGameStates = useCallback(async (currentGridSize: number) => {
    if (!partyId || !user) return; // Changed from roomId

    const { data: allGameStates, error: allGameStatesError } = await supabase
      .from('game_states')
      .select('*')
      .eq('room_id', partyId); // Still refers to 'room_id' in DB

    if (allGameStatesError) {
      console.error('useGameRoomRealtime - Error fetching all game states:', allGameStatesError);
      return;
    }

    const scores: PlayerScore[] = allGameStates.map(gs => ({
      id: gs.player_id,
      name: gs.player_name,
      squaresClicked: countCheckedSquares(gs.grid_data || []),
      isMe: gs.player_id === user.id,
    }));
    setPlayerScores(scores);

    const myGameState = allGameStates.find(gs => gs.player_id === user.id);
    if (myGameState) {
      const centerCellIndex = Math.floor(currentGridSize / 2);
      const fetchedGrid = myGameState.grid_data || Array(currentGridSize).fill(Array(currentGridSize).fill(false));
      if (fetchedGrid.length !== currentGridSize || (fetchedGrid.length > 0 && fetchedGrid[0].length !== currentGridSize)) {
        const newGrid = Array(currentGridSize).fill(Array(currentGridSize).fill(false));
        newGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(newGrid);
      } else {
        fetchedGrid[centerCellIndex][centerCellIndex] = true;
        setMyGridData(fetchedGrid);
      }
      setPlayerSelectedFruits(myGameState.selected_fruits || []);
    }
  }, [partyId, user, setMyGridData, setPlayerSelectedFruits]); // Changed from roomId

  const fetchInitialPartyAlerts = useCallback(async () => { // Changed from fetchInitialRoomAlerts
    if (!partyId) return; // Changed from roomId
    const { data: party, error } = await supabase // Changed from room
      .from('rooms')
      .select('bingo_alerts')
      .eq('id', partyId) // Changed from roomId
      .single();

    if (error) {
      console.error('useGameRoomRealtime - Error fetching initial party alerts:', error); // Changed from room alerts
      return;
    }
    setPartyBingoAlerts(party?.bingo_alerts || []); // Changed from setRoomBingoAlerts, room
  }, [partyId]); // Changed from roomId

  useEffect(() => {
    if (!partyId || !user) return; // Changed from roomId

    fetchInitialPartyAlerts(); // Call this on mount to get existing alerts // Changed from fetchInitialRoomAlerts

    const channel = supabase
      .channel(`party:${partyId}`) // Changed channel name
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${partyId}`, // Still refers to 'room_id' in DB
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
              const newSquaresClicked = countCheckedSquares(updatedGameState.grid_data || []);
              return prevScores.map(score =>
                score.id === updatedGameState.player_id
                  ? { ...score, squaresClicked: newSquaresClicked, name: updatedGameState.player_name }
                  : score
              );
            });

            if (updatedGameState.player_id === user.id) {
              const centerCellIndex = Math.floor(gridSize / 2);
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
          filter: `id=eq.${partyId}`, // Still refers to 'id' in DB
        },
        async (payload) => {
          const updatedParty = payload.new as { last_refreshed_at?: string; bingo_alerts?: BingoAlert[]; grid_size?: number }; // Changed from updatedRoom

          if (updatedParty.last_refreshed_at) { // Changed from updatedRoom
            await fetchAndSetAllGameStates(gridSize);
          }

          if (updatedParty.bingo_alerts) { // Changed from updatedRoom
            setPartyBingoAlerts(prevPartyBingoAlerts => { // Changed from setRoomBingoAlerts
              const incomingAlerts = updatedParty.bingo_alerts || []; // Changed from updatedRoom
              const newAlertsForConfetti = incomingAlerts.filter(
                (incomingAlert: BingoAlert) => !prevPartyBingoAlerts.some(existingAlert => existingAlert.id === incomingAlert.id)
              );

              if (newAlertsForConfetti.length > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2000);
              }
              return incomingAlerts;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId, user, gridSize, myGridData, setMyGridData, setPlayerSelectedFruits, setGridSize, fetchAndSetAllGameStates, initializeOrUpdateGameState, playerScores, fetchInitialPartyAlerts]); // Changed from roomId, fetchInitialRoomAlerts

  return {
    partyBingoAlerts, // Changed from roomBingoAlerts
    playerScores,
    showConfetti,
    confettiConfig,
    newPlayerJoinedName,
    showNewPlayerAlert,
    setShowNewPlayerAlert,
    setShowConfetti,
    fetchAndSetAllGameStates,
    setConfettiConfig,
  };
};