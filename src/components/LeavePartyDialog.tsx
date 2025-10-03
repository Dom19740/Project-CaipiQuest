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
        <Button variant="destructive" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md shadow-lg text-sm transition-all duration-300 ease-in-out transform hover:scale-105">
          Leave
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="mx-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border-4 border-lime-400 p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-800 drop-shadow-lg mb-2">
            Are you sure you want to leave?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700 text-base">
            This action will take you back to the lobby. Your game state in this party will be saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">Leave Party</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeavePartyDialog;