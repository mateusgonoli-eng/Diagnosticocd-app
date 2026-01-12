
import React from 'react';

export const Header: React.FC = () => (
  <header className="bg-[#E01E2B] text-white p-4 sticky top-0 z-50 shadow-md flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold uppercase tracking-tight leading-none text-white">CD Master</h1>
        <span className="text-[10px] font-medium opacity-90 uppercase tracking-widest text-white/90">Solar Coca-Cola</span>
      </div>
    </div>
    <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/30 shadow-sm">
      <span className="text-[10px] font-black uppercase tracking-widest text-white">PROJETO NMA</span>
    </div>
  </header>
);
