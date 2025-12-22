import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import type { Point } from '../types';

interface TimestampHeaderProps {
  currentPoint: Point | null;
  currentIndex: number;
  totalPoints: number;
  selectedYear: string | 'all';
  showCoordinates?: boolean;
  onYearFilterClick?: () => void;
  showInitialHint?: boolean;
}

const TimestampHeader: React.FC<TimestampHeaderProps> = ({
  currentPoint,
  currentIndex,
  totalPoints,
  selectedYear,
  showCoordinates = false,
  onYearFilterClick,
  showInitialHint = false,
}) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (showInitialHint) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showInitialHint]);

  const dismissHint = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHint(false);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[900] pointer-events-none">
      <div className="relative max-w-md mx-auto">
        {/* Hint Tooltip - 吹き出しスタイル */}
        {showHint && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto animate-in fade-in zoom-in-95 duration-300 z-10">
            <div className="relative bg-gray-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2">
              {/* 上向き三角 */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45" />
              <span className="relative z-10">タップで年を選択</span>
              <button onClick={dismissHint} className="relative z-10 text-gray-400 hover:text-white transition-colors">
                <X size={12} />
              </button>
            </div>
          </div>
        )}
        
        <div className="rounded-3xl shadow-2xl border border-white/50 p-2 pointer-events-auto transition-all cursor-pointer hover:shadow-xl hover:border-blue-300/60 active:scale-[0.98] hover:bg-white/60" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(8px)'}} onClick={onYearFilterClick}>
        {/* Header Row: Year Badge + Point Counter */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full" style={{background: 'linear-gradient(to right, rgba(59, 130, 246, 0.85), rgba(99, 102, 241, 0.85))'}}>
            <Calendar size={10} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              {selectedYear === 'all' ? 'All Years' : `${selectedYear} Year`}
            </span>
          </div>
          
          {/* Counter Badge */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Point</span>
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono">
              {currentIndex + 1}
            </span>
            <span className="text-[9px] text-gray-400 font-mono">/ {totalPoints}</span>
          </div>
        </div>

        {/* Main Timestamp */}
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-mono font-black text-gray-800 tracking-tighter leading-none truncate">
              {currentPoint?.ts 
                ? new Date(currentPoint.ts).toLocaleString('ja-JP', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) 
                : '--/--/-- --:--'}
            </h3>
            {showCoordinates && currentPoint && (
              <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                {currentPoint.lat.toFixed(6)}, {currentPoint.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TimestampHeader;
