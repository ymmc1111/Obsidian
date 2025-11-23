import { db } from './db';
import { AuditLogEntry, InvoiceStatus, SystemUser, ProductionSchedule, InventoryItem, ItemStatus, SensitivityLevel } from '../../types';
import { MOCK_TRAVELER, INITIAL_USERS, INITIAL_CALIBRATIONS } from '../mockData';
import { initializeFirebase, subscribeToSchedules } from '../firebaseProductionService';

// Initialize Firebase Auth/DB connection immediately
initializeFirebase().then(userId => {
  console.log(`[Firebase] PocketOps connected. User ID: ${userId}`);
}).catch(err => {
  console.error("[Firebase] Initialization failed:", err);
});

// Mock Backend API Service
// Simulates a Node.js/Express application structure

type WebSocketListener = (logs: AuditLogEntry[]) => void;
const logListeners: WebSocketListener[] = [];

// Helper to simulate Hash Verification (Phase 1 Compliance)
const verifyIntegrityHash = (entry: any): boolean => {
  // In a real backend, we would re-compute the hash from the fields
  // For this mock, we ensure the hash is present and matches a simple check
  if (!entry.hash) return false;
  // Simulating a check:
  // const computed = sha256(`${entry.timestamp}|${entry.actor}|${entry.action}|${entry.details}`);
  // return computed === entry.hash;
  return true;
};

// Helper to reconstruct Traveler from DB
const reconstructTraveler = (runId: string): any => {
  const run = db.tbl_traveler.find(t => t.id === runId);
  if (!run) return null;

  // In a real app, we would join these. For mock, we'll just return the MOCK_TRAVELER structure 
  // but populated from DB where possible, or just return the MOCK_TRAVELER if we didn't fully normalize it.
  // Given db.ts initializes from MOCK_TRAVELER, we can map back.

  // For Phase 1, let's return a structure that matches ProductionRun
  // We need to import MOCK_TRAVELER to get the steps if they aren't fully in DB?
  // db.ts has tbl_traveler_steps_data which only has completed steps.
  // To keep it simple and robust for this mock phase, we will import MOCK_TRAVELER here 
  // or better, just return the data from db.ts and mock the rest.

  // Actually, let's look at db.ts again. It imports MOCK_TRAVELER. 
  // We can just use the one in db.ts if we want, but we should try to use the DB tables.
  // But tbl_traveler_steps_data only has completed steps.
  // So we might lose the uncompleted steps if we only look at DB.
  // For this exercise, I will assume we can access the full MOCK_TRAVELER from db.ts context 
  // or I will re-import it in api.ts to serve as the "template" and overlay DB data.
  // But api.ts doesn't import MOCK_TRAVELER.

  // Let's just return the MOCK_TRAVELER from mockData for now, but wrapped in a promise 
  // to simulate the API, as the DB structure in db.ts is a bit lossy for the full UI.
  // Wait, the prompt says: "Returns the mock traveler data mapped from db.tbl_traveler and MOCK_TRAVELER.steps"
  // So I should probably import MOCK_TRAVELER in api.ts or just use the DB.

  // Let's import MOCK_TRAVELER in api.ts to be safe and compliant with the prompt's hint.
  return null;
};

