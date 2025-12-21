import React from 'react';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';
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
  selectedYear,
  onPlayPause,
  onReset,
  onSeek,
  onSpeedChange,
}) => {
  return (
    <div className="space-y-8">
      {/* Timestamp Display */}
      <div className="flex justify-between items-end px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-500 font-black">
            <Calendar size={12} />
            <p className="text-[10px] uppercase tracking-widest">
              {selectedYear === 'all' ? 'All Years' : `${selectedYear} Year`}
            </p>
          </div>
          <h4 className="text-2xl font-mono font-black text-gray-800 tracking-tighter">
            {points[currentIndex]?.ts 
              ? new Date(points[currentIndex].ts).toLocaleString('ja-JP', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) 
              : '--/--/-- --:--'}
          </h4>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-blue-500 font-mono">
            {currentIndex + 1} / {points.length}
          </p>
        </div>
      </div>

      {/* Seek Slider */}
      <div className="px-2">
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
      <div className="flex items-center justify-between gap-6 px-1">
        <button 
          onClick={onReset} 
          className="w-16 h-16 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          onClick={onPlayPause} 
          className="flex-1 h-18 rounded-[2.25rem] bg-blue-500 text-white flex items-center justify-center gap-4 shadow-2xl active:scale-[0.97] transition-all"
        >
          {isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} />}
          <span className="font-black text-xl">{isPlaying ? 'STOP' : 'PLAY'}</span>
        </button>
        
        <div className="flex flex-col items-center gap-1.5 min-w-[80px] bg-gray-50/80 p-3 rounded-3xl border border-gray-100">
          <span className="text-[9px] font-black uppercase text-blue-400">Speed</span>
          <span className="text-sm font-black font-mono text-gray-800">x{playbackSpeed}</span>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1" 
            value={playbackSpeed} 
            onChange={(e) => onSpeedChange(parseInt(e.target.value))} 
            className="w-14 h-1 bg-gray-200 rounded-full appearance-none accent-blue-500" 
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineControls;
