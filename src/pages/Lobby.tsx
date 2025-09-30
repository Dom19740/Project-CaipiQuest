import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Lobby: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>(localStorage.getItem('playerName') || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    } else {
      localStorage.removeItem('playerName');
    }
  }, [playerName]);

  // Ensure an anonymous session exists if no user is present
  useEffect(() => {
    const ensureSession = async () => {
      if (!isLoading && !user) {
        console.log("Lobby - Attempting anonymous sign-in...");
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Lobby - Error signing in anonymously:', error.message);
          showError(`Failed to establish a session: ${error.message}. Please try again.`);
        } else {
          console.log("Lobby - Anonymous sign-in successful.");
        }
      }
    };
    ensureSession();
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      console.log("Lobby - User ID for this session:", user.id);
    }
  }, [user]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to create a room.');
      return;
    }

    setIsCreating(true);
    const newRoomCode = generateRoomCode();
    try {
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({ code: newRoomCode, created_by: user.id, created_by_name: playerName, player_names: [playerName] })
        .select()
        .single();

      if (roomError) throw roomError;
      console.log("Lobby - Room created:", roomData);

      // Create initial game state for the creator
      const { error: gameStateError } = await supabase
        .from('game_states')
        .insert({ room_id: roomData.id, player_id: user.id, player_name: playerName, grid_data: Array(9).fill(Array(9).fill(false)) });

      if (gameStateError) throw gameStateError;
      console.log("Lobby - Initial game state created for creator.");

      showSuccess(`Room "${newRoomCode}" created!`);
      navigate(`/game/${roomData.id}`);
    } catch (error: any) {
      console.error('Lobby - Error creating room:', error.message);
      showError(`Failed to create room: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to join a room.');
      return;
    }

    setIsJoining(true);
    try {
      // Find the room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('id, player_names')
        .eq('code', roomCodeInput.toUpperCase())
        .single();

      if (roomError) {
        if (roomError.code === 'PGRST116') { // No rows found
          throw new Error('Room not found. Please check the code.');
        }
        throw roomError;
      }
      console.log("Lobby - Found room:", roomData);

      // Check if player already has a game state in this room
      // Changed select('id, player_name') to select('*') to debug 406 error
      const { data: existingGameState, error: existingGameStateError } = await supabase
        .from('game_states')
        .select('*') 
        .eq('room_id', roomData.id)
        .eq('player_id', user.id)
        .single();

      if (existingGameStateError && existingGameStateError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        console.error('Lobby - Error checking existing game state:', existingGameStateError.message);
        throw existingGameStateError;
      }
      console.log("Lobby - Existing game state for player:", existingGameState);

      if (!existingGameState) {
        // Create initial game state for the joining player
        const { error: gameStateError } = await supabase
          .from('game_states')
          .insert({ room_id: roomData.id, player_id: user.id, player_name: playerName, grid_data: Array(9).fill(Array(9).fill(false)) });

        if (gameStateError) throw gameStateError;
        console.log("Lobby - New game state created for joining player.");
      } else if (existingGameState.player_name !== playerName) {
        // If game state exists but player name changed, update it
        const { error: updatePlayerNameError } = await supabase
          .from('game_states')
          .update({ player_name: playerName, updated_at: new Date().toISOString() })
          .eq('id', existingGameState.id);
        if (updatePlayerNameError) console.error('Lobby - Error updating player name in game state:', updatePlayerNameError.message);
        console.log("Lobby - Updated player name in existing game state.");
      }

      // Update player_names in the room if this player's name isn't already there
      let updatedPlayerNames = roomData.player_names || [];
      console.log("Lobby - Current player names in room before update:", updatedPlayerNames);
      if (!updatedPlayerNames.includes(playerName)) {
        updatedPlayerNames = [...updatedPlayerNames, playerName];
        const { error: updateRoomError } = await supabase
          .from('rooms')
          .update({ player_names: updatedPlayerNames })
          .eq('id', roomData.id);
        if (updateRoomError) console.error('Lobby - Error updating room player names:', updateRoomError.message);
        console.log("Lobby - Updated room player names to:", updatedPlayerNames);
      }

      showSuccess(`Joined room "${roomCodeInput.toUpperCase()}"!`);
      navigate(`/game/${roomData.id}`);
    } catch (error: any) {
      console.error('Lobby - Error joining room:', error.message);
      showError(`Failed to join room: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const isSessionReady = !isLoading && user; // True when session is loaded and a user (even anonymous) is present

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-lime-50 to-emerald-100 p-4">
      <div className="text-center bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border-4 border-lime-400 transform hover:scale-102 transition-transform duration-300 ease-in-out mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 drop-shadow-lg">
          CaipiQuest Lobby
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-prose mx-auto">
          Enter your name, then create a new game room or join an existing one with a code!
        </p>

        <div className="mb-6 w-full max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="text-center border-lime-400 focus:border-lime-600 focus:ring-lime-600 text-lg py-2"
            disabled={isCreating || isJoining || !isSessionReady}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          <Card className="w-full max-w-sm bg-lime-50 border-lime-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lime-800">Create New Room</CardTitle>
              <CardDescription className="text-lime-700">Start a fresh game for your friends.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating || isJoining || !playerName.trim() || !isSessionReady}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-sm bg-emerald-50 border-emerald-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-emerald-800">Join Existing Room</CardTitle>
              <CardDescription className="text-emerald-700">Enter a room code to join a game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter Room Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="text-center border-emerald-400 focus:border-emerald-600 focus:ring-emerald-600"
                disabled={isCreating || isJoining || !isSessionReady}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={isJoining || isCreating || roomCodeInput.trim() === '' || !playerName.trim() || !isSessionReady}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Lobby;