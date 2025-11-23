
import { DatabaseSchema } from './schema';
import {
  INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_LOGS,
  INITIAL_FINANCIAL_KPIS, INITIAL_INVOICES, INITIAL_OEE_DATA,
  INITIAL_SCHEDULES, INITIAL_CALIBRATIONS
} from '../mockData';

// Initialize the "PostgreSQL" Mock Database
// This acts as the Single Source of Truth for the Backend Layer

const initializeDB = (): DatabaseSchema => {
  return {
    tbl_inventory: INITIAL_INVENTORY.map(item => ({
      id: item.id,
      partNumber: item.partNumber,
      quantity: item.quantity,
      location: item.location,
      batchLot: item.batchLot,
      unitCost: item.unitCost,
      cui_sensitive: item.sensitivity === 'CUI' || item.sensitivity === 'SECRET',
      status: item.status,
      nomenclature: item.nomenclature,
      cageCode: item.cageCode,
      serialNumber: item.serialNumber
    })),

    tbl_traveler: [{
      id: MOCK_TRAVELER.id,
      partNumber: MOCK_TRAVELER.partNumber,
      currentStepId: `STEP-${MOCK_TRAVELER.currentStepIndex}`, // Mock mapping
      status: MOCK_TRAVELER.status,
      quantity: MOCK_TRAVELER.quantity
    }],

    tbl_traveler_steps_data: MOCK_TRAVELER.steps
      .filter(s => s.completed)
      .map(s => ({
        id: `STEP-DATA-${s.id}`,
        travelerId: MOCK_TRAVELER.id,
        stepId: s.id,
        timestamp: s.timestamp || new Date().toISOString(),
        completedBy_userId: s.completedBy || 'SYSTEM',
        input_value: JSON.stringify(s.inputs || {})
      })),

    tbl_audit_log: INITIAL_LOGS.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      actor_id: log.actor,
      action_type: log.action,
      details: log.details,
      integrity_hash: log.hash
    })),

    tbl_telemetry_traces: [],
    tbl_telemetry_metrics: [],

    // Phase 2 Expansions
    tbl_financial_kpis: INITIAL_FINANCIAL_KPIS,
    tbl_invoices: INITIAL_INVOICES,
    tbl_oee: INITIAL_OEE_DATA,
    tbl_schedules: INITIAL_SCHEDULES,
    tbl_calibrations: INITIAL_CALIBRATIONS
  };
};

export const db = initializeDB();
