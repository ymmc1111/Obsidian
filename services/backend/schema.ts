import {
  ItemStatus, SensitivityLevel, FinancialKPI, Invoice,
  OEEData, ProductionSchedule, CalibrationRecord, Vendor, PurchaseOrder
} from '../../types';

// Core Data Schema (PostgreSQL Mock)

export interface TblInventory {
  id: string; // PK
  partNumber: string;
  quantity: number;
  location: string;
  batchLot: string;
  unitCost: number;
  cui_sensitive: boolean;
  status: ItemStatus;
  nomenclature: string;
  cageCode: string;
  serialNumber: string;
}

export interface TblTraveler {
  id: string; // PK
  partNumber: string;
  currentStepId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'HALTED';
  quantity: number;
}

export interface TblTravelerStepsData {
  id: string; // PK
  travelerId: string; // FK
  stepId: string; // FK
  timestamp: string;
  completedBy_userId: string; // FK
  input_value: string; // JSON string for flexibility
}

export interface TblAuditLog {
  id: string; // PK
  timestamp: string;
  actor_id: string;
  action_type: string;
  details: string;
  integrity_hash: string;
}

export interface TblTelemetryTrace {
  id: string; // PK
  trace_id: string;
  span_name: string;
  start_time: number;
  duration_ms: number;
  tags: Record<string, string>;
}

export interface TblTelemetryMetric {
  id: string; // PK
  metric_name: string;
  metric_type: 'COUNTER' | 'GAUGE';
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}

export interface DatabaseSchema {
  tbl_inventory: TblInventory[];
  tbl_traveler: TblTraveler[];
  tbl_traveler_steps_data: TblTravelerStepsData[];
  tbl_audit_log: TblAuditLog[];
  tbl_telemetry_traces: TblTelemetryTrace[];
  tbl_telemetry_metrics: TblTelemetryMetric[];

  // Phase 2
  tbl_financial_kpis: FinancialKPI[];
  tbl_invoices: Invoice[];
  tbl_oee: OEEData[];
  tbl_schedules: ProductionSchedule[];
  tbl_calibrations: CalibrationRecord[];

  // Phase 3 Procurement (Added)
  tbl_vendors: Vendor[];
  tbl_purchase_orders: PurchaseOrder[];
}