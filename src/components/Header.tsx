import React from 'react';
import { MapIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white/60 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm border border-white/40 pointer-events-auto">
      <h1 className="text-[10px] font-semibold text-gray-600 flex items-center gap-1.5 tracking-tight uppercase opacity-85">
        <MapIcon size={10} className="text-gray-500" />
        Timeline Visualizer
      </h1>
    </div>
  );
};

export default Header;
