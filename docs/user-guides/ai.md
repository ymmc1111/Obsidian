# User Guide: AI Predictive Maintenance

## Overview

AI-powered system that predicts equipment failures before they happen using machine learning.

---

## Accessing AI Dashboard

Navigate to:
```
http://localhost:3000/ai
```

---

## How It Works

### Machine Learning Pipeline

1. **Data Collection**: Telemetry data from machines
2. **Feature Engineering**: Extract patterns (40+ features)
3. **Anomaly Detection**: Isolation Forest algorithm
4. **Risk Assessment**: Calculate failure probability
5. **Recommendations**: Generate maintenance actions

### Models Used

**Isolation Forest** (Unsupervised):
- Detects unusual patterns
- No failure history required
- Identifies anomalies in real-time

**Random Forest** (Supervised):
- Predicts specific failure modes
- Trained on historical failures
- Higher accuracy with more data

---

## Understanding Predictions

### Risk Levels

#### LOW (Green)
- **Meaning**: Normal operation
- **Probability**: <10% failure risk
- **Action**: Continue normal operation
- **Recommendation**: "NOMINAL - Continue normal operation"

#### MEDIUM (Yellow)
- **Meaning**: Unusual pattern detected
- **Probability**: 10-40% failure risk
- **Action**: Monitor closely
- **Recommendation**: "CAUTION - Monitor closely, schedule inspection within 1 week"

#### HIGH (Orange)
- **Meaning**: Significant anomaly
- **Probability**: 40-70% failure risk
- **Action**: Urgent attention needed
- **Recommendation**: "URGENT - Schedule maintenance within 24 hours"

#### CRITICAL (Red)
- **Meaning**: Imminent failure likely
- **Probability**: >70% failure risk
- **Action**: Immediate shutdown
- **Recommendation**: "IMMEDIATE SHUTDOWN REQUIRED - Schedule emergency maintenance"

---

## Dashboard Components

### Machine Cards

Each prediction shows:
- **Machine ID**: CNC-01, MILL-01, etc.
- **Risk Level**: Color-coded badge
- **Anomaly Status**: ⚠️ if detected
- **Anomaly Score**: -1.0 to 0.0 (lower = more anomalous)
- **Current Metrics**: Latest sensor readings
- **Recommendation**: Specific action to take
- **Last Update**: Timestamp of prediction

### Anomaly Score

**Understanding the Score**:
- **0.0 to -0.2**: Normal operation
- **-0.2 to -0.5**: Slight anomaly (monitor)
- **-0.5 to -0.8**: Significant anomaly (urgent)
- **< -0.8**: Severe anomaly (critical)

**Progress Bar**:
- Green: Normal
- Red: Anomalous

---

## Taking Action

### LOW Risk
1. **Continue Operation**: No action needed
2. **Regular Maintenance**: Follow schedule
3. **Monitor**: Check dashboard periodically

### MEDIUM Risk
1. **Increase Monitoring**: Check every hour
2. **Schedule Inspection**: Within 1 week
3. **Document**: Log the anomaly
4. **Prepare**: Have parts ready if needed

### HIGH Risk
1. **Urgent Inspection**: Within 24 hours
2. **Notify Maintenance**: Immediate alert
3. **Reduce Load**: If possible, slow operation
4. **Prepare Downtime**: Schedule maintenance window

### CRITICAL Risk
1. **STOP OPERATION**: Immediately
2. **Emergency Maintenance**: Call team now
3. **Lockout/Tagout**: Follow safety procedures
4. **Root Cause Analysis**: Investigate thoroughly
5. **Document**: Complete incident report

---

## Refresh Analysis

**Manual Refresh**:
- Click **REFRESH ANALYSIS** button
- Runs predictions on all machines
- Takes 5-10 seconds
- Use when you want latest predictions

**Auto-Refresh**:
- Dashboard updates every 30 seconds
- No action needed
- Ensures current data

---

## Understanding Recommendations

### "Continue normal operation"
- Machine is healthy
- No action required
- Maintain regular schedule

### "Monitor closely, schedule inspection within 1 week"
- Potential issue developing
- Not urgent, but don't ignore
- Plan inspection during next maintenance window

### "Schedule maintenance within 24 hours"
- Issue detected that needs attention
- Failure likely within days
- Prioritize this machine

### "IMMEDIATE SHUTDOWN REQUIRED"
- Failure imminent
- Continued operation risks damage
- Stop now, investigate immediately

---

## Best Practices

### Daily Routine
1. **Check Dashboard**: At shift start
2. **Review Predictions**: Note any changes
3. **Act on Alerts**: Follow recommendations
4. **Document**: Log all actions taken

### Responding to Predictions
- ✅ Take recommendations seriously
- ✅ Act promptly on HIGH/CRITICAL
- ✅ Document all maintenance
- ✅ Provide feedback on accuracy
- ❌ Don't ignore warnings
- ❌ Don't delay critical actions

### Improving Accuracy
- ✅ Report false positives
- ✅ Log actual failures
- ✅ Maintain sensor calibration
- ✅ Keep data clean

---

## Model Performance

### How Models Learn

**Training**:
- Models retrain daily at 2 AM
- Use last 30 days of data
- Hyperparameters optimized automatically
- Best model deployed automatically

**Improvement Over Time**:
- More data = better predictions
- False positives decrease
- Accuracy increases
- Recommendations improve

### Viewing Model Details

Access MLflow UI:
```
http://localhost:5000
```

See:
- Model performance metrics
- Training history
- Feature importance
- Experiment comparisons

---

## Troubleshooting

### No Predictions Available
- **Cause**: Insufficient data (need 1000+ samples)
- **Solution**: Run simulator longer, wait for data collection

### All Machines Show LOW
- **Cause**: No anomalies detected (good!)
- **Solution**: This is normal. Continue monitoring.

### Predictions Seem Wrong
- **Cause**: Model needs more training data
- **Solution**: 
  1. Report the issue
  2. Provide feedback
  3. Wait for next training cycle

### Dashboard Not Updating
- **Cause**: AI service offline
- **Solution**:
  1. Check AI service status
  2. Restart if needed
  3. Contact IT

---

## FAQ

**Q: How accurate are the predictions?**
A: Accuracy improves over time. Typically 80-90% after 1 month of data.

**Q: Can I trust CRITICAL alerts?**
A: Yes. Better safe than sorry. Always investigate CRITICAL alerts.

**Q: What if prediction was wrong?**
A: Report it. This helps the model learn and improve.

**Q: How far in advance can it predict failures?**
A: Typically 24-72 hours, depending on failure type.

**Q: Does it replace regular maintenance?**
A: No. It supplements regular maintenance with early warnings.

**Q: Can I see why it made a prediction?**
A: Yes. Check "Current Metrics" and "Anomaly Score" for clues.

---

## Next Steps

- [Telemetry Monitoring Guide](telemetry.md)
- [Science Lab Guide](science-lab.md)
- [ML Pipeline Documentation](../developer-guides/ml-pipeline.md)
