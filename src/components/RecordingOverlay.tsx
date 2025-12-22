import React from 'react';
import { Square } from 'lucide-react';

interface RecordingOverlayProps {
  isRecording: boolean;
  isProcessing: boolean;
  elapsedTime: number;
  maxDuration: number;
  frameCount: number;
  processingProgress: number;
  onStop: () => void;
  onCancel: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  isRecording,
  isProcessing,
  elapsedTime,
  maxDuration,
  frameCount,
  processingProgress,
  onStop,
  onCancel,
}) => {
  if (!isRecording && !isProcessing) return null;

  return (
    <>
      {/* Top Recording Indicator */}
      {isRecording && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1500]">
          <div className="bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
            {/* Pulsing red dot */}
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
            </div>
            
            <span className="text-white font-mono font-bold text-sm">
              REC
            </span>
            
            <span className="text-white font-mono text-sm">
              {formatTime(elapsedTime)} / {formatTime(maxDuration)}
            </span>
            
            <span className="text-gray-400 text-xs">
              {frameCount} frames
            </span>
          </div>
        </div>
      )}

      {/* Bottom Control (Stop Button) */}
      {isRecording && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-[1500]">
          <button
            onClick={onStop}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-xl active:scale-95 transition-all"
          >
            <Square size={18} fill="white" />
            <span className="font-bold">録画停止</span>
          </button>
        </div>
      )}

      {/* Processing Progress Bar (Full Width) */}
      {isProcessing && (
        <div className="absolute bottom-24 left-4 right-4 z-[1500]">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">動画を生成しています</span>
              <button
                onClick={onCancel}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                キャンセル
              </button>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {processingProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Semi-transparent overlay border during recording */}
      {isRecording && (
        <div className="absolute inset-0 pointer-events-none z-[1400] border-4 border-red-500/50 animate-pulse" />
      )}
    </>
  );
};

export default RecordingOverlay;
