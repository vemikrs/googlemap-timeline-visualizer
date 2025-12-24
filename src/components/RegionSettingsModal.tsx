import React from 'react';
import { ChevronDown, Globe, ArrowLeft, Settings, MapPin } from 'lucide-react';
import type { RegionPresetId } from '../types';
import { REGION_PRESETS } from '../types';

interface RegionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  regionPreset: RegionPresetId;
  onRegionPresetChange: (preset: RegionPresetId) => void;
  onBackToSettings?: () => void;
}

const RegionSettingsModal: React.FC<RegionSettingsModalProps> = ({
  isOpen,
  onClose,
  regionPreset,
  onRegionPresetChange,
  onBackToSettings,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentPreset = REGION_PRESETS.find(p => p.id === regionPreset);

  const getRegionEmoji = (id: string): string => {
    switch (id) {
      case 'auto': return '🎯';
      case 'japan': return '🇯🇵';
      case 'asia': return '🌏';
      case 'europe': return '🇪🇺';
      case 'north-america': return '🇺🇸';
      case 'world': return '🌍';
      default: return '📍';
    }
  };

  return (
    <div 
      className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
          {onBackToSettings ? (
            <button
              onClick={onBackToSettings}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={18} />
              <Settings size={16} />
            </button>
          ) : (
            <div />
          )}
          <h2 className="font-black text-lg sm:text-xl text-gray-800 flex items-center gap-2">
            <Globe size={20} className="text-indigo-500" />
            表示範囲設定
          </h2>
          <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          <div className="space-y-4 text-sm font-medium">
            
            {/* Current Selection Display */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">{getRegionEmoji(regionPreset)}</span>
                <div className="text-center">
                  <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest">
                    現在の設定
                  </p>
                  <p className="text-xl font-black">
                    {currentPreset?.label || '自動'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-[10px] text-blue-700 leading-relaxed">
                <strong>🗺️ 広域モードの表示範囲</strong><br/>
                広域モード（縮小表示）時に、どの地域を中心に表示するかを設定します。
                「自動」を選択すると、読み込んだデータの範囲に自動でフィットします。
              </p>
            </div>

            {/* Region Selection */}
            <div className="space-y-2">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                <MapPin size={12} />
                地域を選択
              </label>
              <div className="space-y-2">
                {REGION_PRESETS.map((preset) => {
                  const isActive = regionPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onRegionPresetChange(preset.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span className="text-xl">{getRegionEmoji(preset.id)}</span>
                      <div className="flex-1 text-left">
                        <span className="block">{preset.label}</span>
                        {preset.id === 'auto' && (
                          <span className={`text-[10px] font-medium ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                            データ範囲に自動フィット
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-1 rounded-full">
                          選択中
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
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
          background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
          border-radius: 10px;
          border: 2px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5 0%, #9333ea 100%);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 transparent;
        }
      `}</style>
    </div>
  );
};

export default RegionSettingsModal;
