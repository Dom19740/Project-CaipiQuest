import React, { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Share2, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

// Define interfaces to match use-game-room-realtime.ts
interface BingoAlert {
  id: string;
  type: 'rowCol' | 'diagonal' | 'fullGrid';
  message: string;
  playerName?: string;
  playerId?: string;
  canonicalId?: string;
}

interface PlayerScore {
  id: string;
  name: string;
  caipisCount: number;
  isMe: boolean;
}

interface PartySidebarProps {
  partyCode: string;
  playerScores: PlayerScore[];
  alerts: BingoAlert[];
  currentUserId: string;
  onRefreshPlayers: () => void;
  onLeaveParty: () => void;
  myPlayerName: string;
  setMyPlayerName: React.Dispatch<React.SetStateAction<string>>;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  partyCode,
  playerScores,
  alerts,
  currentUserId,
  onRefreshPlayers,
  onLeaveParty,
  myPlayerName,
  setMyPlayerName,
}) => {
  const [isPlayerNameDialogOpen, setIsPlayerNameDialogOpen] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState(myPlayerName);

  useEffect(() => {
    setTempPlayerName(myPlayerName);
  }, [myPlayerName]);

  const handleUpdatePlayerName = async () => {
    if (!currentUserId || !tempPlayerName.trim()) {
      toast.error("Player name cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase
        .from("game_states")
        .update({ player_name: tempPlayerName.trim(), updated_at: new Date().toISOString() })
        .eq("player_id", currentUserId);

      if (error) throw error;

      setMyPlayerName(tempPlayerName.trim());
      toast.success("Player name updated!");
      setIsPlayerNameDialogOpen(false);
      onRefreshPlayers();
    } catch (error: any) {
      console.error("Error updating player name:", error.message);
      toast.error(`Failed to update player name: ${error.message}`);
    }
  };

  const handleCopyPartyCode = () => {
    if (partyCode) {
      navigator.clipboard.writeText(partyCode);
      toast.success("Party code copied to clipboard!");
    }
  };

  const handleShareParty = async () => {
    if (partyCode && navigator.share) {
      try {
        await navigator.share({
          title: "Join my CaipiQuest Bingo Party!",
          text: `Use code: ${partyCode}`,
          url: window.location.href, // Share the current URL
        });
        toast.success("Party shared successfully!");
      } catch (error) {
        console.error("Failed to share party:", error);
        toast.error("Failed to share party.");
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      handleCopyPartyCode();
      toast.info("Sharing not supported, party code copied instead!");
    }
  };

  const getAlertClasses = (alert: BingoAlert, userId: string) => {
    const isMyAlert = alert.playerId === userId;

    if (alert.type === 'fullGrid') {
      return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-3xl p-4 animate-pulse';
    }

    if (isMyAlert) {
      return 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700';
    } else {
      return 'text-green-800 dark:text-green-200 bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700';
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-lg font-bold text-orange-900 dark:text-orange-100">
              {partyCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyPartyCode}
              className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
            >
              <Copy className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareParty}
              className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center justify-between">
              <span>Bingo Alerts</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshPlayers}
                className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </h3>
            <div className="max-h-32 overflow-y-auto pr-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm sm:text-base ${getAlertClasses(alert, currentUserId)} mb-1`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Players ({playerScores.length})
            </h3>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {playerScores.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center bg-orange-50 dark:bg-gray-700 p-2 rounded-md text-orange-800 dark:text-orange-200"
                >
                  <Users className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                  {player.name} {player.isMe ? "(You)" : ""}
                  <span className="ml-auto text-sm font-bold">{player.caipisCount} Caipis</span>
                </li>
              ))}
            </ul>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                Leave Party
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[calc(100%-2rem)] bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-lime-600 dark:border-lime-700 p-6 text-card-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-lime-800 to-emerald-900 drop-shadow-lg mb-2">
                  Are you sure you want to leave?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                  Save the room code to re-enter.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="h-12 text-base sm:text-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onLeaveParty} className="bg-red-800 hover:bg-red-900 text-white h-12 text-base sm:text-lg">Leave Party</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </CardContent>

      {/* Player Name Dialog (kept for potential future use or if user wants to re-add player name change) */}
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
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                className="col-span-3 p-2 rounded-md border border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-gray-700 text-orange-900 dark:text-orange-100 focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdatePlayerName}
              disabled={!tempPlayerName.trim()}
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