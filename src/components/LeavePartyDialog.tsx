import React from 'react';
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
import { Button } from '@/components/ui/button';

interface LeavePartyDialogProps {
  onConfirm: () => void;
}

const LeavePartyDialog: React.FC<LeavePartyDialogProps> = ({ onConfirm }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-3 rounded-md shadow-lg text-sm sm:text-base transition-all duration-300 ease-in-out transform hover:scale-105 h-12"> {/* Increased height and font size */}
          Leave
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-lime-400 dark:border-lime-700 p-6 text-card-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 drop-shadow-lg mb-2">
            Are you sure you want to leave?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
            This action will take you back to the lobby. Your game state in this party will be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="h-12 text-base sm:text-lg">Cancel</AlertDialogCancel> {/* Increased height and font size */}
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white h-12 text-base sm:text-lg">Leave Party</AlertDialogAction> {/* Increased height and font size */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeavePartyDialog;