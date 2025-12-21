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
    <div className="flex gap-2 pointer-events-auto">
      <button 
        onClick={onToggleWideView}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl border transition-all ${
          isWideView 
            ? 'bg-blue-500 text-white border-blue-600' 
            : 'bg-white/95 text-gray-600 border-white/40'
        }`}
      >
        {isWideView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        <span className="text-xs font-black">{isWideView ? '追従' : '広域'}</span>
      </button>
      
      <button 
        onClick={onOpenSettings} 
        className="bg-white/95 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl border border-white/40 text-gray-600"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};

export default ControlButtons;
