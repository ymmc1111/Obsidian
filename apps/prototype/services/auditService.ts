
import { AuditLogEntry } from '../types';
import { BackendAPI } from './backend/api';

class AuditService {
  // Removed local state 'logs'. Now stateless client.

  // Logs are now fetched via subscription to the backend
  subscribe(listener: (logs: AuditLogEntry[]) => void) {
    return BackendAPI.subscribeToLogs(listener);
  }

  logAction(actor: string, action: string, details: string) {
    const timestamp = new Date().toISOString();
    
    // Client-side Hash Generation (to be verified by backend)
    const mockHashInput = `${timestamp}|${actor}|${action}|${details}`;
    const hash = `0x${Math.abs(mockHashInput.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16)}${Math.random().toString(16).substr(2, 6)}`;

    const entryPayload = {
      timestamp,
      actor,
      action,
      details,
      hash
    };
    
    // Async call to Backend API
    BackendAPI.ingestAuditLog(entryPayload)
      .then(response => {
        // Console log for debug visibility in this demo
        // console.debug(`[AuditService] Log committed. ID: ${response.id}`);
      })
      .catch(err => {
        console.error(`[AuditService] Failed to commit log:`, err);
        // In a real app, queue for retry (Offline Mode support)
      });
  }
}

export const auditService = new AuditService();
