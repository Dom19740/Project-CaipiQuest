import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NewPlayerAlertProps {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const NewPlayerAlert: React.FC<NewPlayerAlertProps> = ({ playerName, isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[calc(100%-2rem)]"> {/* Changed mx-4 to w-[calc(100%-2rem)] */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Player Joined!</AlertDialogTitle>
          <AlertDialogDescription>
            {playerName} has entered the room!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewPlayerAlert;