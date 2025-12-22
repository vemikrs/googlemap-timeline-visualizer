import React, { useState, useEffect } from 'react';
import { Settings, Maximize2, Minimize2, Crosshair, Menu, X, Share2, Video, HelpCircle } from 'lucide-react';
import PrivacyLevelButton from './PrivacyLevelButton';
import type { PrivacyLevelId } from '../types';

interface ControlButtonsProps {
  isWideView: boolean;
  onToggleWideView: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onFocusCurrent: () => void;
  onShare?: () => void;
  onRecord?: () => void;
  isRecording?: boolean;
  showInitialMenu?: boolean;
  privacyLevel?: PrivacyLevelId;
  onOpenPrivacySettings?: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isWideView,
  onToggleWideView,
  onOpenSettings,
  onOpenHelp,
  onFocusCurrent,
  onShare,
  onRecord,
  isRecording = false,
  showInitialMenu = false,
  privacyLevel = 'none',
  onOpenPrivacySettings,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasShownInitial, setHasShownInitial] = useState(false);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // 初回のみメニューを開く（自動で閉じない）
  useEffect(() => {
    if (showInitialMenu && !hasShownInitial) {
      setHasShownInitial(true);
      setIsExpanded(true);
    }
  }, [showInitialMenu, hasShownInitial]);

  return (
    <div className="relative w-10">
      {/* Expanded Buttons - Appear Above Toggle */}
      {isExpanded && (
        <div className="absolute bottom-12 left-0 w-10 flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
          {/* Record Button */}
          {onRecord && (
            <button 
              onClick={() => {
                onRecord();
                setIsExpanded(false);
              }}
              className={`w-10 h-10 rounded-xl shadow-lg border active:scale-95 transition-all flex items-center justify-center relative ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-600/50'
                  : 'bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-500 border-red-200/50'
              }`}
              title={isRecording ? '録画中' : '録画'}
            >
              {isRecording && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
              <Video size={18} />
            </button>
          )}

          {/* Share Button (Mobile) */}
          {canShare && onShare && (
            <button 
              onClick={() => {
                onShare();
                setIsExpanded(false);
              }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 w-10 h-10 rounded-xl shadow-lg border border-green-200/50 text-green-600 active:scale-95 transition-all flex items-center justify-center"
              title="シェア"
            >
              <Share2 size={18} />
            </button>
          )}

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

          {/* Help Button */}
          <button 
            onClick={() => {
              onOpenHelp();
              setIsExpanded(false);
            }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 w-10 h-10 rounded-xl shadow-lg border border-gray-200/50 text-gray-500 active:scale-95 transition-all flex items-center justify-center"
            title="ヘルプ"
          >
            <HelpCircle size={18} />
          </button>

          {/* Privacy Level Button */}
          {onOpenPrivacySettings && (
            <PrivacyLevelButton
              currentLevel={privacyLevel}
              onClick={() => {
                onOpenPrivacySettings();
                setIsExpanded(false);
              }}
            />
          )}
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
