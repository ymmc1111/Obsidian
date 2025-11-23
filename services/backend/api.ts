
import { db } from './db';
import { AuditLogEntry } from '../../types';

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

export const BackendAPI = {
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
  }
};
