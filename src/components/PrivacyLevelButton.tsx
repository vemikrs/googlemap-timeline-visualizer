import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';
import type { PrivacyLevelId } from '../types';

interface PrivacyLevelButtonProps {
  currentLevel: PrivacyLevelId;
  onClick: () => void;
}

const getShieldIcon = (levelId: string) => {
  const size = 18;
  
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

const getButtonStyle = (levelId: string): string => {
  switch (levelId) {
    case 'none':
      return 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-500 border-gray-200/50';
    case 'low':
      return 'bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-600 border-green-200/50';
    case 'medium':
      return 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 border-blue-200/50';
    case 'high':
      return 'bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-600 border-orange-200/50';
    case 'max':
      return 'bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 border-red-200/50';
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-500 border-gray-200/50';
  }
};

const getLevelLabel = (levelId: string): string => {
  switch (levelId) {
    case 'none':
      return 'OFF';
    case 'low':
      return '低';
    case 'medium':
      return '中';
    case 'high':
      return '高';
    case 'max':
      return '最大';
    default:
      return 'OFF';
  }
};

const PrivacyLevelButton: React.FC<PrivacyLevelButtonProps> = ({
  currentLevel,
  onClick,
}) => {
  return (
    <button 
      onClick={onClick}
      className={`w-10 h-10 rounded-xl shadow-lg border active:scale-95 transition-all flex items-center justify-center relative ${getButtonStyle(currentLevel)}`}
      title={`プライバシー: ${getLevelLabel(currentLevel)}`}
    >
      {/* Level indicator badge */}
      {currentLevel !== 'none' && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center">
          <span className="text-[8px] font-black text-gray-600">
            {getLevelLabel(currentLevel)}
          </span>
        </div>
      )}
      {getShieldIcon(currentLevel)}
    </button>
  );
};

export default PrivacyLevelButton;
