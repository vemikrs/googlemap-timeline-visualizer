import React from 'react';
import { Video, Shield, ShieldCheck, ShieldAlert, ShieldOff, ChevronRight } from 'lucide-react';
import { PRIVACY_LEVELS, type PrivacyLevelId } from '../types';

interface RecordingPrivacyPromptProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: PrivacyLevelId;
  onLevelChange: (level: PrivacyLevelId) => void;
  onConfirm: () => void;
}

const getShieldIcon = (levelId: string, size: number = 18) => {
  switch (levelId) {
    case 'none':
      return <ShieldOff size={size} />;
    case 'low':
      return <Shield size={size} />;
    case 'medium':
      return <ShieldCheck size={size} />;
    case 'high':
    case 'max':
      return <ShieldAlert size={size} />;
    default:
      return <Shield size={size} />;
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

const RecordingPrivacyPrompt: React.FC<RecordingPrivacyPromptProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onLevelChange,
  onConfirm,
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
      className="absolute inset-0 z-[2000] bg-black/50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Video size={22} />
            </div>
            <div>
              <h2 className="font-black text-lg">録画を開始</h2>
              <p className="text-[11px] text-white/80">プライバシー設定を確認してください</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Current Privacy Level */}
          <div>
            <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 block">
              現在のプライバシーレベル
            </label>
            <div className={`bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-xl p-3 text-white flex items-center gap-3`}>
              {getShieldIcon(currentLevel, 24)}
              <div className="flex-1">
                <p className="font-black text-sm">{currentLevelData?.label}</p>
                <p className="text-[10px] text-white/80">{currentLevelData?.description}</p>
              </div>
            </div>
          </div>

          {/* Quick Level Selection */}
          <div>
            <label className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2 block">
              変更する場合はタップ
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRIVACY_LEVELS.map((level) => {
                const isActive = currentLevel === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => onLevelChange(level.id as PrivacyLevelId)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                      isActive
                        ? `bg-gradient-to-b ${getLevelColor(level.id)} text-white shadow-md`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {getShieldIcon(level.id, 16)}
                    <span>{level.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning for none */}
          {currentLevel === 'none' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[11px] text-amber-700 leading-relaxed">
                ⚠️ プライバシー保護が<strong>OFF</strong>です。
                録画には正確な位置情報が含まれます。
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              キャンセル
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              録画開始
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingPrivacyPrompt;
