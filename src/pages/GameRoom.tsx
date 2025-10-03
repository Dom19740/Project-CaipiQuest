import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import BingoGrid from '@/components/BingoGrid';
import PartySidebar from '@/components/PartySidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import NewPlayerAlert from '@/components/NewPlayerAlert';
import PartyAlertsCard from '@/components/PartyAlertsCard';
import LeavePartyDialog from '@/components/LeavePartyDialog';

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
    myGameStateId,
    myGridData,
    myPlayerName,
    playerSelectedFruits,
    isLoadingInitialData,
    initializeOrUpdateGameState,
    setMyGridData,
    setPlayerSelectedFruits,
    setGridSize,
  } = useGameRoomData(roomId, initialSelectedFruitsFromState, undefined);

  const {
    partyBingoAlerts,
    playerScores,
    showConfetti,
    confettiConfig,
    newPlayerJoinedName,
    showNewPlayerAlert,
    setShowNewPlayerAlert,
    setShowConfetti,
    fetchAndSetAllGameStates,
    setConfettiConfig,
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

  // Effect to trigger a refresh of player list when entering the room
  useEffect(() => {
    if (!isLoadingInitialData && roomId && user) {
      console.log("GameRoom - Initial data loaded, performing a refresh to update player list.");
      fetchAndSetAllGameStates(gridSize);
    }
  }, [isLoadingInitialData, roomId, user, gridSize, fetchAndSetAllGameStates]);


  if (isLoadingSession || isLoadingInitialData || !user || !roomId || playerSelectedFruits.length !== gridSize) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400">
        <p className="text-xl text-gray-700">Loading game party...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-12 pb-8 px-4 bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 relative overflow-hidden">
      {showConfetti && <Confetti {...confettiConfig} />}
      
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start w-full max-w-6xl">
        {/* Left section: Title and Bingo Grid */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8"> {/* Added flex-col and gap-8 */}
          <h1 className="text-3xl font-extrabold drop-shadow-lg text-center text-foreground w-full"> {/* Removed mb-8, added w-full */}
            🍹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800">CaipiQuest Bingo!</span> 🍹
          </h1>
          <BingoGrid
            onBingo={handleBingo}
            resetKey={resetKey}
            initialGridState={myGridData}
            onCellToggle={handleCellToggle}
            selectedFruits={playerSelectedFruits}
            gridSize={gridSize}
            partyBingoAlerts={partyBingoAlerts} // Pass the alerts here
          />
        </div>

        {/* Right Panel: Cards and Buttons */}
        <div className="flex flex-col gap-4 w-full lg:w-1/3 lg:max-w-md">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <PartyAlertsCard alerts={partyBingoAlerts} currentUserId={user.id} />
            {partyCode && <PartySidebar partyCode={partyCode} playerScores={playerScores} />}
          </div>

          {/* Buttons */}
          <div className="flex flex-row gap-2 justify-center w-full">
            <Button onClick={handleGlobalRefresh} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md shadow-lg text-sm transition-all duration-300 ease-in-out transform hover:scale-105">
              Refresh
            </Button>
            <LeavePartyDialog onConfirm={() => navigate('/lobby')} />
          </div>
        </div>
      </div>

      <NewPlayerAlert
        playerName={newPlayerJoinedName}
        isOpen={showNewPlayerAlert}
        onClose={() => setShowNewPlayerAlert(false)}
      />

      <MadeWithDyad />
    </div>
  );
};

export default GameRoom;