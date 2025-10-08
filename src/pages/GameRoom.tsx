import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BingoGrid from '@/components/BingoGrid';
import PartySidebar from '@/components/PartySidebar';
import MadeWithDyad from '@/components/made-with-dyad';
import NewPlayerAlert from '@/components/NewPlayerAlert';
import LeavePartyDialog from '@/components/LeavePartyDialog';
import BingoWinAnimation from '@/components/BingoWinAnimation';

import { useGameRoomData } from '@/hooks/use-game-room-data';
import { useGameRoomRealtime } from '@/hooks/use-game-room-realtime';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useSession } from '@/components/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client'; // Import supabase for leave logic
import { showSuccess, showError } from '@/utils/toast'; // Import toast for leave logic

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFruits: initialSelectedFruitsFromState } = (location.state || {}) as { selectedFruits?: string[] };
  const { isLoading: isLoadingSession, user } = useSession();

  const [resetKey, setResetKey] = useState(0);

  const {
    gridSize,
    partyCode,
    partyCreatorId,
    myGameStateId,
    myGridData,
    myPlayerName,
    playerSelectedFruits,
    isLoadingInitialData,
    initializeOrUpdateGameState,
    setMyGridData,
    setPlayerSelectedFruits,
    setGridSize,
    // setMyPlayerName, // This is not returned by useGameRoomData, but it's passed to PartySidebar
  } = useGameRoomData(roomId, initialSelectedFruitsFromState, undefined);

  const {
    partyBingoAlerts,
    playerScores,
    newPlayerJoinedName,
    showNewPlayerAlert,
    setShowNewPlayerAlert,
    fetchAndSetAllGameStates,
    initialAlertsLoaded,
    partyCreatorName: realtimePartyCreatorName, // Get creator name from realtime hook
  } = useGameRoomRealtime(
    roomId,
    gridSize,
    myGridData,
    setMyGridData,
    setPlayerSelectedFruits,
    setGridSize,
    initializeOrUpdateGameState
  );

  const {
    handleCellToggle,
    handleBingo,
    handleResetGame,
    handleGlobalRefresh,
    showWinAnimation,
    setShowWinAnimation,
  } = useGameLogic(
    roomId,
    myGameStateId,
    myGridData,
    setMyGridData,
    myPlayerName,
    partyCreatorId,
    playerSelectedFruits,
    gridSize,
    fetchAndSetAllGameStates,
    setResetKey
  );

  useEffect(() => {
    if (!isLoadingInitialData && roomId && user) {
      console.log("GameRoom - Initial data loaded, performing a refresh to update player list.");
      fetchAndSetAllGameStates(gridSize);
    }
  }, [isLoadingInitialData, roomId, user, gridSize, fetchAndSetAllGameStates]);

  // Effect to save current room info to local storage
  useEffect(() => {
    if (roomId && partyCode) {
      localStorage.setItem('lastActiveRoomId', roomId);
      localStorage.setItem('lastActivePartyCode', partyCode);
      console.log(`GameRoom - Saved last active room: ${roomId} (${partyCode})`);
    }
  }, [roomId, partyCode]);

  const handleLeaveParty = async () => {
    if (!user || !roomId || !partyCreatorId) {
      showError('Cannot leave party: missing user, room ID, or creator ID.');
      return;
    }

    try {
      if (partyCreatorId === user.id) {
        // If the current user is the creator, delete the room
        const { error: deleteError } = await supabase
          .from('rooms')
          .delete()
          .eq('id', roomId);

        if (deleteError) {
          throw deleteError;
        }
        showSuccess('Party disbanded.');
      } else {
        // For non-creators, just leave (no specific DB action needed for leaving, presence handles it)
        showSuccess('Left the party.');
      }
      localStorage.removeItem('lastActiveRoomId');
      localStorage.removeItem('lastActivePartyCode');
      console.log("GameRoom - Cleared last active room from local storage.");
      navigate('/lobby');
    } catch (error: any) {
      showError(`Error leaving party: ${error.message}`);
      console.error('GameRoom - Error leaving party:', error);
    }
  };

  if (isLoadingSession || isLoadingInitialData || !user || !roomId || playerSelectedFruits.length !== gridSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading game party...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-12 pb-8 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-green-500 via-yellow-400 via-orange-500 to-pink-600 relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start w-full max-w-6xl">
        {/* Left section: Title and Bingo Grid */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <img
            src="/title_caipiquest_bingo.png"
            alt="CaipiQuest Bingo!"
            className="max-w-full h-auto w-80 sm:w-96 md:w-[400px] lg:w-[450px] xl:w-[500px] drop-shadow-lg"
          />
          <BingoGrid
            onBingo={handleBingo}
            resetKey={resetKey}
            initialGridState={myGridData}
            onCellToggle={handleCellToggle}
            selectedFruits={playerSelectedFruits}
            gridSize={gridSize}
            partyBingoAlerts={partyBingoAlerts}
            initialAlertsLoaded={initialAlertsLoaded}
          />
        </div>

        {/* Right Panel: Party Sidebar and Buttons */}
        <div className="flex flex-col gap-4 w-full lg:w-1/3 lg:max-w-md">
          {/* PartySidebar component */}
          <PartySidebar
            partyCode={partyCode}
            playerScores={playerScores}
            alerts={partyBingoAlerts}
            currentUserId={user.id}
            partyCreatorId={partyCreatorId}
            partyCreatorName={realtimePartyCreatorName} // Pass from realtime hook
            gridSize={gridSize}
            onRefreshPlayers={() => handleGlobalRefresh()} // Call handleGlobalRefresh from useGameLogic
            onLeaveParty={handleLeaveParty} // Call the new handleLeaveParty in GameRoom
            myPlayerName={myPlayerName}
            setMyPlayerName={() => { /* setMyPlayerName is not directly used here, but could be passed if needed */ }}
          />

        </div>
      </div>

      <NewPlayerAlert
        playerName={newPlayerJoinedName}
        isOpen={showNewPlayerAlert}
        onClose={() => setShowNewPlayerAlert(false)}
      />

      <BingoWinAnimation show={showWinAnimation} onClose={() => setShowWinAnimation(false)} />

      <MadeWithDyad />
    </div>
  );
};

export default GameRoom;