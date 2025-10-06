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
      <AlertDialogContent className="w-[calc(100%-2rem)] bg-white/90 dark:bg-gray-900/90 text-card-foreground rounded-2xl shadow-2xl border-4 border-lime-500 dark:border-lime-700 p-6"> {/* Changed mx-4 to w-[calc(100%-2rem)] */}
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-700 to-emerald-900 drop-shadow-lg mb-2">Player Joined!</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-800 dark:text-gray-200 text-base sm:text-lg">
            {playerName} has entered the room!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className="h-12 text-base sm:text-lg bg-lime-600 hover:bg-lime-700 text-white">OK</AlertDialogAction> {/* Increased height and font size */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewPlayerAlert;