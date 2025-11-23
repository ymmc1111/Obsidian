import {
  InventoryItem, ItemStatus, SensitivityLevel, AuditLogEntry, ProductionRun,
  Vendor, PurchaseOrder, PurchaseOrderStatus, Invoice, InvoiceStatus, SalesOrder, SalesOrderStatus,
  SystemUser, UserRole, ProductionSchedule, CertificateOfConformance, ComplianceMode,
  CAPAEntry, ValidationDocument, CalibrationRecord, EnvironmentalLog, FinancialKPI, OEEData
} from '../types';

// Helper function to generate a date string offset from a start date
const getDateOffset = (startDate: Date, days: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Function to generate 3 months of diverse production schedules
const generateSchedules = (): ProductionSchedule[] => {
  const schedules: ProductionSchedule[] = [];
  const partNumbers = ['XB-70-TI', 'GUID-SYS-V4', 'THRUSTER-NZL-09', 'ELEC-CTRL-PCB', 'FRAME-ASSY-S2'];
  const machineCenters = ['CNC-Lathe-A', 'Assembly-Cleanroom', 'Cutting-Bay-1', '3D-Print-Metal', 'Laser-Engrave-B'];
  const statuses = ['Scheduled', 'Scheduled', 'In Progress', 'Delayed', 'Completed'];

  // Start date is Sept 28, 2024, to cover Oct, Nov, Dec
  const runStart = new Date('2024-09-28');

  // Generate 18 schedules spanning the three months
  for (let i = 1; i <= 18; i++) {
    // Spread dates out by ~5 days + random offset
    const offsetDays = Math.floor(i * 5 + Math.random() * 3);
    const startDate = getDateOffset(runStart, offsetDays);
    const plannedQty = Math.round(Math.random() * 500) + 50; // 50 to 550 units
    const loadFactor = Math.floor(Math.random() * 40) + 55; // 55% to 95%

    let status = statuses[i % statuses.length];

    // Logic to ensure realism: Older items should often be 'Completed'
    if (offsetDays < 35) { // Schedules in Oct
      status = 'Completed';
    }
    // More recent items should be 'Scheduled' or 'In Progress'
    if (offsetDays > 80 && status === 'Completed') { // Schedules in Dec
      status = 'Scheduled';
    }
    // Introduce a specific delay case
    if (i === 15) {
      status = 'Delayed';
    }

    schedules.push({
      id: `SCH-2024-${100 + i}`,
      partNumber: partNumbers[i % partNumbers.length],
      plannedQty: plannedQty,
      startDate: startDate,
      machineCenter: machineCenters[i % machineCenters.length],
      loadFactor: status === 'Completed' ? 100 : loadFactor,
      status: status as 'Scheduled' | 'Delayed' | 'In Progress',
    });
  }

  return schedules;
};


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

export const INITIAL_SCHEDULES: ProductionSchedule[] = generateSchedules(); // <-- REPLACED WITH GENERATED DATA

export const generateCoC = (salesOrderId: string, mode: ComplianceMode = ComplianceMode.DEFENCE): CertificateOfConformance => {
  const order = INITIAL_ORDERS.find(o => o.id === salesOrderId);
  const traceItem = INITIAL_INVENTORY.find(i => i.id === 'INV-002'); // Mock trace

  let statement = 'Product conforms to AS9100D and meets all ITAR requirements.';

  if (mode === ComplianceMode.PHARMA_US) {
    statement = 'Product conforms to FDA 21 CFR Part 11 and GxP standards.';
  } else if (mode === ComplianceMode.PHARMA_EU) {
    statement = 'Product conforms to EU GMP Annex 11 requirements.';
  } else if (mode === ComplianceMode.GCAP) {
    statement = 'Product conforms to Global Compliance & Audit Protocols.';
  }

  return {
    id: `COC-${Math.floor(Math.random() * 10000)}`,
    salesOrderId: salesOrderId,
    partNumber: 'ASM-THRUSTER-NOZZLE', // Mock
    quantityShipped: 1, // Mock
    finalInspectionStatus: 'Passed',
    digitalSignature: `SIG-RSA-4096-${Math.floor(Math.random() * 99999)}`,
    rawMaterialTrace: [
      { item: traceItem?.nomenclature || 'Raw Material', lotNumber: traceItem?.batchLot || 'LOT-UNKNOWN', vendorCage: traceItem?.cageCode || 'UNKNOWN' }
    ],
    complianceStatement: statement,
    complianceMode: mode
  };
};

export const INITIAL_CAPAS: CAPAEntry[] = [
  { id: 'CAPA-101', description: 'Heat treat oven deviation', status: 'Closed', deviationType: 'Equipment', priority: 'Medium', createdBy: 'U-003' },
  { id: 'CAPA-102', description: 'Material cert missing signature', status: 'Investigation', deviationType: 'Process', priority: 'High', createdBy: 'U-002' }
];

export const INITIAL_VALIDATIONS: ValidationDocument[] = [
  { id: 'VAL-001', name: 'Autoclave Cycle B', type: 'PQ', status: 'Valid', nextReviewDate: '2025-01-15' },
  { id: 'VAL-002', name: 'Cleanroom HVAC', type: 'OQ', status: 'Review Needed', nextReviewDate: '2024-11-20' },
  { id: 'VAL-003', name: 'ERP E-Sig Module', type: 'IQ', status: 'Valid', nextReviewDate: '2025-06-01' }
];

export const INITIAL_CALIBRATIONS: CalibrationRecord[] = [
  { id: 'CAL-991', instrumentId: 'Digital Caliper #44', nextCalibration: '2024-12-01', lastCalibration: '2023-12-01', status: 'Valid' },
  { id: 'CAL-992', instrumentId: 'Temp Sensor Z-1', nextCalibration: '2024-10-30', lastCalibration: '2023-10-30', status: 'Expiring Soon' },
  { id: 'CAL-993', instrumentId: 'Flow Meter FM-02', nextCalibration: '2025-03-15', lastCalibration: '2024-03-15', status: 'Valid' }
];

export const INITIAL_ENVIRONMENTAL_LOGS: EnvironmentalLog[] = [
  { id: 'ENV-001', location: 'Cleanroom A', sensorId: 'SENS-01', metric: 'Temp', value: '21.4°C', timestamp: new Date().toISOString(), alertLevel: 'Nominal' },
  { id: 'ENV-002', location: 'Cleanroom A', sensorId: 'SENS-02', metric: 'Humidity', value: '42%', timestamp: new Date().toISOString(), alertLevel: 'Nominal' },
  { id: 'ENV-003', location: 'Storage B', sensorId: 'SENS-03', metric: 'Temp', value: '18.1°C', timestamp: new Date().toISOString(), alertLevel: 'Warning' },
];

export const INITIAL_FINANCIAL_KPIS: FinancialKPI[] = [
  { name: 'Gross Revenue (YTD)', value: 1250000, trend: '+12%', type: 'PL' },
  { name: 'Cost of Goods (COGS)', value: 480000, trend: '-2%', type: 'PL' },
  { name: 'Net Profit Margin', value: 24.5, trend: '+1.5%', type: 'PL' },
  { name: 'Current Ratio', value: 1.8, trend: 'stable', type: 'BS' },
  { name: 'Debt-to-Equity', value: 0.45, trend: '-0.05', type: 'BS' },
];

export const INITIAL_OEE_DATA: OEEData[] = [
  { machineId: 'CNC-Lathe-A', availability: 92, performance: 88, quality: 99, status: 'Running', alerts: 0 },
  { machineId: 'Milling-Center-5', availability: 45, performance: 0, quality: 0, status: 'Down', alerts: 3 },
  { machineId: 'Assembly-Bot-2', availability: 98, performance: 95, quality: 99.5, status: 'Running', alerts: 0 },
];