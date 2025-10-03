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
  const [partyCodeInput, setPartyCodeInput] = useState(''); // Changed from roomCodeInput
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

  const generatePartyCode = () => { // Changed from generateRoomCode
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateParty = async () => { // Changed from handleCreateRoom
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to create a party.'); // Changed from room
      return;
    }

    setIsCreating(true);
    const newPartyCode = generatePartyCode(); // Changed from newRoomCode
    const fixedGridSize = 5; // Hardcode grid size to 5
    try {
      // Create the room (party) with the fixed grid size
      const { data: partyData, error: partyError } = await supabase // Changed from roomData, roomError
        .from('rooms')
        .insert({ code: newPartyCode, created_by: user.id, created_by_name: playerName, grid_size: fixedGridSize })
        .select()
        .single();

      if (partyError) throw partyError; // Changed from roomError
      console.log("Lobby - Party created:", partyData); // Changed from Room created

      showSuccess(`Party "${newPartyCode}" created!`); // Changed from Room created
      navigate(`/select-fruits`, { state: { roomId: partyData.id, gridSize: fixedGridSize } }); // Still uses roomId for URL param
    } catch (error: any) {
      console.error('Lobby - Error creating party:', error.message); // Changed from room
      showError(`Failed to create party: ${error.message}`); // Changed from room
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinParty = async () => { // Changed from handleJoinRoom
    if (!user || !user.id) {
      showError('A session could not be established. Please refresh and try again.');
      return;
    }
    if (!playerName.trim()) {
      showError('Please enter your name to join a party.'); // Changed from room
      return;
    }

    setIsJoining(true);
    try {
      // Find the room (party) by code and fetch its grid_size
      const { data: partyData, error: partyError } = await supabase // Changed from roomData, roomError
        .from('rooms')
        .select('id, grid_size')
        .eq('code', partyCodeInput.toUpperCase()) // Changed from roomCodeInput
        .single();

      if (partyError) { // Changed from roomError
        if (partyError.code === 'PGRST116') { // No rows found
          throw new Error('Party not found. Please check the code.'); // Changed from Room not found
        }
        throw partyError; // Changed from roomError
      }
      console.log("Lobby - Found party:", partyData); // Changed from Found room

      showSuccess(`Found party "${partyCodeInput.toUpperCase()}"!`); // Changed from Found room
      navigate(`/select-fruits`, { state: { roomId: partyData.id, gridSize: partyData.grid_size } }); // Still uses roomId for URL param
    } catch (error: any) {
      console.error('Lobby - Error joining party:', error.message); // Changed from room
      showError(`Failed to join party: ${error.message}`); // Changed from room
    } finally {
      setIsJoining(false);
    }
  };

  const isSessionReady = !isLoading && user; // True when session is loaded and a user (even anonymous) is present

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 via-yellow-200 via-orange-300 to-pink-400 p-4">
      <div className="text-center bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border-4 border-lime-400 transform hover:scale-102 transition-transform duration-300 ease-in-out mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 mb-6 drop-shadow-lg">
          CaipiQuest Lobby
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-prose mx-auto">
          Enter your name, then create a new game party or join an existing one with a code!
        </p>

        <div className="mb-6 w-full max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="text-center border-lime-400 focus:border-lime-600 focus:ring-lime-600 text-lg py-2"
            disabled={isCreating || isJoining || !isSessionReady}
            aria-label="Your Player Name"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center">
          <Card className="w-full max-w-sm bg-emerald-50 border-emerald-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-800">Join Existing Party</CardTitle> {/* Changed from Room */}
              <CardDescription className="text-emerald-700">Enter a party code to join a game.</CardDescription> {/* Changed from room */}
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter Party Code" // Changed from Room Code
                value={partyCodeInput} // Changed from roomCodeInput
                onChange={(e) => setPartyCodeInput(e.target.value)} // Changed from setRoomCodeInput
                className="text-center border-emerald-400 focus:border-emerald-600 focus:ring-emerald-600"
                disabled={isCreating || isJoining || !playerName.trim() || !isSessionReady} // Removed `partyCodeInput.trim() === ''`
                aria-label="Party Code"
              />
              <Button
                onClick={handleJoinParty} // Changed from handleJoinRoom
                disabled={isJoining || isCreating || partyCodeInput.trim() === '' || !playerName.trim() || !isSessionReady} // Changed from roomCodeInput
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
              >
                {isJoining ? 'Joining...' : 'Join Party'} {/* Changed from Room */}
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full max-w-md bg-lime-50 border-lime-300 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-lime-800">Create New Party</CardTitle> {/* Changed from Room */}
              <CardDescription className="text-lime-700">Start a fresh game for your friends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateParty} // Changed from handleCreateRoom
                disabled={isCreating || isJoining || !playerName.trim() || !isSessionReady}
                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition-all duration-300"
              >
                {isCreating ? 'Creating...' : 'Create Party'} {/* Changed from Room */}
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