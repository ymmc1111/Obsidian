import { InventoryItem, ItemStatus, SensitivityLevel, AuditLogEntry, ProductionRun } from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    partNumber: 'XB-70-TI',
    nomenclature: 'Titanium Fastener, Aerospace Grade',
    cageCode: '78K92',
    serialNumber: 'SN-2024-9901',
    location: 'WH-A-01-04',
    quantity: 450,
    unitCost: 12.50,
    status: ItemStatus.AVAILABLE,
    sensitivity: SensitivityLevel.UNCLASSIFIED,
    batchLot: 'LOT-99812A'
  },
  {
    id: 'INV-002',
    partNumber: 'GUID-SYS-V4',
    nomenclature: 'Guidance Module Logic Board',
    cageCode: '1A2B3',
    serialNumber: 'SN-2024-1102',
    location: 'SECURE-LOCKER-B',
    quantity: 5,
    unitCost: 4500.00,
    status: ItemStatus.QUARANTINE, // Flagged for review
    sensitivity: SensitivityLevel.CUI,
    batchLot: 'LOT-7721X'
  },
  {
    id: 'INV-003',
    partNumber: 'AL-SHEET-7075',
    nomenclature: '7075-T6 Aluminum Sheet',
    cageCode: '8812X',
    serialNumber: 'N/A',
    location: 'WH-C-RACK-02',
    quantity: 20,
    unitCost: 320.00,
    status: ItemStatus.AVAILABLE,
    sensitivity: SensitivityLevel.UNCLASSIFIED,
    batchLot: 'HEAT-44910'
  }
];

export const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-1024',
    timestamp: new Date(Date.now() - 1000000).toISOString(),
    actor: 'J. Doe (US-ID-992)',
    action: 'LOGIN_MFA_SUCCESS',
    details: 'Authenticated via YubiKey 5C NFC. IP: 192.168.1.44 (US-VA)',
    hash: '0x8f1...a29'
  },
  {
    id: 'LOG-1025',
    timestamp: new Date(Date.now() - 500000).toISOString(),
    actor: 'SYS_AUTO_MONITOR',
    action: 'INV_THRESHOLD_ALERT',
    details: 'Item XB-70-TI dipped below safety stock level.',
    hash: '0x7b2...c11'
  }
];

export const MOCK_TRAVELER: ProductionRun = {
  id: 'RUN-2024-ALPHA',
  partNumber: 'ASM-THRUSTER-NOZZLE',
  quantity: 1,
  status: 'IN_PROGRESS',
  currentStepIndex: 1,
  steps: [
    {
      id: 'STEP-1',
      order: 1,
      instruction: 'Verify Raw Material Heat Lot matches BOM.',
      requiredRole: 'Operator',
      completed: true,
      completedBy: 'M. Smith',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      inputs: [{ label: 'Heat Lot #', value: 'HEAT-44910', type: 'text' }]
    },
    {
      id: 'STEP-2',
      order: 2,
      instruction: 'CNC Lathe Operation 10: Rough Turn outer diameter.',
      requiredRole: 'Machinist',
      completed: false,
      inputs: [{ label: 'Visual Inspection', value: '', type: 'passfail' }]
    },
    {
      id: 'STEP-3',
      order: 3,
      instruction: 'Nondestructive Testing (NDT) - Dye Penetrant.',
      requiredRole: 'Quality Inspector',
      completed: false,
      inputs: [{ label: 'Report #', value: '', type: 'text' }]
    }
  ]
};