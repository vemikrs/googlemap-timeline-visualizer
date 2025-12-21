import React from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import type { MapTheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: string | 'all';
  availableYears: number[];
  onYearChange: (year: string) => void;
  mapTheme: MapTheme;
  onThemeChange: (theme: MapTheme) => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedYear,
  availableYears,
  onYearChange,
  mapTheme,
  onThemeChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-6 animate-in fade-in backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-8 overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="font-black text-xl text-gray-800">アプリ設定</h2>
          <button onClick={onClose} className="text-gray-400 p-2">
            <ChevronDown size={28} />
          </button>
        </div>
        
        <div className="space-y-6 text-sm font-medium">
          {/* Year Selection */}
          <div className="space-y-3">
            <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              表示する年
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              <button 
                onClick={() => onYearChange('all')} 
                className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${
                  selectedYear === 'all' 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-50 text-gray-500'
                }`}
              >
                ALL
              </button>
              {availableYears.map(y => (
                <button 
                  key={y} 
                  onClick={() => onYearChange(y.toString())} 
                  className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase ${
                    selectedYear === y.toString() 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              地図のスタイル
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'satellite'] as const).map(t => (
                <button 
                  key={t} 
                  onClick={() => onThemeChange(t)} 
                  className={`py-3.5 rounded-2xl border text-[10px] font-black uppercase ${
                    mapTheme === t 
                      ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-100">
            <button 
              onClick={onReset} 
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 font-black rounded-2xl"
            >
              <Trash2 size={20} /> データをリセット
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
