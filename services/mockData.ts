
import { 
  InventoryItem, ItemStatus, SensitivityLevel, AuditLogEntry, ProductionRun,
  Vendor, PurchaseOrder, PurchaseOrderStatus, Invoice, InvoiceStatus, SalesOrder, SalesOrderStatus,
  SystemUser, UserRole, ProductionSchedule
} from '../types';

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

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'V-101', name: 'Titanium Dynamics', cageCode: '1A2B3', contact: 'sales@titaniumdyn.com', status: 'Active' },
  { id: 'V-102', name: 'Orbital Circuits Inc.', cageCode: '9X8Y7', contact: 'orders@orbital.io', status: 'Active' },
  { id: 'V-103', name: 'Secure Raw Materials LLC', cageCode: '4K5L6', contact: 'gov-contracts@securemat.com', status: 'On Hold' }
];

export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'PO-2024-001',
    vendorId: 'V-101',
    date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
    totalAmount: 12500.00,
    status: PurchaseOrderStatus.FILLED,
    items: [{ partNumber: 'XB-70-TI', qty: 1000, unitCost: 12.50 }]
  },
  {
    id: 'PO-2024-002',
    vendorId: 'V-102',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    totalAmount: 54000.00,
    status: PurchaseOrderStatus.SENT,
    items: [{ partNumber: 'GUID-SYS-V4', qty: 12, unitCost: 4500.00 }]
  },
  {
    id: 'PO-2024-003',
    vendorId: 'V-103',
    date: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    totalAmount: 3200.00,
    status: PurchaseOrderStatus.PARTIAL,
    items: [{ partNumber: 'AL-SHEET-7075', qty: 10, unitCost: 320.00 }]
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-9901',
    poId: 'PO-2024-001',
    vendorId: 'V-101',
    date: new Date(Date.now() - 86400000 * 8).toISOString(),
    amountDue: 12500.00,
    status: InvoiceStatus.APPROVED,
    glAccount: '5000-MAT-RAW'
  },
  {
    id: 'INV-9902',
    poId: 'PO-2024-003',
    vendorId: 'V-103',
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    amountDue: 3200.00,
    status: InvoiceStatus.OVERDUE,
    glAccount: '5000-MAT-RAW'
  },
  {
    id: 'INV-9903',
    poId: 'PO-2024-002',
    vendorId: 'V-102',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    amountDue: 54000.00,
    status: InvoiceStatus.PENDING,
    glAccount: '5100-ELEC-COMP'
  }
];

export const INITIAL_ORDERS: SalesOrder[] = [
  {
    id: 'SO-8821',
    customer: 'SpaceX (Starbase)',
    date: new Date(Date.now() - 3600000 * 4).toISOString(),
    totalAmount: 450000.00,
    status: SalesOrderStatus.PROCESSING,
    fulfillmentLocation: 'US-East WH (Secure)',
    backorderedItems: 0
  },
  {
    id: 'SO-8822',
    customer: 'Raytheon Missiles',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    totalAmount: 125000.00,
    status: SalesOrderStatus.SHIPPED,
    fulfillmentLocation: 'Nevada Depot',
    backorderedItems: 2
  },
  {
    id: 'SO-8823',
    customer: 'Anduril Industries',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    totalAmount: 8900.00,
    status: SalesOrderStatus.DELIVERED,
    fulfillmentLocation: 'US-East WH (Secure)',
    backorderedItems: 0
  }
];

export const INITIAL_USERS: SystemUser[] = [
  { id: 'U-001', name: 'J. Doe', email: 'j.doe@pocketops.mil', role: UserRole.ADMIN, status: 'Active', lastActive: 'Now' },
  { id: 'U-002', name: 'S. Connor', email: 's.connor@pocketops.mil', role: UserRole.FINANCIAL_OFFICER, status: 'Active', lastActive: '2h ago' },
  { id: 'U-003', name: 'T. Stark', email: 't.stark@pocketops.mil', role: UserRole.QUALITY_INSPECTOR, status: 'Active', lastActive: '5m ago' },
  { id: 'U-004', name: 'B. Banner', email: 'b.banner@pocketops.mil', role: UserRole.PRODUCTION_OPERATOR, status: 'Locked', lastActive: '2d ago' },
  { id: 'U-005', name: 'N. Romanoff', email: 'n.romanoff@pocketops.mil', role: UserRole.LOGISTICS_SPECIALIST, status: 'Active', lastActive: '1h ago' },
];

export const INITIAL_SCHEDULES: ProductionSchedule[] = [
  { id: 'SCH-2024-101', partNumber: 'XB-70-TI', plannedQty: 500, startDate: '2024-11-01', machineCenter: 'CNC-Lathe-A', loadFactor: 85, status: 'Scheduled' },
  { id: 'SCH-2024-102', partNumber: 'GUID-SYS-V4', plannedQty: 20, startDate: '2024-11-05', machineCenter: 'Assembly-Cleanroom', loadFactor: 45, status: 'Scheduled' },
  { id: 'SCH-2024-103', partNumber: 'AL-SHEET-7075', plannedQty: 100, startDate: '2024-10-28', machineCenter: 'Cutting-Bay-1', loadFactor: 92, status: 'Delayed' },
  { id: 'SCH-2024-104', partNumber: 'THRUSTER-NZL-09', plannedQty: 4, startDate: '2024-11-12', machineCenter: '3D-Print-Metal', loadFactor: 60, status: 'In Progress' },
];
