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
      className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] bg-white p-4 rounded-full shadow-2xl border border-gray-100 text-blue-500 active:scale-90 transition-transform"
      title="現在地にフォーカス"
    >
      <Crosshair size={24} />
    </button>
  );
};

export default FocusButton;
