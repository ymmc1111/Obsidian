
import { INITIAL_OEE_DATA, INITIAL_CALIBRATIONS, INITIAL_VALIDATIONS } from './mockData';
import { telemetryService } from './telemetryService';
import { auditService } from './auditService';

/**
 * Monitoring Service (The Infrastructure Layer)
 * Handles periodic health checks, IoT asset telemetry, and compliance expiration alerting.
 */
export const monitoringService = {
  runHealthChecks: () => {
    console.log('[Monitoring] Running System Health Checks...');

    // 1. IoT/OEE Asset Telemetry
    INITIAL_OEE_DATA.forEach(machine => {
      const tags = { machineId: machine.machineId };
      
      // Report Component Metrics (Prometheus Gauges)
      telemetryService.recordMetric('oee_availability', machine.availability, tags);
      telemetryService.recordMetric('oee_performance', machine.performance, tags);
      telemetryService.recordMetric('oee_quality', machine.quality, tags);

      // Alerting Logic: High Priority Availability Drop
      if (machine.status === 'Down' || machine.availability < 80) {
        const msg = `CRITICAL: Machine ${machine.machineId} status is ${machine.status} (Avail: ${machine.availability}%).`;
        
        // Log to immutable Audit Trail
        auditService.logAction('SYS_WATCHDOG', 'ASSET_ALERT', msg);
        
        // Trigger Telemetry Alert
        telemetryService.incrementCounter('system_alert_triggered', { 
            source: 'oee_monitor', 
            severity: 'high', 
            machineId: machine.machineId 
        });
      }
    });

    // 2. Compliance Expiration Monitoring
    // Check for Overdue Calibrations
    INITIAL_CALIBRATIONS.forEach(cal => {
      if (cal.status === 'Overdue') {
        const msg = `Compliance Lapse: Calibration overdue for instrument ${cal.instrumentId}`;
        auditService.logAction('SYS_COMPLIANCE', 'COMPLIANCE_LAPSE', msg);
        telemetryService.incrementCounter('system_alert_triggered', { source: 'calibration', severity: 'critical', id: cal.id });
      }
    });

    // Check for Expired Validation Docs
    INITIAL_VALIDATIONS.forEach(val => {
      if (val.status === 'Expired') {
        const msg = `Compliance Lapse: Validation document ${val.name} has expired.`;
        auditService.logAction('SYS_COMPLIANCE', 'COMPLIANCE_LAPSE', msg);
        telemetryService.incrementCounter('system_alert_triggered', { source: 'validation', severity: 'critical', id: val.id });
      }
    });
  }
};
