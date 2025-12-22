import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

interface YearFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYearStart: number | null;
  selectedYearEnd: number | null;
  availableYears: number[];
  onYearRangeChange: (start: number | null, end: number | null) => void;
}

const YearFilterModal: React.FC<YearFilterModalProps> = ({
  isOpen,
  onClose,
  selectedYearStart,
  selectedYearEnd,
  availableYears,
  onYearRangeChange,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // クリックがオーバーレイ自体（ダイアログの外）の場合のみ閉じる
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
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            <h2 className="font-black text-lg sm:text-xl text-gray-800">年別フィルター</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronDown size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 custom-scrollbar">
          <div className="space-y-4 text-sm font-medium">
            {/* Current Year Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
              <div className="text-center">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">
                  {selectedYearStart === null || selectedYearEnd === null ? 'すべての年' : '選択範囲'}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {selectedYearStart === null || selectedYearEnd === null
                    ? 'ALL'
                    : selectedYearStart === selectedYearEnd
                    ? selectedYearStart
                    : `${selectedYearStart} - ${selectedYearEnd}`}
                </p>
              </div>
            </div>

            {/* ALL Toggle Button */}
            <button
              onClick={() => onYearRangeChange(null, null)}
              className={`w-full py-3 rounded-xl font-black text-xs transition-all ${
                selectedYearStart === null || selectedYearEnd === null
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {selectedYearStart === null || selectedYearEnd === null ? '✓ ' : ''}すべての年を表示
            </button>

            {/* Year Range Sliders */}
            {availableYears.length > 0 && (
              <div className="space-y-2.5">
                {/* Start Year Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] font-bold text-gray-500">開始年</span>
                    <span className="text-xs font-bold text-blue-600">
                      {selectedYearStart || availableYears[availableYears.length - 1]}
                    </span>
                  </div>
                  <div className="relative px-1">
                    <input
                      type="range"
                      min="0"
                      max={availableYears.length - 1}
                      value={selectedYearStart === null ? 0 : availableYears.length - 1 - availableYears.indexOf(selectedYearStart)}
                      onChange={(e) => {
                        const index = availableYears.length - 1 - parseInt(e.target.value);
                        const year = availableYears[index];
                        const endYear = selectedYearEnd || availableYears[0];
                        onYearRangeChange(year, Math.max(year, endYear));
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #3b82f6 0%, #6366f1 100%)'
                      }}
                    />
                  </div>
                </div>

                {/* End Year Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] font-bold text-gray-500">終了年</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {selectedYearEnd || availableYears[0]}
                    </span>
                  </div>
                  <div className="relative px-1">
                    <input
                      type="range"
                      min="0"
                      max={availableYears.length - 1}
                      value={selectedYearEnd === null ? availableYears.length - 1 : availableYears.length - 1 - availableYears.indexOf(selectedYearEnd)}
                      onChange={(e) => {
                        const index = availableYears.length - 1 - parseInt(e.target.value);
                        const year = availableYears[index];
                        const startYear = selectedYearStart || availableYears[availableYears.length - 1];
                        onYearRangeChange(Math.min(year, startYear), year);
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: 'linear-gradient(to right, #6366f1 0%, #8b5cf6 100%)'
                      }}
                    />
                  </div>
                </div>
                
                {/* Year Range Display */}
                <div className="flex justify-between px-1">
                  <span className="text-[10px] font-bold text-gray-400">
                    {availableYears[availableYears.length - 1]}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    {availableYears[0]}
                  </span>
                </div>
              </div>
            )}
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

export default YearFilterModal;