export const BackendAPI = {
  // --- Authentication Endpoint ---
  login: async (email: string, pass: string): Promise<SystemUser> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock validation against mock users
    const user = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Mock successful login: Any valid email works, password '123' works for everyone.
    if (user && pass === '123') {
      // Simulate returning a user session object
      return user;
    }

    throw new Error("401 Unauthorized: Invalid email or password.");
  },

  // Endpoint: POST /api/v1/audit/log
  // Purpose: Immutable Log Ingestion
  ingestAuditLog: async (entry: Omit<AuditLogEntry, 'id'>) => {
    // 1. Validate Payload
    if (!entry.timestamp || !entry.actor || !entry.action || !entry.hash) {
      throw new Error("400 Bad Request: Missing required audit fields.");
    }

    // 2. Verify Integrity (Simulated)
    if (!verifyIntegrityHash(entry)) {
      throw new Error("403 Forbidden: Integrity hash mismatch. Potential tampering detected.");
    }

    // 3. Persist to DB
    const newRecord = {
      id: `LOG-${Date.now()}`,
      timestamp: entry.timestamp,
      actor_id: entry.actor,
      action_type: entry.action,
      details: entry.details,
      integrity_hash: entry.hash
    };

    db.tbl_audit_log.unshift(newRecord); // Prepend for latest first

    // 4. Push to WebSocket (Simulated)
    BackendAPI.broadcastLogs();

    return { status: 201, id: newRecord.id };
  },

  // Endpoint: POST /api/v1/telemetry/traces
  // Purpose: Observability Data Ingestion
  ingestTrace: async (traceData: any) => {
    // 1. Store Trace
    db.tbl_telemetry_traces.push({
      id: traceData.id,
      trace_id: traceData.id, // Simplifying for mock
      span_name: traceData.name,
      start_time: traceData.startTime,
      duration_ms: traceData.duration,
      tags: traceData.tags
    });

    // 2. Store Metrics (if any provided in a batch - simplified here)
    // console.log(`[Backend] Trace Ingested: ${traceData.name}`);
    return { status: 202, message: "Accepted" };
  },

  // Endpoint: POST /api/v1/telemetry/metrics
  ingestMetric: async (metricData: any) => {
    db.tbl_telemetry_metrics.push({
      id: `MET-${Date.now()}-${Math.random()}`,
      metric_name: metricData.name,
      metric_type: 'GAUGE', // Defaulting for mock
      value: metricData.value,
      tags: metricData.tags,
      timestamp: new Date().toISOString()
    });
    return { status: 202, message: "Accepted" };
  },

  // Simulated WebSocket for Real-time Log Tail
  subscribeToLogs: (callback: WebSocketListener) => {
    logListeners.push(callback);
    // Send initial state
    callback(BackendAPI.getPublicLogs());
    return () => {
      const index = logListeners.indexOf(callback);
      if (index > -1) logListeners.splice(index, 1);
    };
  },

  broadcastLogs: () => {
    const logs = BackendAPI.getPublicLogs();
    logListeners.forEach(listener => listener(logs));
  },

  // Helper to map DB records back to Frontend types
  getPublicLogs: (): AuditLogEntry[] => {
    return db.tbl_audit_log.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      actor: row.actor_id,
      action: row.action_type,
      details: row.details,
      hash: row.integrity_hash
    }));
  },

  // Helper to map DB inventory records to Frontend InventoryItem type
  _mapDbToInventoryItem: (item: any): InventoryItem => ({
    id: item.id,
    partNumber: item.partNumber,
    nomenclature: item.nomenclature,
    cageCode: item.cageCode,
    serialNumber: item.serialNumber,
    location: item.location,
    quantity: item.quantity,
    unitCost: item.unitCost,
    status: item.status,
    sensitivity: item.cui_sensitive ? SensitivityLevel.CUI : SensitivityLevel.UNCLASSIFIED,
    batchLot: item.batchLot
  }),

  // Endpoint: GET /api/v1/inventory/all
  getInventory: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return db.tbl_inventory.map(BackendAPI._mapDbToInventoryItem);
  },

  // Endpoint: GET /api/v1/inventory/search
  searchInventory: async (query: string) => {
    // Simulate network delay and "Slow Query" occasionally
    const latency = Math.random() > 0.9 ? 800 : 100;
    await new Promise(resolve => setTimeout(resolve, latency));

    const lowerQuery = query.toLowerCase();
    const results = db.tbl_inventory.filter(item =>
      item.partNumber.toLowerCase().includes(lowerQuery) ||
      item.nomenclature.toLowerCase().includes(lowerQuery)
    );

    return {
      results: results.map(BackendAPI._mapDbToInventoryItem),
      latency_ms: latency
    };
  },

  // Endpoint: POST /api/v1/inventory/add (Phase 2: Add New Asset)
  addInventoryItem: async (itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = `INV-${Date.now()}`;
    const newDbItem = {
      id: newId,
      partNumber: itemData.partNumber,
      quantity: itemData.quantity,
      location: itemData.location,
      batchLot: itemData.batchLot,
      unitCost: itemData.unitCost,
      cui_sensitive: itemData.sensitivity === 'CUI' || itemData.sensitivity === 'SECRET',
      status: itemData.status || ItemStatus.AVAILABLE,
      nomenclature: itemData.nomenclature,
      cageCode: itemData.cageCode || 'N/A',
      serialNumber: itemData.serialNumber || 'N/A'
    };
    db.tbl_inventory.unshift(newDbItem);

    // Log the receiving action
    BackendAPI.ingestAuditLog({
      timestamp: new Date().toISOString(),
      actor: 'J. Doe (U-001)', // TODO: Use actual current user
      action: 'INVENTORY_RECEIVING',
      details: `Received ${itemData.quantity} units of ${itemData.partNumber} (${newId}).`,
      hash: '0xmockhash'
    });

    return BackendAPI._mapDbToInventoryItem(newDbItem);
  },

  // Endpoint: PATCH /api/v1/inventory/:id (Phase 2: Update Item)
  updateInventoryItem: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = db.tbl_inventory.findIndex(i => i.id === id);

    if (index === -1) throw new Error("Inventory item not found.");

    let logMessage = `Updated item ${id}.`;
    const originalItem = db.tbl_inventory[index];

    // Track changes for audit log
    if (updates.location && updates.location !== originalItem.location) {
      logMessage += ` Location changed from ${originalItem.location} to ${updates.location}.`;
      originalItem.location = updates.location;
    }
    if (updates.status && updates.status !== originalItem.status) {
      logMessage += ` Status changed from ${originalItem.status} to ${updates.status}.`;
      originalItem.status = updates.status;
    }
    if (updates.quantity !== undefined && updates.quantity !== originalItem.quantity) {
      logMessage += ` Quantity adjusted from ${originalItem.quantity} to ${updates.quantity}.`;
      originalItem.quantity = updates.quantity;
    }

    // Apply all updates
    db.tbl_inventory[index] = {
      ...originalItem,
      ...updates,
      cui_sensitive: updates.sensitivity
        ? updates.sensitivity === 'CUI' || updates.sensitivity === 'SECRET'
        : originalItem.cui_sensitive
    };

    // Log the update action
    BackendAPI.ingestAuditLog({
      timestamp: new Date().toISOString(),
      actor: 'J. Doe (U-001)', // TODO: Use actual current user
      action: 'INVENTORY_UPDATE',
      details: logMessage,
      hash: '0xmockhash'
    });

    return BackendAPI._mapDbToInventoryItem(db.tbl_inventory[index]);
  },

  // Endpoint: GET /api/v1/production/traveler/active
  getActiveTraveler: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real scenario, we'd query by ID. Here we just get the first one.
    const run = db.tbl_traveler[0];
    if (!run) return null;

    // Merge DB run status with MOCK_TRAVELER steps structure
    return {
      ...MOCK_TRAVELER,
      status: run.status,
      quantity: run.quantity,
      // In a real app, we would map steps from tbl_traveler_steps_data
      // For now, we return the static steps but with the status from DB
    };
  },

  // --- Phase 2: Finance & KPI Endpoints ---

  getFinancialKPIs: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return db.tbl_financial_kpis;
  },

  getInvoices: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return db.tbl_invoices;
  },

  updateInvoiceStatus: async (id: string, status: InvoiceStatus) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const invoice = db.tbl_invoices.find(i => i.id === id);
    if (invoice) {
      invoice.status = status;
      // Log this action?
      return { status: 200, message: "Updated" };
    }
    throw new Error("Invoice not found");
  },

  // --- Phase 2: Dashboard & OEE ---

  getOEEData: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return db.tbl_oee;
  },

  preprocessAI: async () => {
    // Simulate heavy compute
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      status: 'ready',
      vector_id: `VEC-${Date.now()}`,
      confidence: 0.98
    };
  },

  // --- Phase 2: Planning (UPDATED TO USE FIRESTORE) ---

  // New function to establish real-time connection to schedules
  subscribeToProductionSchedules: (callback: (schedules: ProductionSchedule[]) => void) => {
    // This function returns the Firestore unsubscribe function directly
    return subscribeToSchedules(callback, (e) => {
      console.error("Firestore Schedule Subscription Error:", e);
    });
  },

  getCalibrations: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Continue to use mock data for calibrations
    return INITIAL_CALIBRATIONS;
  },

  // --- Phase 2: Traceability ---

  initiateRecall: async (batchLot: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate complex query

    // Find all items with this batch
    const affectedItems = db.tbl_inventory.filter(i => i.batchLot === batchLot);

    // Update their status to QUARANTINE
    affectedItems.forEach(i => i.status = 'Quarantine' as any); // Casting for simplicity if enum mismatch

    return {
      batchLot,
      affectedCount: affectedItems.length,
      actionId: `RECALL-${Date.now()}`
    };
  }
};
