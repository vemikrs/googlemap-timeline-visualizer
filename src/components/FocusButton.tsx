import React from 'react';
import { Crosshair } from 'lucide-react';

interface FocusButtonProps {
  visible: boolean;
  onClick: () => void;
}

const FocusButton: React.FC<FocusButtonProps> = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <button 
      onClick={onClick}
      className="bg-white/95 backdrop-blur-xl w-10 h-10 rounded-lg shadow-lg border border-white/40 text-blue-500 active:scale-90 transition-all flex items-center justify-center"
      title="現在地にフォーカス"
    >
      <Crosshair size={16} />
    </button>
  );
};

export default FocusButton;
