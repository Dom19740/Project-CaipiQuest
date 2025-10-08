import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  partyCode,
  playerScores,
  alerts,
  currentUserId,
  onRefreshPlayers,
  onLeaveParty,
  myPlayerName,
}) => {
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
          url: window.location.href,
        });
        toast.success("Party shared successfully!");
      } catch (error) {
        toast.error("Failed to share party.");
      }
    } else {
      handleCopyPartyCode(); // Fallback to copy if share API not available
    }
  };

  const getAlertClasses = (type: 'rowCol' | 'diagonal' | 'fullGrid') => {
    switch (type) {
      case 'rowCol':
        return 'text-green-800 dark:text-green-200 bg-green-300 dark:bg-green-800 border-green-500 dark:border-green-700';
      case 'diagonal':
        return 'text-blue-800 dark:text-blue-200 bg-blue-300 dark:bg-blue-800 border-blue-500 dark:border-blue-700';
      case 'fullGrid':
        return 'text-white bg-gradient-to-r from-purple-800 to-pink-900 border-purple-900 text-3xl p-4 animate-pulse';
      default:
        return 'text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border-gray-500 dark:border-gray-600';
    }
  };

  return (
    <Card className="w-full flex-1 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-850 shadow-lg border-orange-300 dark:border-orange-600 border-2 rounded-xl text-card-foreground p-4">
      <CardHeader className="bg-orange-100/80 dark:bg-orange-700/80 border-b border-orange-200 dark:border-orange-600 rounded-t-xl p-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between mb-2 font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefreshPlayers}
            className="text-orange-700 dark:text-orange-200 hover:bg-orange-200/50 dark:hover:bg-orange-600/50"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </CardTitle>
        {myPlayerName && (
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Playing as: <span className="font-medium">{myPlayerName}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-orange-100 dark:bg-orange-700 p-3 rounded-lg border border-orange-200 dark:border-orange-600">
            <span className="font-mono text-lg font-bold text-orange-900 dark:text-orange-100">
              {partyCode}
            </span>
            <div className="flex space-x-2">
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
          </div>
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
          <Button
            onClick={onLeaveParty}
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Leave Party
          </Button>
        </div>

        {/* Bingo Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Bingo Alerts
            </h3>
            <div className="max-h-32 overflow-y-auto pr-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`font-medium p-2 rounded-md border shadow-sm text-sm sm:text-base ${getAlertClasses(alert.type)} mb-1`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartySidebar;