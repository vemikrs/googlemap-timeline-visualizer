import React from 'react';
import FileUploader from './FileUploader';
import TimelineControls from './TimelineControls';
import type { Point } from '../types';

interface ControllerHUDProps {
  points: Point[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedYear: string | 'all';
  isProcessing: boolean;
  progress: number;
  errorMsg: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

const ControllerHUD: React.FC<ControllerHUDProps> = ({
  points,
  currentIndex,
  isPlaying,
  playbackSpeed,
  selectedYear,
  isProcessing,
  progress,
  errorMsg,
  onFileUpload,
  onPlayPause,
  onReset,
  onSeek,
  onSpeedChange,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-2 sm:p-3 flex flex-col pointer-events-none pb-6">
      <div className="rounded-2xl shadow-2xl border border-white/50 p-3 sm:p-4 pointer-events-auto max-w-xl mx-auto w-full transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(8px)'}}>
        {points.length === 0 ? (
          <FileUploader
            isProcessing={isProcessing}
            progress={progress}
            errorMsg={errorMsg}
            onFileUpload={onFileUpload}
          />
        ) : (
          <TimelineControls
            points={points}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            selectedYear={selectedYear}
            onPlayPause={onPlayPause}
            onReset={onReset}
            onSeek={onSeek}
            onSpeedChange={onSpeedChange}
          />
        )}
      </div>
    </div>
  );
};

export default ControllerHUD;
