import React from 'react';
import { MapIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-white/20 pointer-events-auto">
      <h1 className="text-[10px] font-semibold text-gray-400 flex items-center gap-1.5 tracking-tight uppercase opacity-50">
        <MapIcon size={10} className="text-gray-300" />
        Timeline Visualizer
      </h1>
    </div>
  );
};

export default Header;
