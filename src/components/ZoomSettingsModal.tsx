import React from 'react';
import { ChevronDown, ZoomIn, Gauge, RotateCcw, ArrowLeft, Settings } from 'lucide-react';

interface ZoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusZoomLevel: number;
  onZoomLevelChange: (zoom: number) => void;
  maxSpeedFocusMode: number;
  onMaxSpeedChange: (speed: number) => void;
  onBackToSettings?: () => void;
}

const ZoomSettingsModal: React.FC<ZoomSettingsModalProps> = ({
  isOpen,
  onClose,
  focusZoomLevel,
  onZoomLevelChange,
  maxSpeedFocusMode,
  onMaxSpeedChange,
  onBackToSettings,
}) => {
  if (!isOpen) return null;

  const getZoomDescription = (zoom: number): string => {
    if (zoom <= 6) return '国レベル';
    if (zoom <= 8) return '地方レベル';
    if (zoom <= 10) return '都市レベル';
    if (zoom <= 12) return '地区レベル';
    if (zoom <= 14) return '街区レベル';
    if (zoom <= 16) return '建物レベル';
    return '最詳細';
  };

  const getSpeedDescription = (speed: number): string => {
    if (speed <= 5) return '安定優先';
    if (speed <= 10) return 'バランス';
    if (speed <= 20) return '速度優先';
    return '最速';
  };

  const handleReset = () => {
    onZoomLevelChange(11);
    onMaxSpeedChange(10);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
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
            <ZoomIn size={20} className="text-blue-500" />
            拡大モード設定
          </h2>
          <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          <div className="space-y-6 text-sm font-medium">
            
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                拡大モードでは、タイル読み込み遅延を防ぐため、ズームレベルと再生速度を調整できます。
              </p>
            </div>
            
            {/* Zoom Level Setting */}
            <div className="space-y-3">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                <ZoomIn size={12} />
                ズームレベル
              </label>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-10">広域</span>
                  <input
                    type="range"
                    min="5"
                    max="18"
                    value={focusZoomLevel}
                    onChange={(e) => onZoomLevelChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
                  />
                  <span className="text-[10px] text-gray-400 w-10 text-right">詳細</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                      {focusZoomLevel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getZoomDescription(focusZoomLevel)}
                    </span>
                  </div>
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    focusZoomLevel <= 10 
                      ? 'bg-green-100 text-green-600' 
                      : focusZoomLevel <= 14
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {focusZoomLevel <= 10 ? '読込◎' : focusZoomLevel <= 14 ? '読込○' : '読込△'}
                  </div>
                </div>
              </div>
            </div>

            {/* Max Speed Setting */}
            <div className="space-y-3">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                <Gauge size={12} />
                最大再生速度
              </label>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-10">遅い</span>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={maxSpeedFocusMode}
                    onChange={(e) => onMaxSpeedChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer speed-slider"
                  />
                  <span className="text-[10px] text-gray-400 w-10 text-right">速い</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                      ×{maxSpeedFocusMode}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getSpeedDescription(maxSpeedFocusMode)}
                    </span>
                  </div>
                  <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    maxSpeedFocusMode <= 10 
                      ? 'bg-green-100 text-green-600' 
                      : maxSpeedFocusMode <= 20
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {maxSpeedFocusMode <= 10 ? '安定◎' : maxSpeedFocusMode <= 20 ? '安定○' : '安定△'}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 px-1">
                拡大モード時、スライダーで設定した速度よりこの値が優先されます
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-3">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                クイックプリセット
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { onZoomLevelChange(9); onMaxSpeedChange(20); }}
                  className="py-2.5 px-2 rounded-xl border text-[10px] font-bold transition-all bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                >
                  高速再生
                </button>
                <button
                  onClick={() => { onZoomLevelChange(11); onMaxSpeedChange(10); }}
                  className="py-2.5 px-2 rounded-xl border text-[10px] font-bold transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                >
                  バランス
                </button>
                <button
                  onClick={() => { onZoomLevelChange(14); onMaxSpeedChange(5); }}
                  className="py-2.5 px-2 rounded-xl border text-[10px] font-bold transition-all bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                >
                  高画質
                </button>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-gray-100">
              <button 
                onClick={handleReset} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-500 font-bold rounded-xl text-xs hover:bg-gray-100 transition-colors"
              >
                <RotateCcw size={14} /> デフォルトに戻す
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
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
        
        /* Zoom Slider Styles */
        .zoom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }
        .zoom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(59, 130, 246, 0.5);
        }
        .zoom-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        
        /* Speed Slider Styles */
        .speed-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.2s;
        }
        .speed-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 12px rgba(99, 102, 241, 0.5);
        }
        .speed-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border: 3px solid #6366f1;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ZoomSettingsModal;
