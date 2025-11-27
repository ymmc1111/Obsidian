# User Guide: Telemetry Monitoring

## Overview

Real-time monitoring of machine telemetry data from the factory floor.

---

## Accessing Telemetry Dashboard

Navigate to:
```
http://localhost:3000/telemetry
```

---

## Dashboard Overview

### Connection Status

Top-right indicator:
- **● STREAMING**: Live data flowing
- **● DISCONNECTED**: No telemetry data

### Machine Cards

Each machine displays:
- **Machine ID**: CNC-01, MILL-01, etc.
- **Status Badge**: NOMINAL, WARNING, or CRITICAL
- **Metrics**: Temperature, vibration, spindle speed, power
- **Last Update**: Timestamp of latest reading

---

## Understanding Metrics

### Temperature
- **Unit**: °C (Celsius)
- **Normal Range**: 180-200°C
- **Warning**: 200-210°C (yellow)
- **Critical**: >210°C (red)

**What It Means**:
- High temperature indicates overheating
- May require cooling system check
- Critical levels require immediate shutdown

### Vibration
- **Unit**: mm/s (millimeters per second)
- **Normal Range**: 0.5-2.0 mm/s
- **Warning**: 2.0-2.5 mm/s
- **Critical**: >2.5 mm/s

**What It Means**:
- High vibration indicates mechanical issues
- May indicate bearing wear or imbalance
- Critical levels risk equipment damage

### Spindle Speed
- **Unit**: RPM (revolutions per minute)
- **Normal Range**: 3000-4000 RPM
- **Display**: Current speed

**What It Means**:
- Operating speed of cutting tool
- Varies based on operation
- Monitored for consistency

### Power Consumption
- **Unit**: kW (kilowatts)
- **Normal Range**: 15-25 kW
- **Display**: Current draw

**What It Means**:
- Electrical power usage
- Spikes may indicate issues
- Used for efficiency monitoring

---

## Status Levels

### NOMINAL (Green)
- ✅ All metrics within normal range
- ✅ Machine operating correctly
- **Action**: Continue normal operation

### WARNING (Yellow)
- ⚠️ One or more metrics elevated
- ⚠️ Approaching critical thresholds
- **Action**: Monitor closely, schedule inspection

### CRITICAL (Red)
- 🚨 Metrics exceed safe limits
- 🚨 Immediate attention required
- **Action**: Stop operation, investigate immediately

---

## Real-Time Updates

### Auto-Refresh
- Data updates every 2 seconds
- No manual refresh needed
- Live WebSocket connection

### Historical View
- Last update timestamp shown
- Trends visible in progress bars
- For detailed history, use Science Lab

---

## Responding to Alerts

### WARNING Status

1. **Note the Machine ID**
2. **Check Specific Metric** (temperature, vibration, etc.)
3. **Monitor for 5 Minutes**
   - If it returns to normal: Continue
   - If it persists: Schedule inspection
4. **Log the Event** in maintenance system

### CRITICAL Status

1. **STOP OPERATION IMMEDIATELY**
2. **Note Machine ID and Metrics**
3. **Notify Maintenance Team**
4. **Do Not Restart** until inspected
5. **Document in Incident Report**

---

## Best Practices

### Monitoring
- ✅ Check dashboard at shift start
- ✅ Monitor during critical operations
- ✅ Respond to alerts immediately
- ✅ Log all anomalies

### Communication
- ✅ Report issues to supervisor
- ✅ Document all incidents
- ✅ Share patterns with maintenance
- ✅ Update after repairs

### Safety
- ✅ Never ignore CRITICAL alerts
- ✅ Follow lockout/tagout procedures
- ✅ Verify repairs before restart
- ✅ Keep area clear during issues

---

## Troubleshooting

### "DISCONNECTED" Status
- **Cause**: Telemetry service offline or network issue
- **Solution**: 
  1. Check network connection
  2. Verify telemetry service is running
  3. Contact IT if persists

### No Data for Machine
- **Cause**: Machine offline or sensor failure
- **Solution**:
  1. Verify machine is powered on
  2. Check sensor connections
  3. Restart telemetry service

### Erratic Readings
- **Cause**: Sensor malfunction or interference
- **Solution**:
  1. Note the pattern
  2. Compare with physical observation
  3. Report to maintenance

### Delayed Updates
- **Cause**: Network congestion or high load
- **Solution**:
  1. Check network status
  2. Refresh browser
  3. Contact IT if persists

---

## Integration with AI

The telemetry data feeds into the AI predictive maintenance system.

**See**: [AI Predictions Guide](ai.md) for how this data is used to predict failures.

---

## FAQ

**Q: How often does data update?**
A: Every 2 seconds via WebSocket connection.

**Q: Can I see historical data?**
A: Yes, use the Science Lab dashboard for historical analysis.

**Q: What if I see conflicting readings?**
A: Trust the dashboard. If in doubt, verify physically and report discrepancy.

**Q: Can I export telemetry data?**
A: Yes, contact administrator for data export from TimescaleDB.

**Q: Why are some machines missing?**
A: They may be offline or not sending telemetry. Check machine status.

---

## Next Steps

- [AI Predictions Guide](ai.md)
- [Science Lab Guide](science-lab.md)
- [Maintenance Procedures](maintenance.md)
