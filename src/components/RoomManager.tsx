import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';

interface RoomManagerProps {
  onRoomJoined: (roomId: string, playerName: string) => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ onRoomJoined }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      showError('Please enter your name.');
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, this would interact with Supabase to create a room
      // For now, we'll simulate a room creation
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      showSuccess(`Room "${newRoomId}" created!`);
      onRoomJoined(newRoomId, playerName);
    } catch (error) {
      console.error('Error creating room:', error);
      showError('Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      showError('Please enter your name.');
      return;
    }
    if (!roomCode.trim()) {
      showError('Please enter a room code.');
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, this would interact with Supabase to validate and join a room
      // For now, we'll simulate joining
      showSuccess(`Joined room "${roomCode}"!`);
      onRoomJoined(roomCode, playerName);
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Failed to join room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-lg border-lime-300 border-2">
      <CardHeader className="bg-lime-100 border-b border-lime-300">
        <CardTitle className="text-lime-800 text-2xl">Join or Create a Game</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your name to start a new game or join an existing one.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <Input
            id="playerName"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isLoading}
            className="bg-white border-lime-200 focus:border-lime-500"
          />
        </div>
        <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full bg-lime-500 hover:bg-lime-600 text-white font-bold">
          {isLoading ? 'Creating...' : 'Create New Room'}
        </Button>
        <div className="relative flex items-center justify-center text-xs">
          <span className="absolute px-3 bg-white text-gray-500">OR</span>
          <div className="w-full border-t border-gray-300" />
        </div>
        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">Room Code</label>
          <Input
            id="roomCode"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            disabled={isLoading}
            className="bg-white border-lime-200 focus:border-lime-500"
          />
        </div>
        <Button onClick={handleJoinRoom} disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
          {isLoading ? 'Joining...' : 'Join Room'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoomManager;