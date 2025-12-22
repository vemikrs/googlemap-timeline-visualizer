import React, { useState } from 'react';
import { Play, Pause, Gauge, ArrowLeft } from 'lucide-react';
import type { Point } from '../types';

interface TimelineControlsProps {
  points: Point[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedYear: string | 'all';
  onPlayPause: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
  onBackToUpload: () => void;
}

const TimelineControls: React.FC<TimelineControlsProps> = ({
  points,
  currentIndex,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onBackToUpload,
}) => {
  const [showSpeedPanel, setShowSpeedPanel] = useState(false);
  const isAtEnd = currentIndex >= points.length - 1;

  return (
    <div className="space-y-1.5">
      {/* Seek Slider */}
      <div className="px-1">
        <input 
          type="range" 
          min="0" 
          max={points.length - 1} 
          value={currentIndex} 
          onChange={(e) => onSeek(parseInt(e.target.value))} 
          className="w-full h-2.5 bg-gray-100 rounded-full appearance-none accent-blue-500 shadow-inner" 
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-1.5 px-1">
        <button 
          onClick={onBackToUpload}
          className="min-w-10 min-h-10 w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-400 hover:from-gray-600 hover:to-gray-500 flex items-center justify-center text-white border-2 border-white/30 shadow-lg active:scale-95 transition-all"
          title="ファイル選択に戻る"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>
        
        <button 
          onClick={() => {
            if (isAtEnd && !isPlaying) {
              // 最後まで再生された状態でPLAYボタンを押した場合、最初から再開
              onSeek(0);
              setTimeout(() => onPlayPause(), 50);
            } else {
              onPlayPause();
            }
          }} 
          className={`flex-1 rounded-xl text-white flex items-center justify-center shadow-xl active:scale-[0.97] transition-all ${
            isAtEnd && !isPlaying
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 min-h-10 h-11 gap-2'
              : isPlaying 
                ? 'bg-blue-500 hover:bg-blue-600 min-h-10 h-10 gap-2' 
                : 'bg-blue-500 hover:bg-blue-600 min-h-10 h-11 gap-2'
          }`}
        >
          {isPlaying ? <Pause fill="white" size={18} /> : <Play fill="white" size={22} />}
          <span className="font-black text-sm">{isPlaying ? 'PAUSE' : isAtEnd ? 'REPLAY' : 'PLAY'}</span>
        </button>
        
        <button 
          onClick={() => setShowSpeedPanel(!showSpeedPanel)}
          className="min-w-11 min-h-10 w-11 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 flex flex-col items-center justify-center text-white shadow-lg active:scale-95 transition-all border-2 border-white/30"
        >
          <Gauge size={14} strokeWidth={2.5} />
          <span className="text-[9px] font-black">×{playbackSpeed}</span>
        </button>
      </div>

      {/* Speed Panel (Slide-out) */}
      {showSpeedPanel && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-2.5 border border-indigo-200/50 shadow-inner animate-slideDown">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Speed</span>
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
          <div className="flex justify-between mt-1 text-[9px] text-gray-500 font-mono">
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
