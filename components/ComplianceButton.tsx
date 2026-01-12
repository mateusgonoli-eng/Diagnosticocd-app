
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ComplianceStatus } from '../types';

interface ComplianceButtonProps {
  status: ComplianceStatus;
  selected: boolean;
  onClick: () => void;
}

export const ComplianceButton: React.FC<ComplianceButtonProps> = ({ status, selected, onClick }) => {
  const styles = {
    [ComplianceStatus.CONFORME]: selected ? 'bg-green-600 text-white border-green-700 ring-2 ring-green-100' : 'bg-green-50 text-green-700 border-green-200',
    [ComplianceStatus.NAO_CONFORME]: selected ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-100' : 'bg-red-50 text-red-700 border-red-200',
    [ComplianceStatus.NAO_APLICAVEL]: selected ? 'bg-gray-600 text-white border-gray-700 ring-2 ring-gray-100' : 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const labels = {
    [ComplianceStatus.CONFORME]: 'Conforme',
    [ComplianceStatus.NAO_CONFORME]: 'Não Conforme',
    [ComplianceStatus.NAO_APLICAVEL]: 'N/A',
  };

  const icons = {
    [ComplianceStatus.CONFORME]: <CheckCircle size={16} />,
    [ComplianceStatus.NAO_CONFORME]: <XCircle size={16} />,
    [ComplianceStatus.NAO_APLICAVEL]: <AlertCircle size={16} />,
  };

  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${styles[status]}`}
    >
      {icons[status]}
      {labels[status]}
    </button>
  );
};
