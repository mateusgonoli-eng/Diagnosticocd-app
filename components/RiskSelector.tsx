
import React from 'react';
import { RiskLevel } from '../types';

interface RiskSelectorProps {
  selected?: RiskLevel;
  onChange: (risk: RiskLevel) => void;
}

export const RiskSelector: React.FC<RiskSelectorProps> = ({ selected, onChange }) => {
  const risks = [
    { level: RiskLevel.BAIXO, color: 'bg-gray-50 text-gray-500 border-gray-200', active: 'bg-gray-400 text-white border-gray-500' },
    { level: RiskLevel.MEDIO, color: 'bg-amber-50 text-amber-700 border-amber-200', active: 'bg-amber-600 text-white border-amber-700' },
    { level: RiskLevel.ALTO, color: 'bg-red-50 text-red-700 border-red-200', active: 'bg-red-600 text-white border-red-700' },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left">Nível de Risco</span>
      <div className="flex gap-2">
        {risks.map((r) => (
          <button
            key={r.level}
            onClick={() => onChange(r.level)}
            className={`flex-1 py-2 px-1 rounded-lg border text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${selected === r.level ? r.active : r.color}`}
          >
            {r.level}
          </button>
        ))}
      </div>
    </div>
  );
};
