import React from 'react';
import { Video } from 'lucide-react';

interface RecordButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative min-w-11 min-h-11 w-11 h-11 rounded-xl 
        flex items-center justify-center
        shadow-lg active:scale-95 transition-all
        ${disabled 
          ? 'bg-gray-300 cursor-not-allowed' 
          : 'bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
        }
      `}
      title="録画"
    >
      {/* Recording dot indicator */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80" />
      <Video size={18} className="text-white" strokeWidth={2.5} />
    </button>
  );
};

export default RecordButton;
