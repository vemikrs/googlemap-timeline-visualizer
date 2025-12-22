import React from 'react';
import FileUploader from './FileUploader';
import TimelineControls from './TimelineControls';
import Header from './Header';
import ControlButtons from './ControlButtons';
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
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
  isWideView: boolean;
  onToggleWideView: () => void;
  onOpenSettings: () => void;
  onFocusCurrent: () => void;
  onBackToUpload: () => void;
  onShare?: () => void;
  showInitialHints?: boolean;
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
  onSeek,
  onSpeedChange,
  isWideView,
  onToggleWideView,
  onOpenSettings,
  onFocusCurrent,
  onBackToUpload,
  onShare,
  showInitialHints = false,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] p-2 sm:p-3 flex flex-col pointer-events-none pb-6">
      {/* Top Row: Header + Control Buttons */}
      {points.length > 0 && (
        <div className="mb-2 flex items-end justify-between px-2">
          <Header />
          <div className="pointer-events-auto">
            <ControlButtons
              isWideView={isWideView}
              onToggleWideView={onToggleWideView}
              onOpenSettings={onOpenSettings}
              onFocusCurrent={onFocusCurrent}
              onShare={onShare}
              showInitialMenu={showInitialHints}
            />
          </div>
        </div>
      )}
      
      <div className="rounded-2xl shadow-2xl border border-white/50 p-2.5 sm:p-3 pointer-events-auto max-w-xl mx-auto w-full transition-all" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(8px)'}}>
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
            onSeek={onSeek}
            onSpeedChange={onSpeedChange}
            onBackToUpload={onBackToUpload}
          />
        )}
      </div>
    </div>
  );
};

export default ControllerHUD;
