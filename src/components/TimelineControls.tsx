import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import type { Point } from '../types';

interface TimelineControlsProps {
  points: Point[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedYear: string | 'all';
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  points,
  currentIndex,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onReset,
  onSeek,
  onSpeedChange,
}) => {
  const [showSpeedPanel, setShowSpeedPanel] = useState(false);

  return (
    <div className="space-y-2">
      {/* Seek Slider */}
      <div className="px-1">
        <input 
          type="range" 
          min="0" 
          max={points.length - 1} 
          value={currentIndex} 
          onChange={(e) => onSeek(parseInt(e.target.value))} 
          className="w-full h-3 bg-gray-100 rounded-full appearance-none accent-blue-500 shadow-inner" 
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button 
          onClick={onReset} 
          className="min-w-12 min-h-12 w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 flex items-center justify-center text-white border-2 border-white/30 shadow-lg active:scale-95 transition-all"
        >
          <RotateCcw size={20} strokeWidth={2.5} />
        </button>
        
        <button 
          onClick={onPlayPause} 
          className={`flex-1 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl active:scale-[0.97] transition-all ${
            isPlaying 
              ? 'min-h-12 h-12 gap-2' 
              : 'min-h-12 h-14 gap-3'
          }`}
        >
          {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={28} />}
          <span className={`font-black ${
            isPlaying ? 'text-sm' : 'text-base'
          }`}>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>
        
        <button 
          onClick={() => setShowSpeedPanel(!showSpeedPanel)}
          className="min-w-12 min-h-12 w-14 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 flex flex-col items-center justify-center text-white shadow-lg active:scale-95 transition-all border-2 border-white/30"
        >
          <Gauge size={16} strokeWidth={2.5} />
          <span className="text-[10px] font-black">×{playbackSpeed}</span>
        </button>
      </div>

      {/* Speed Panel (Slide-out) */}
      {showSpeedPanel && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-3 border border-indigo-200/50 shadow-inner animate-slideDown">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Speed Control</span>
            <button 
              onClick={() => setShowSpeedPanel(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              ✕
            </button>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1" 
            value={playbackSpeed} 
            onChange={(e) => {
              onSpeedChange(parseInt(e.target.value));
            }} 
            className="w-full h-2 bg-white/70 rounded-full appearance-none accent-indigo-500 shadow-sm" 
          />
          <div className="flex justify-between mt-1.5 text-[9px] text-gray-500 font-mono">
            <span>×1</span>
            <span className="font-bold text-indigo-600">×{playbackSpeed}</span>
            <span>×50</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineControls;
