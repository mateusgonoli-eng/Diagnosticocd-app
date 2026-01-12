
export enum ComplianceStatus {
  CONFORME = 'CONFORME',
  NAO_CONFORME = 'NAO_CONFORME',
  NAO_APLICAVEL = 'NAO_APLICAVEL'
}

export enum RiskLevel {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO'
}

export interface SpecificationItem {
  id: string;
  category: string;
  title: string;
  description: string;
  requirements: string[];
}

export interface DiagnosticItem {
  specId: string;
  status: ComplianceStatus;
  risk?: RiskLevel;
  observations: string;
  photos: string[]; // Alterado de photo? para photos
  deadline?: string; 
}

export interface CDInfo {
  name: string;
  partner: string;
  location: string;
  date: string;
  auditor: string;
  goliveDate: string; 
}

export interface DiagnosticState {
  info: CDInfo;
  items: Record<string, DiagnosticItem>;
}
