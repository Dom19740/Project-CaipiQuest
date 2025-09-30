import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import BingoGrid from '@/components/BingoGrid';
import RoomSidebar from '@/components/RoomSidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';
import GameResetDialog from '@/components/GameResetDialog';
import NewPlayerAlert from '@/components/NewPlayerAlert';
// import RoomAlertsCard from '@/components/RoomAlertsCard'; // Removed Alerts Card

import { useGameRoomData } from '@/hooks/use-game-room-data';
import { useGameRoomRealtime } from '@/hooks/use-game-room-realtime';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useSession } from '@/components/SessionContextProvider';

const GameRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedFruits: initialSelectedFruitsFromState, gridSize: initialGridSizeFromState } = (location.state || {}) as { selectedFruits?: string[]; gridSize?: number };
  const { isLoading: isLoadingSession, user } = useSession();

  const [resetKey, setResetKey] = useState(0);

  const {
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
  } = useGameRoomData(roomId, initialSelectedFruitsFromState, initialGridSizeFromState);

  const {
    // roomBingoAlerts, // Removed
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
    // handleBingo, // Removed
    handleResetGame,
    handleGlobalRefresh,
  } = useGameLogic(
    roomId,
    myGameStateId,
    myGridData,
    setMyGridData,
    myPlayerName,
    roomCreatorId,
    playerSelectedFruits,
    gridSize,
    fetchAndSetAllGameStates,
    setResetKey
  );

  if (isLoadingSession || isLoadingInitialData || !user || !roomId || playerSelectedFruits.length !== gridSize) {
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
          // onBingo={handleBingo} // Removed
          resetKey={resetKey}
          initialGridState={myGridData}
          onCellToggle={handleCellToggle}
          selectedFruits={playerSelectedFruits}
          gridSize={gridSize}
        />
        <div className="flex flex-col gap-4">
          {roomCode && <RoomSidebar roomCode={roomCode} playerScores={playerScores} />}
          
          {/* Removed RoomAlertsCard */}

          <div className="flex flex-row gap-2 justify-center w-full lg:w-80"> {/* New container for buttons */}
            <GameResetDialog onConfirm={handleResetGame} />
            <Button onClick={handleGlobalRefresh} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md shadow-lg text-sm transition-all duration-300 ease-in-out transform hover:scale-105">
              Refresh
            </Button>
            <Button onClick={() => navigate('/lobby')} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md shadow-lg text-sm transition-all duration-300 ease-in-out transform hover:scale-105">
              Leave
            </Button>
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