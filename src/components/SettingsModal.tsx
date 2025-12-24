import React from 'react';
import { ChevronDown, Trash2, Eye, EyeOff, ZoomIn, ChevronRight, Shield } from 'lucide-react';
import type { MapTheme, PrivacyLevelId } from '../types';
import { PRIVACY_LEVELS } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapTheme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  onReset: () => void;
  showCoordinates?: boolean;
  onCoordinatesToggle?: (show: boolean) => void;
  onOpenZoomSettings?: () => void;
  privacyLevel?: PrivacyLevelId;
  onOpenPrivacySettings?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mapTheme,
  onThemeChange,
  onReset,
  showCoordinates = false,
  onCoordinatesToggle,
  onOpenZoomSettings,
  privacyLevel = 'none',
  onOpenPrivacySettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-black text-lg sm:text-xl text-gray-800">アプリ設定</h2>
          <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>

        
        {/* Scrollable Content with Custom Scrollbar */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          <div className="space-y-4 text-sm font-medium">
          
            {/* Zoom Settings Link */}
            {onOpenZoomSettings && (
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <ZoomIn size={12} />
                  拡大モード設定
                </label>
                <button
                  onClick={onOpenZoomSettings}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs transition-all bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50"
                >
                  <span className="flex items-center gap-2">
                    <ZoomIn size={16} />
                    ズームレベル・速度制限
                  </span>
                  <ChevronRight size={16} />
                </button>
                <p className="text-[9px] text-gray-400 px-1">
                  拡大モード時のズームレベルと最大再生速度を調整できます
                </p>
              </div>
            )}
          
            {/* Privacy Level Settings */}
            {onOpenPrivacySettings && (
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Shield size={12} />
                  プライバシー（位置丸め）
                </label>
                {(() => {
                  const currentLevel = PRIVACY_LEVELS.find(l => l.id === privacyLevel);
                  const isEnabled = privacyLevel !== 'none';
                  return (
                    <button
                      onClick={() => { onOpenPrivacySettings(); onClose(); }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs transition-all border ${
                        isEnabled
                          ? 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 hover:from-purple-100 hover:to-violet-100 border-purple-200/50'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Shield size={16} />
                        <span>
                          {isEnabled ? `${currentLevel?.label}（${currentLevel?.description}）` : 'OFF（位置情報そのまま）'}
                        </span>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  );
                })()}
                <p className="text-[9px] text-gray-400 px-1">
                  録画や共有時に位置情報をぼかして、住所を特定されにくくします
                </p>
              </div>
            )}
          
            {/* Coordinates Toggle */}
            {onCoordinatesToggle && (
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Eye size={12} />
                  座標表示
                </label>
                <button
                  onClick={() => onCoordinatesToggle(!showCoordinates)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                    showCoordinates
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {showCoordinates ? <Eye size={16} /> : <EyeOff size={16} />}
                    緯度経度を表示
                  </span>
                  <span className="text-[10px] font-black uppercase">
                    {showCoordinates ? 'ON' : 'OFF'}
                  </span>
                </button>
                <p className="text-[9px] text-gray-400 px-1">
                  タイムスタンプに緯度経度を表示します（機微情報のため初期状態はOFF）
                </p>
              </div>
            )}
          
            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                地図のスタイル
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'dark', 'satellite'] as const).map(t => (
                  <button 
                    key={t} 
                    onClick={() => onThemeChange(t)} 
                    className={`py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${
                      mapTheme === t 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-gray-100">
              <button 
                onClick={onReset} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-500 font-black rounded-xl text-xs hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> データをリセット
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 10px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #4f46e5 100%);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 transparent;
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
