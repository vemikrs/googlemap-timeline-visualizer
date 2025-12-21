import React from 'react';
import { MapIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-white/40 pointer-events-auto">
      <h1 className="text-sm font-black text-gray-800 flex items-center gap-2 tracking-tight uppercase">
        <MapIcon size={16} className="text-blue-500" />
        Timeline Tracker
      </h1>
    </div>
  );
};

export default Header;
