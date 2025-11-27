# Operation Obsidian - Documentation Index

Complete documentation for Operation Obsidian Industrial IoT + AI Platform.

---

## 📚 Quick Links

- [Main README](../README.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)
- [Completion Checklist](../COMPLETION_CHECKLIST.md)

---

## 👥 User Guides

### Getting Started
- [Authentication & Authorization](user-guides/authentication.md) - Login, roles, two-person rule
- [Inventory Management](user-guides/inventory.md) - Track parts, QR scanning, offline mode
- [Telemetry Monitoring](user-guides/telemetry.md) - Real-time machine monitoring
- [AI Predictive Maintenance](user-guides/ai.md) - Understanding predictions and risk levels

### Advanced Features
- QR/Barcode Scanning
- Offline-First Operation
- Approval Workflows
- Science Lab Analytics

---

## 💻 Developer Guides

### Architecture
- [System Architecture](developer-guides/architecture.md)
- [Database Schema](developer-guides/schema.md)
- [Security Model](developer-guides/security.md)

### Development
- [Local Development Setup](developer-guides/development.md)
- [Contributing Guidelines](developer-guides/contributing.md)
- [Code Style Guide](developer-guides/code-style.md)

### ML/AI
- [ML Pipeline](../apps/ml-pipeline/README.md) - Training, evaluation, deployment
- [Feature Engineering](developer-guides/features.md)
- [Model Registry](developer-guides/mlflow.md)

---

## 🔌 API Reference

