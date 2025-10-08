import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PartySidebarProps {
  partyCode: string;
  onLeaveParty: () => void;
}

const PartySidebar: React.FC<PartySidebarProps> = ({ partyCode, onLeaveParty }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(partyCode);
    toast.success('Party code copied to clipboard!');
  };

  return (
    <div className="fixed top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg flex flex-col items-end space-y-4 z-50">
      <div className="flex items-center space-x-2">
        <span className="font-mono text-lg font-bold text-orange-900 dark:text-orange-100">
          Share Code: {partyCode}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyCode}
          className="text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-700"
        >
          <Copy className="h-5 w-5" />
        </Button>
      </div>
      <Button
        onClick={onLeaveParty}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow-md transition-colors duration-200"
      >
        Leave Party
      </Button>
    </div>
  );
};

export default PartySidebar;