import React from 'react';
import { ChevronDown, Trash2, Eye, EyeOff } from 'lucide-react';
import type { MapTheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapTheme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  onReset: () => void;
  showCoordinates?: boolean;
  onCoordinatesToggle?: (show: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mapTheme,
  onThemeChange,
  onReset,
  showCoordinates = false,
  onCoordinatesToggle,
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
          
            {/* Coordinates Toggle */}
            {onCoordinatesToggle && (
              <div className="space-y-2">
                <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  プライバシー設定
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
        
        /* Range Input Styles */
        .custom-scrollbar input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border: 2.5px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }
        .custom-scrollbar input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.5);
        }
        .custom-scrollbar input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border: 2.5px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }
        .custom-scrollbar input[type='range']::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SettingsModal;
