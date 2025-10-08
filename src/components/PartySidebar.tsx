import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Share2, Copy, Check, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

interface PartySidebarProps {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  setRoomCode: (code: string | null) => void;
  roomCode: string | null;
  createdByName: string | null;
  setCreatedByName: (name: string | null) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  onRoomCreatedOrJoined: (roomId: string, roomCode: string, createdByName: string, gridSize: number) => void;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  setRoomId,
  setRoomCode,
  roomCode,
  createdByName,
  setCreatedByName,
  gridSize,
  setGridSize,
  onRoomCreatedOrJoined,
}) => {
  const [newRoomCode, setNewRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata.full_name || user.email || 'Guest');
      }
    };
    fetchUserName();
  }, []);

  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("You must be logged in to create a room.");
        setIsLoading(false);
        return;
      }

      const code = generateRandomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert([
          {
            code: code,
            created_by: user.id,
            created_by_name: userName,
            grid_size: gridSize,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setRoomId(data.id);
      setRoomCode(data.code);
      setCreatedByName(data.created_by_name);
      onRoomCreatedOrJoined(data.id, data.code, data.created_by_name, data.grid_size);
      showSuccess(`Room "${data.code}" created successfully!`);
    } catch (error: any) {
      showError(`Error creating room: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', joinRoomCode.toUpperCase())
        .single();

      if (error) throw error;

      setRoomId(data.id);
      setRoomCode(data.code);
      setCreatedByName(data.created_by_name);
      setGridSize(data.grid_size);
      onRoomCreatedOrJoined(data.id, data.code, data.created_by_name, data.grid_size);
      showSuccess(`Joined room "${data.code}" successfully!`);
    } catch (error: any) {
      showError(`Error joining room: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showSuccess("Room code copied to clipboard!");
    }
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setRoomCode(null);
    setCreatedByName(null);
    showSuccess("You have left the room.");
  };

  return (
    <Card className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-4 border-orange-600 dark:border-orange-700 text-card-foreground">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Share Code
          </span>
          <div className="flex items-center space-x-2">
            {roomId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCode}
                className="text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
                aria-label="Copy room code"
              >
                {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
            )}
            {roomId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLeaveRoom}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                aria-label="Leave room"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-gray-900 dark:text-gray-100 mt-2">
          {roomId ? `Room: ${roomCode} (Created by ${createdByName})` : "Create or join a party to play!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!roomId ? (
          <>
            <div className="space-y-4">
              <Label htmlFor="userName" className="text-lg text-gray-800 dark:text-gray-200">Your Name</Label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="gridSize" className="text-lg text-gray-800 dark:text-gray-200">Grid Size</Label>
              <Input
                id="gridSize"
                type="number"
                placeholder="e.g., 5"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                min="3"
                max="10"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              className="w-full bg-orange-700 hover:bg-orange-800 text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg h-14"
              disabled={isLoading || !userName || !gridSize}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Share2 className="mr-2 h-5 w-5" />}
              Create New Party
            </Button>
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="joinCode" className="text-lg text-gray-800 dark:text-gray-200">Join Party</Label>
              <Input
                id="joinCode"
                type="text"
                placeholder="Enter party code"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg h-14"
              disabled={isLoading || !joinRoomCode}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Join Party
            </Button>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-800 dark:text-gray-200">
              You are in room: <span className="font-bold text-orange-700 dark:text-orange-300">{roomCode}</span>
            </p>
            <p className="text-md text-gray-700 dark:text-gray-300">
              Created by: <span className="font-medium">{createdByName}</span>
            </p>
            <p className="text-md text-gray-700 dark:text-gray-300">
              Grid Size: <span className="font-medium">{gridSize}x{gridSize}</span>
            </p>
            <Link to="/fruit-selection" state={{ roomId, gridSize }}>
              <Button
                className="w-full bg-lime-600 hover:bg-lime-700 text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-lg h-14 mt-4"
              >
                Go to Fruit Selection
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;