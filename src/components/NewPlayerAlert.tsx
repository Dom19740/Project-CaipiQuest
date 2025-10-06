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
      <AlertDialogContent className="w-[calc(100%-2rem)] bg-white dark:bg-gray-800 text-card-foreground"> {/* Changed mx-4 to w-[calc(100%-2rem)] */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl">Player Joined!</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
            {playerName} has entered the room!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="h-12 text-base sm:text-lg">OK</AlertDialogAction> {/* Increased height and font size */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewPlayerAlert;