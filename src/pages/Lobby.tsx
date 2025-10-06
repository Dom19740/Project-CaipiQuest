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
  const [partyCodeInput, setPartyCodeInput] = useState('');
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

  const generatePartyCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateParty = async () => {
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to create a party.');
      return;
    }

    setIsCreating(true);
    const newPartyCode = generatePartyCode();
    const fixedGridSize = 5;
    try {
      const { data: partyData, error: partyError } = await supabase
        .from('rooms')
        .insert({ code: newPartyCode, created_by: user.id, created_by_name: playerName, grid_size: fixedGridSize })
        .select()
        .single();

      if (partyError) throw partyError;
      console.log("Lobby - Party created:", partyData);

      showSuccess(`Party "${newPartyCode}" created!`);
      navigate(`/select-fruits`, { state: { roomId: partyData.id, gridSize: fixedGridSize } });
    } catch (error: any) {
      console.error('Lobby - Error creating party:', error.message);
      showError(`Failed to create party: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinParty = async () => {
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to join a party.');
      return;
    }

    setIsJoining(true);
    try {
      const { data: partyData, error: partyError } = await supabase
        .from('rooms')
        .select('id, grid_size')
        .eq('code', partyCodeInput.toUpperCase())
        .single();

      if (partyError) {
        if (partyError.code === 'PGRST116') {
          throw new Error('Party not found. Please check the code.');
        }
        throw partyError;
      }
      console.log("Lobby - Found party:", partyData);

      const { data: existingGameState, error: gameStateError } = await supabase
        .from('game_states')
        .select('selected_fruits')
        .eq('room_id', partyData.id)
        .eq('player_id', user.id)
        .single();

      if (gameStateError && gameStateError.code !== 'PGRST116') {
        throw gameStateError;
      }

      const hasExistingFruits = existingGameState?.selected_fruits && existingGameState.selected_fruits.length === partyData.grid_size;

      showSuccess(`Found party "${partyCodeInput.toUpperCase()}"!`);

      if (hasExistingFruits) {
        console.log("Lobby - Player has existing game state, navigating directly to game room.");
        navigate(`/game/${partyData.id}`, { state: { selectedFruits: existingGameState.selected_fruits, gridSize: partyData.grid_size } });
      } else {
        console.log("Lobby - Player does not have existing game state, navigating to fruit selection.");
        navigate(`/select-fruits`, { state: { roomId: partyData.id, gridSize: partyData.grid_size } });
      }

    } catch (error: any) {
      console.error('Lobby - Error joining party:', error.message);
      showError(`Failed to join party: ${error.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  const isSessionReady = !isLoading && user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 p-4 sm:p-6 md:p-8">
      <div className="text-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-8 sm:p-10 md:p-12 rounded-3xl shadow-2xl border-4 border-lime-400 dark:border-lime-700 transform hover:scale-102 transition-transform duration-300 ease-in-out mb-8 max-w-3xl w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 drop-shadow-lg">
          CaipiQuest Lobby
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-prose mx-auto leading-relaxed">
          Enter your name, then create a new game party or join an existing one with a code!
        </p>

        <div className="mb-6 w-full max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="text-center border-lime-400 focus:border-lime-600 focus:ring-lime-600 text-lg py-2 h-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            disabled={isCreating || isJoining || !isSessionReady}
            aria-label="Your Player Name"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-stretch">
          <Card className="w-full max-w-md bg-emerald-50/80 dark:bg-emerald-900/80 border-emerald-300 dark:border-emerald-700 shadow-lg text-card-foreground p-6 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl text-emerald-800 dark:text-emerald-200">Join Existing Party</CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-300 text-base sm:text-lg">Enter a party code to join a game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input
                type="text"
                placeholder="Enter Party Code"
                value={partyCodeInput}
                onChange={(e) => setPartyCodeInput(e.target.value)}
                className="text-center border-emerald-400 focus:border-emerald-600 focus:ring-emerald-600 h-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                disabled={isCreating || isJoining || partyCodeInput.trim() === '' || !playerName.trim() || !isSessionReady}
                aria-label="Party Code"
              />
              <Button
                onClick={handleJoinParty}
                disabled={isJoining || isCreating || partyCodeInput.trim() === '' || !playerName.trim() || !isSessionReady}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-md shadow-md transition-all duration-300 text-base sm:text-lg h-12"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md bg-lime-50/80 dark:bg-lime-900/80 border-lime-300 dark:border-lime-700 shadow-lg text-card-foreground p-6 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl text-lime-800 dark:text-lime-200">Create New Party</CardTitle>
              <CardDescription className="text-lime-700 dark:text-lime-300 text-base sm:text-lg">Start a fresh game for your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Button
                onClick={handleCreateParty}
                disabled={isCreating || isJoining || !playerName.trim() || !isSessionReady}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-4 rounded-md shadow-md transition-all duration-300 text-base sm:text-lg h-12"
              >
                {isCreating ? 'Creating...' : 'Create'}
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