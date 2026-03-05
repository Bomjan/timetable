import React from 'react';
import { Calendar } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Calendar size={18} />
        </div>
        <h1 className="font-bold text-xl text-slate-800 tracking-tight">TimeTable<span className="text-blue-600">Pro</span></h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Term 1 • 2026
        </div>
        <div className="w-px h-6 bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-slate-500">Live Sync Enabled</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
