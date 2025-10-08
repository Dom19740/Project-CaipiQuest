import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Share2, PlusCircle, Users, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartySidebarProps {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  players: { id: string; name: string }[];
  setPlayers: (players: { id: string; name: string }[]) => void;
  onRoomCreated: (roomId: string, roomCode: string) => void;
  onRoomJoined: (roomId: string, roomCode: string) => void;
  onLeaveRoom: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  bingoAlerts: { message: string; timestamp: string }[];
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  setRoomId,
  roomCode,
  setRoomCode,
  players,
  setPlayers,
  onRoomCreated,
  onRoomJoined,
  onLeaveRoom,
  playerName,
  setPlayerName,
  gridSize,
  setGridSize,
  bingoAlerts,
}) => {
  const [newRoomCode, setNewRoomCode] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isPlayerNameDialogOpen, setIsPlayerNameDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPlayerName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();
        if (data?.first_name) {
          setPlayerName(data.first_name);
        } else {
          setIsPlayerNameDialogOpen(true);
        }
      } else {
        setIsPlayerNameDialogOpen(true);
      }
    };
    fetchPlayerName();
  }, [setPlayerName]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    const code = generateRoomCode();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to create a room.");
      setIsCreatingRoom(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert({ code, created_by: user.id, created_by_name: playerName, grid_size: gridSize })
        .select()
        .single();

      if (error) throw error;

      onRoomCreated(data.id, data.code);
      toast.success(`Room "${data.code}" created successfully!`);
    } catch (error: any) {
      toast.error(`Error creating room: ${error.message}`);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    setIsJoiningRoom(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to join a room.");
      setIsJoiningRoom(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, code, grid_size")
        .eq("code", newRoomCode.toUpperCase())
        .single();

      if (error) throw error;

      onRoomJoined(data.id, data.code);
      setGridSize(data.grid_size);
      toast.success(`Joined room "${data.code}"!`);
    } catch (error: any) {
      toast.error(`Error joining room: ${error.message}`);
    } finally {
      setIsJoiningRoom(false);
    }
  };

  const handleUpdatePlayerName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && playerName) {
      const { error } = await supabase
        .from("profiles")
        .update({ first_name: playerName })
        .eq("id", user.id);
      if (error) {
        toast.error(`Error updating player name: ${error.message}`);
      } else {
        toast.success("Player name updated!");
        setIsPlayerNameDialogOpen(false);
      }
    }
  };

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success("Room code copied to clipboard!");
    }
  };

  const handleShareRoom = async () => {
    if (roomCode && navigator.share) {
      try {
        await navigator.share({
          title: "Join my CaipiQuest Bingo Room!",
          text: `Use code: ${roomCode}`,
          url: window.location.href,
        });
        toast.success("Room shared successfully!");
      } catch (error) {
        toast.error("Failed to share room.");
      }
    } else {
      handleCopyRoomCode(); // Fallback to copy if share API not available
    }
  };

  const handleRefreshPlayers = async () => {
    if (roomId) {
      const { data, error } = await supabase
        .from("game_states")
        .select("player_id, player_name")
        .eq("room_id", roomId);

      if (error) {
        toast.error(`Error fetching players: ${error.message}`);
        return;
      }

      const uniquePlayers = Array.from(new Map(data.map(p => [p.player_id, p])).values());
      setPlayers(uniquePlayers.map(p => ({ id: p.player_id, name: p.player_name || "Unknown Player" })));
      toast.success("Player list refreshed!");
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between mb-2 font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          {roomId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshPlayers}
              className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          )}
        </CardTitle>
        {playerName && (
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Playing as: <span className="font-medium">{playerName}</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsPlayerNameDialogOpen(true)}
              className="ml-2 p-0 h-auto text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100"
            >
              (Change)
            </Button>
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {!roomId ? (
          <div className="space-y-4">
            <Button
              onClick={handleCreateRoom}
              disabled={isCreatingRoom || !playerName}
              className="w-full bg-caipi hover:bg-caipi-hover text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {isCreatingRoom ? "Creating..." : "Create New Room"}
            </Button>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter Room Code"
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg border border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-gray-700 text-orange-900 dark:text-orange-100 placeholder:text-orange-500 dark:placeholder:text-orange-300 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={isJoiningRoom || !newRoomCode || !playerName}
                className="absolute right-0 top-0 h-full px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-r-lg"
              >
                Join
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-orange-100 dark:bg-orange-700 p-3 rounded-lg border border-orange-200 dark:border-orange-600">
              <span className="font-mono text-lg font-bold text-orange-900 dark:text-orange-100">
                {roomCode}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyRoomCode}
                  className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShareRoom}
                  className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-2">
                Players ({players.length})
              </h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {players.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center bg-orange-50 dark:bg-gray-700 p-2 rounded-md text-orange-800 dark:text-orange-200"
                  >
                    <Users className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                    {player.name} {player.id === supabase.auth.getUser().then(u => u.data.user?.id) ? "(You)" : ""}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={onLeaveRoom}
              variant="destructive"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Leave Room
            </Button>
          </div>
        )}

        {/* Bingo Alerts */}
        {bingoAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Bingo Alerts
            </h3>
            <div className="max-h-32 overflow-y-auto pr-2">
              {bingoAlerts.map((alert, index) => (
                <div key={index} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md text-yellow-900 dark:text-yellow-100 text-sm mb-1">
                  <span className="font-medium">{alert.message}</span>
                  <span className="text-xs text-yellow-700 dark:text-yellow-300 ml-2">
                    ({new Date(alert.timestamp).toLocaleTimeString()})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Player Name Dialog */}
      <Dialog open={isPlayerNameDialogOpen} onOpenChange={setIsPlayerNameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-700 dark:text-orange-300">Set Your Player Name</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Please enter a name to be displayed in the party.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="playerName" className="text-right text-orange-800 dark:text-orange-200">
                Name
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="col-span-3 p-2 rounded-md border border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-gray-700 text-orange-900 dark:text-orange-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdatePlayerName}
              disabled={!playerName}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PartySidebar;