import React, { useState } from 'react';
import { Settings, Maximize2, Minimize2, Crosshair, Menu, X } from 'lucide-react';

interface ControlButtonsProps {
  isWideView: boolean;
  onToggleWideView: () => void;
  onOpenSettings: () => void;
  onFocusCurrent: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isWideView,
  onToggleWideView,
  onOpenSettings,
  onFocusCurrent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative w-10">
      {/* Expanded Buttons - Appear Above Toggle */}
      {isExpanded && (
        <div className="absolute bottom-12 left-0 w-10 flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
          {/* Focus Button */}
          <button 
            onClick={() => {
              onFocusCurrent();
              setIsExpanded(false);
            }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 w-10 h-10 rounded-xl shadow-lg border border-blue-200/50 text-blue-600 active:scale-95 transition-all flex items-center justify-center"
            title="現在地へ"
          >
            <Crosshair size={18} />
          </button>

          {/* Wide/Follow Toggle */}
          <button 
            onClick={() => {
              onToggleWideView();
              setIsExpanded(false);
            }}
            className={`w-10 h-10 rounded-xl shadow-lg border transition-all active:scale-95 flex items-center justify-center ${
              isWideView 
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 border-gray-200/50' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-blue-600/50'
            }`}
            title={isWideView ? '追従モード' : '広域モード'}
          >
            {isWideView ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          {/* Settings Button */}
          <button 
            onClick={() => {
              onOpenSettings();
              setIsExpanded(false);
            }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 w-10 h-10 rounded-xl shadow-lg border border-gray-200/50 text-gray-700 active:scale-95 transition-all flex items-center justify-center"
            title="設定"
          >
            <Settings size={18} />
          </button>
        </div>
      )}

      {/* Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-10 h-10 rounded-xl shadow-lg border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
          isExpanded 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-blue-600/50'
            : 'bg-white/95 backdrop-blur-xl text-gray-700 border-white/50'
        }`}
      >
        {isExpanded ? <X size={18} /> : <Menu size={18} />}
      </button>
    </div>
  );
};

export default ControlButtons;
