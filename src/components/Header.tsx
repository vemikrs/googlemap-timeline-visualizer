import React from 'react';
import { MapIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-white/30 pointer-events-auto">
      <h1 className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 tracking-tight uppercase opacity-80">
        <MapIcon size={12} className="text-gray-400" />
        Timeline Tracker
      </h1>
    </div>
  );
};

export default Header;
