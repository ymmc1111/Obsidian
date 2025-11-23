import { AuditLogEntry } from '../types';
import { INITIAL_LOGS } from './mockData';

class AuditService {
  private logs: AuditLogEntry[] = [...INITIAL_LOGS];
  private listeners: ((logs: AuditLogEntry[]) => void)[] = [];

  getLogs() {
    return this.logs;
  }

  logAction(actor: string, action: string, details: string) {
    const timestamp = new Date().toISOString();
    // Simulate a blockchain/integrity hash
    const mockHashInput = `${timestamp}|${actor}|${action}|${details}`;
    const hash = `0x${Math.abs(mockHashInput.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16)}${Math.random().toString(16).substr(2, 6)}`;

    const newEntry: AuditLogEntry = {
      id: `LOG-${Math.floor(Date.now() / 1000)}`,
      timestamp,
      actor,
      action,
      details,
      hash
    };
    
    // Add to beginning of array for UI streams
    this.logs = [newEntry, ...this.logs];
    this.notify();
  }

  subscribe(listener: (logs: AuditLogEntry[]) => void) {
    this.listeners.push(listener);
    // Initial callback
    listener(this.logs);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.logs));
  }
}

export const auditService = new AuditService();