### REST APIs
- [API Core (NestJS)](api-reference/api.md) - Authentication, inventory, ledger
- [AI Service (FastAPI)](api-reference/api.md#ai-service-fastapi) - Predictions, training

### Real-Time
- [WebSocket API](api-reference/websockets.md) - Telemetry streaming
- [MQTT Protocol](api-reference/mqtt.md) - Machine data ingestion

### Authentication
- [JWT Tokens](api-reference/authentication.md)
- [Role-Based Access Control](api-reference/rbac.md)

---

## 🚀 Deployment

### Getting Started
- [Quick Start](../README.md#quick-start) - Run locally in 5 minutes
- [Docker Compose](deployment/docker-compose.md) - Single server deployment
- [Kubernetes](deployment/production.md) - Production deployment

### Infrastructure
- [Database Setup](deployment/database.md)
- [SSL/TLS Configuration](deployment/ssl.md)
- [Monitoring & Alerting](deployment/monitoring.md)

### Operations
- [Backup & Recovery](deployment/backup.md)
- [Scaling Guide](deployment/scaling.md)
- [Disaster Recovery](deployment/disaster-recovery.md)

---

## 🔧 Troubleshooting

### Common Issues
- [Authentication Problems](troubleshooting/common-issues.md#authentication-issues)
- [Database Issues](troubleshooting/common-issues.md#database-issues)
- [Service Issues](troubleshooting/common-issues.md#service-issues)
- [AI/ML Issues](troubleshooting/common-issues.md#aiml-issues)
- [Performance Issues](troubleshooting/common-issues.md#performance-issues)

### Platform-Specific
- [Docker Troubleshooting](troubleshooting/common-issues.md#docker-issues)
- [Kubernetes Troubleshooting](troubleshooting/common-issues.md#kubernetes-issues)

### Getting Help
- [Debug Information Collection](troubleshooting/common-issues.md#collect-debug-information)
- [Contact Support](troubleshooting/common-issues.md#contact-support)

---

## 📖 Concepts

### Security
- **Zero-Trust Architecture**: Assume breach, verify everything
- **Immutable Ledger**: Append-only audit log with hash chaining
- **Double-Signature**: Two-person rule for critical actions
- **FIPS Compliance**: Ed25519 signatures, SHA-256 hashing

### Data Architecture
- **Medallion Architecture**: Bronze → Silver → Gold data layers
- **OLTP vs OLAP**: Transactional vs analytical databases
- **Time-Series**: Optimized storage for telemetry data
- **Feature Store**: ML-ready aggregated metrics

### AI/ML
- **Isolation Forest**: Unsupervised anomaly detection
- **Random Forest**: Supervised failure prediction
- **MLflow**: Experiment tracking and model registry
- **Optuna**: Automated hyperparameter tuning

---

## 🎓 Tutorials

### Beginner
1. [First Login](tutorials/first-login.md)
2. [Scanning Your First Part](tutorials/first-scan.md)
3. [Understanding Telemetry](tutorials/understanding-telemetry.md)

### Intermediate
1. [Working Offline](tutorials/offline-workflow.md)
2. [Approval Workflows](tutorials/approval-workflow.md)
3. [Interpreting AI Predictions](tutorials/ai-predictions.md)

### Advanced
1. [Training Custom Models](tutorials/custom-models.md)
2. [Extending the API](tutorials/api-extension.md)
3. [Custom Dashboards](tutorials/custom-dashboards.md)

---

## 📊 Reference

### Configuration
- [Environment Variables](reference/environment-variables.md)
- [Configuration Files](reference/configuration-files.md)
- [Feature Flags](reference/feature-flags.md)

### Data Models
- [Database Schema](reference/schema.md)
- [API Models](reference/api-models.md)
- [Event Types](reference/event-types.md)

### Metrics
- [System Metrics](reference/metrics.md)
- [Business Metrics](reference/business-metrics.md)
- [ML Metrics](reference/ml-metrics.md)

---

## 🔐 Security

### Best Practices
- [Password Management](security/passwords.md)
- [Session Security](security/sessions.md)
- [Data Protection](security/data-protection.md)

### Compliance
- [FIPS 140-2](security/fips.md)
- [Audit Logging](security/audit-logging.md)
- [Access Control](security/access-control.md)

### Incident Response
- [Security Incidents](security/incident-response.md)
- [Data Breaches](security/breach-response.md)
- [Recovery Procedures](security/recovery.md)

---

## 🎯 Use Cases

### Manufacturing
- [Inventory Tracking](use-cases/inventory-tracking.md)
- [Quality Control](use-cases/quality-control.md)
- [Predictive Maintenance](use-cases/predictive-maintenance.md)

### Operations
- [Shop Floor Monitoring](use-cases/shop-floor.md)
- [Compliance Reporting](use-cases/compliance.md)
- [Performance Analytics](use-cases/analytics.md)

---

## 🛠️ Tools

### Included Tools
- **MLflow**: http://localhost:5000 - Model registry
- **Science Lab**: http://localhost:8501 - Analytics dashboard
- **MinIO Console**: http://localhost:9001 - Object storage

### External Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **pgAdmin**: Database management

---

## 📝 Release Notes

### Version 1.0.0 (Current)
- ✅ Complete security implementation
- ✅ Offline-first architecture
- ✅ AI predictive maintenance
- ✅ ML training pipeline
- ✅ Production deployment ready

### Roadmap
- Phase 9: Mobile App (React Native)
- Phase 10: Multi-Site Deployment
- Advanced Analytics
- Deep Learning Models

---

## 🤝 Contributing

### For Developers
- [Development Setup](developer-guides/development.md)
- [Code Style](developer-guides/code-style.md)
- [Pull Request Process](developer-guides/pull-requests.md)

### For Users
- [Feature Requests](contributing/feature-requests.md)
- [Bug Reports](contributing/bug-reports.md)
- [Documentation Improvements](contributing/documentation.md)

---

## 📞 Support

### Community
- GitHub Issues: [Report bugs](https://github.com/ymmc1111/Obsidian/issues)
- Discussions: [Ask questions](https://github.com/ymmc1111/Obsidian/discussions)

### Enterprise
- Email: support@example.com
- Phone: +1-XXX-XXX-XXXX
- SLA: 24/7 support available

---

## 📜 License

MIT License - See [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- Next.js, React, NestJS
- PostgreSQL, TimescaleDB, ClickHouse
- MLflow, scikit-learn, Optuna
- Docker, Kubernetes

---

**Last Updated**: 2025-11-27
**Version**: 1.0.0
**Status**: Production Ready
