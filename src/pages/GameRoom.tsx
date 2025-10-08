import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BingoGrid from '@/components/BingoGrid';
import PartySidebar from '@/components/PartySidebar';
import MadeWithDyad from '@/components/made-with-dyad'; // Changed to default import
import NewPlayerAlert from '@/components/NewPlayerAlert';
import LeavePartyDialog from '@/components/LeavePartyDialog';
import BingoWinAnimation from '@/components/BingoWinAnimation'; // Import the new component

import { useGameRoomData } from '@/hooks/use-game-room-data';
import { useGameRoomRealtime } from '@/hooks/use-game-room-realtime';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useSession } from '@/components/SessionContextProvider';

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
    partyCreatorName, // Destructured new prop
    myGameStateId,
    myGridData,
    myPlayerName,
    playerSelectedFruits,
    isLoadingInitialData,
    initializeOrUpdateGameState,
    setMyGridData,
    setPlayerSelectedFruits,
    setGridSize,
    setMyPlayerName,
  } = useGameRoomData(roomId, initialSelectedFruitsFromState, undefined);

  const {
    partyBingoAlerts,
    playerScores,
    newPlayerJoinedName,
    showNewPlayerAlert,
    setShowNewPlayerAlert,
    fetchAndSetAllGameStates,
    initialAlertsLoaded,
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
    handleGlobalRefresh, // Still needed for the hook, but button removed
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

  const handleLeaveParty = () => {
    localStorage.removeItem('lastActiveRoomId');
    localStorage.removeItem('lastActivePartyCode');
    console.log("GameRoom - Cleared last active room from local storage.");
    navigate('/lobby');
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
            roomId={roomId} // Pass roomId
            partyCode={partyCode}
            playerScores={playerScores}
            alerts={partyBingoAlerts}
            currentUserId={user.id}
            onRefreshPlayers={() => fetchAndSetAllGameStates(gridSize)}
            onLeaveParty={handleLeaveParty}
            myPlayerName={myPlayerName}
            setMyPlayerName={setMyPlayerName}
            partyCreatorId={partyCreatorId}
            partyCreatorName={partyCreatorName}
          />

          {/* Removed Refresh Global button */}
          {/* <div className="flex flex-row gap-2 justify-center w-full">
            <Button onClick={handleGlobalRefresh} className="flex-1 bg-lime-700 hover:bg-lime-800 text-white py-3 px-3 rounded-md shadow-lg text-sm sm:text-base transition-all duration-300 ease-in-out transform hover:scale-105 h-12">
              Refresh Global
            </Button>
          </div> */}
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