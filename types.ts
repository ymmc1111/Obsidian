

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

export enum InvoiceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED'
}

export enum SalesOrderStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  BACKORDERED = 'BACKORDERED'
}

export enum UserRole {
  ADMIN = 'Admin',
  FINANCIAL_OFFICER = 'Financial Officer',
  QUALITY_INSPECTOR = 'Quality Inspector',
  PRODUCTION_OPERATOR = 'Production Operator',
  LOGISTICS_SPECIALIST = 'Logistics Specialist'
}

export enum ComplianceMode {
  DEFENCE = 'DEFENCE',
  PHARMA_US = 'PHARMA_US',
  PHARMA_EU = 'PHARMA_EU',
  GCAP = 'GCAP'
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

export interface Vendor {
  id: string;
  name: string;
  cageCode: string;
  contact: string;
  status: 'Active' | 'On Hold';
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  date: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  items: { partNumber: string; qty: number; unitCost: number }[];
}

export interface ReceivingSlip {
  id: string;
  poId: string;
  date: string;
  matchStatus: 'Pending' | 'Complete' | 'Mismatched';
}

export interface Invoice {
  id: string;
  poId: string;
  vendorId: string;
  date: string;
  amountDue: number;
  status: InvoiceStatus;
  glAccount: string;
}

export interface SalesOrder {
  id: string;
  customer: string;
  date: string;
  totalAmount: number;
  status: SalesOrderStatus;
  fulfillmentLocation: string;
  backorderedItems: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Locked';
  lastActive: string;
}

export interface ProductionSchedule {
  id: string;
  partNumber: string;
  plannedQty: number;
  startDate: string;
  machineCenter: string;
  loadFactor: number; // 0-100 percentage
  status: 'Scheduled' | 'Delayed' | 'In Progress';
}

export interface CertificateOfConformance {
    id: string;
    salesOrderId: string;
    partNumber: string;
    quantityShipped: number;
    finalInspectionStatus: 'Passed' | 'Failed';
    digitalSignature: string; 
    rawMaterialTrace: { item: string; lotNumber: string; vendorCage: string }[];
    complianceStatement: string;
    complianceMode: ComplianceMode;
}

export interface CAPAEntry {
  id: string;
  description: string;
  status: 'Open' | 'Investigation' | 'Closed';
  deviationType: string;
  priority: 'High' | 'Medium';
  createdBy: string;
}

export interface ValidationDocument {
  id: string;
  name: string;
  type: 'IQ' | 'OQ' | 'PQ' | 'SOP';
  status: 'Valid' | 'Review Needed' | 'Expired';
  nextReviewDate: string;
}

export interface CalibrationRecord {
  id: string;
  instrumentId: string;
  nextCalibration: string;
  lastCalibration: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Overdue' | 'Calibrated';
}

export interface EnvironmentalLog {
  id: string;
  location: string;
  sensorId: string;
  metric: 'Temp' | 'Humidity' | 'Pressure';
  value: string;
  timestamp: string;
  alertLevel: 'Nominal' | 'Warning' | 'Critical';
}

export interface FinancialKPI {
  name: string;
  value: number;
  trend: string;
  type: 'PL' | 'BS'; // P&L or Balance Sheet
}

export interface OEEData {
  machineId: string;
  availability: number;
  performance: number;
  quality: number;
  status: 'Running' | 'Down';
  alerts: number;
}