import React from 'react';
import { Settings, Maximize2, Minimize2 } from 'lucide-react';

interface ControlButtonsProps {
  isWideView: boolean;
  onToggleWideView: () => void;
  onOpenSettings: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isWideView,
  onToggleWideView,
  onOpenSettings,
}) => {
  return (
    <>
      <button 
        onClick={onToggleWideView}
        className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-lg border transition-all ${
          isWideView 
            ? 'bg-blue-500 text-white border-blue-600' 
            : 'bg-white/95 text-gray-600 border-white/40'
        }`}
        title={isWideView ? '追従モード' : '広域モード'}
      >
        {isWideView ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      
      <button 
        onClick={onOpenSettings} 
        className="bg-white/95 backdrop-blur-xl w-10 h-10 rounded-lg shadow-lg border border-white/40 text-gray-600 flex items-center justify-center"
        title="設定"
      >
        <Settings size={16} />
      </button>
    </>
  );
};

export default ControlButtons;
