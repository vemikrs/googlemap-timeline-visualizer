import React from 'react';
import { ChevronDown, Shield, ShieldCheck, ShieldAlert, ShieldOff, ArrowLeft, Settings } from 'lucide-react';
import { PRIVACY_LEVELS, type PrivacyLevelId } from '../types';

interface PrivacyLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: PrivacyLevelId;
  onLevelChange: (level: PrivacyLevelId) => void;
  onBackToSettings?: () => void;
}

const getShieldIcon = (levelId: string, isActive: boolean) => {
  const size = 20;
  const className = isActive ? 'text-white' : 'text-current';
  
  switch (levelId) {
    case 'none':
      return <ShieldOff size={size} className={className} />;
    case 'low':
      return <Shield size={size} className={className} />;
    case 'medium':
      return <ShieldCheck size={size} className={className} />;
    case 'high':
    case 'max':
      return <ShieldAlert size={size} className={className} />;
    default:
      return <Shield size={size} className={className} />;
  }
};

const getLevelColor = (levelId: string): string => {
  switch (levelId) {
    case 'none':
      return 'from-gray-400 to-gray-500';
    case 'low':
      return 'from-green-400 to-emerald-500';
    case 'medium':
      return 'from-blue-400 to-indigo-500';
    case 'high':
      return 'from-orange-400 to-amber-500';
    case 'max':
      return 'from-red-400 to-pink-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
};

const PrivacyLevelModal: React.FC<PrivacyLevelModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onLevelChange,
  onBackToSettings,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentLevelData = PRIVACY_LEVELS.find(l => l.id === currentLevel);

  return (
    <div 
      className="absolute inset-0 z-[2000] bg-black/40 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
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
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-blue-500" />
            <h2 className="font-black text-base sm:text-lg text-gray-800">プライバシー設定</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronDown size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 py-3 custom-scrollbar">
          <div className="space-y-3 text-sm font-medium">
            {/* Current Level Display */}
            <div className={`bg-gradient-to-br ${getLevelColor(currentLevel)} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-center gap-2">
                {getShieldIcon(currentLevel, true)}
                <div className="text-center">
                  <p className="text-[9px] text-white/80 font-bold uppercase tracking-widest">
                    現在のレベル
                  </p>
                  <p className="text-xl font-black">
                    {currentLevelData?.label || 'なし'}
                  </p>
                  <p className="text-[10px] text-white/90">
                    {currentLevelData?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-[10px] text-amber-700 leading-relaxed">
                <strong>📍 位置情報のぼかし機能</strong><br/>
                シェア用に位置情報を丸めて、おおよその場所のみを表示します。
                レベルが高いほど、より広い範囲に丸められます。
              </p>
            </div>

            {/* Level Selection */}
            <div className="space-y-1.5">
              <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                レベルを選択
              </label>
              <div className="space-y-1">
                {PRIVACY_LEVELS.map((level) => {
                  const isActive = currentLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => onLevelChange(level.id as PrivacyLevelId)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${getLevelColor(level.id)} text-white shadow-md`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {getShieldIcon(level.id, isActive)}
                      <div className="flex-1 text-left">
                        <span className="block text-[11px]">{level.label}</span>
                        <span className={`text-[9px] font-medium ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {level.description}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[8px] font-black uppercase bg-white/20 px-1.5 py-0.5 rounded-full">
                          選択中
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Size Info */}
            {currentLevel !== 'none' && currentLevelData && (
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[10px] text-gray-500">
                  グリッドサイズ: <strong>{currentLevelData.gridSize}°</strong>
                  （約{currentLevelData.gridSize === 0.01 ? '1km' : 
                       currentLevelData.gridSize === 0.05 ? '5km' :
                       currentLevelData.gridSize === 0.5 ? '50km' : '110km'}単位）
                </p>
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
      `}</style>
    </div>
  );
};

export default PrivacyLevelModal;
