import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, RefreshCw, LogOut, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface PartySidebarProps {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  roomCode: string | null;
  setRoomCode: (code: string | null) => void;
  onLeaveParty: () => void;
  onRefreshParty: () => void;
  players: { id: string; name: string }[];
  createdBy: string | null;
  createdByName: string | null;
}

const PartySidebar: React.FC<PartySidebarProps> = ({
  roomId,
  setRoomId,
  roomCode,
  setRoomCode,
  onLeaveParty,
  onRefreshParty,
  players,
  createdBy,
  createdByName,
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopyCode = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showSuccess('Party code copied!');
    }
  }, [roomCode]);

  const handleLeaveParty = useCallback(async () => {
    setShowLeaveConfirm(false);
    if (roomId && user) {
      try {
        // Remove player from the room's player list (if implemented)
        // For now, just clear local state and navigate
        setRoomId(null);
        setRoomCode(null);
        onLeaveParty();
        navigate('/lobby');
        showSuccess('You have left the party.');
      } catch (error) {
        console.error('Error leaving party:', error);
        showError('Failed to leave party.');
      }
    }
  }, [roomId, user, setRoomId, setRoomCode, onLeaveParty, navigate]);

  const handleDeleteParty = useCallback(async () => {
    setShowDeleteConfirm(false);
    if (roomId && user && createdBy === user.id) {
      try {
        const { error } = await supabase.from('rooms').delete().eq('id', roomId);
        if (error) throw error;

        setRoomId(null);
        setRoomCode(null);
        onLeaveParty();
        navigate('/lobby');
        showSuccess('Party deleted successfully.');
      } catch (error) {
        console.error('Error deleting party:', error);
        showError('Failed to delete party.');
      }
    }
  }, [roomId, user, createdBy, setRoomId, setRoomCode, onLeaveParty, navigate]);

  const isCreator = user && createdBy === user.id;

  return (
    <Card className="w-full max-w-xs bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-orange-600 dark:border-orange-700 text-card-foreground flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl text-orange-900 dark:text-orange-100 flex items-center justify-between font-semibold">
          <span className="flex items-center">
            <Users className="mr-2 h-6 w-6" /> Party Code
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefreshParty}
              className="text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
              title="Refresh Party Info"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLeaveConfirm(true)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              title="Leave Party"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
          {createdByName ? `Created by: ${createdByName}` : 'Loading creator...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-2">
        {roomCode && (
          <div className="mb-4">
            <Label htmlFor="party-code" className="sr-only">
              Party Code
            </Label>
            <div className="flex space-x-2">
              <Input
                id="party-code"
                type="text"
                value={roomCode}
                readOnly
                className="flex-grow bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={handleCopyCode}
                variant="secondary"
                className="bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-700 dark:hover:bg-orange-800"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">{isCopied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">Players ({players.length})</h3>
        <ul className="space-y-1 text-gray-800 dark:text-gray-200">
          {players.map((player) => (
            <li key={player.id} className="flex items-center">
              <span className="truncate">{player.name}</span>
              {player.id === createdBy && (
                <span className="ml-2 text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full">
                  Host
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4 flex flex-col space-y-2">
        {isCreator && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            <XCircle className="mr-2 h-4 w-4" /> Delete Party
          </Button>
        )}
      </CardFooter>

      {/* Leave Party Confirmation Dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Leave Party</DialogTitle>
            <DialogDescription>Are you sure you want to leave this party?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveParty}>
              Leave Party
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Party Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Party</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this party? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteParty}>
              Delete Party
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PartySidebar;