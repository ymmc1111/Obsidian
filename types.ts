export enum SensitivityLevel {
  UNCLASSIFIED = 'UNCLASSIFIED',
  CUI = 'CUI', // Controlled Unclassified Information
  SECRET = 'SECRET'
}

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  QUARANTINE = 'QUARANTINE',
  SCRAP = 'SCRAP'
}

export interface InventoryItem {
  id: string;
  partNumber: string;
  nomenclature: string;
  cageCode: string;
  serialNumber: string;
  location: string;
  quantity: number;
  unitCost: number;
  status: ItemStatus;
  sensitivity: SensitivityLevel;
  batchLot: string; // For traceability
  expirationDate?: string; // Shelf life
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  hash: string; // Simulated blockchain hash
}

export interface TravelerStep {
  id: string;
  order: number;
  instruction: string;
  requiredRole: string; // e.g., "Operator", "Quality Engineer"
  completed: boolean;
  completedBy?: string;
  timestamp?: string;
  inputs?: { label: string; value: string; type: 'text' | 'number' | 'passfail' }[];
}

export interface ProductionRun {
  id: string;
  partNumber: string;
  quantity: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';
  currentStepIndex: number;
  steps: TravelerStep[];
}