# Operation Obsidian

**A Zero-Trust, AI-Powered Industrial Control System**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)]()

> "If this software fails, a microchip yield is ruined, or a defense contract is breached."

Operation Obsidian is a world-class Industrial IoT platform designed for high-stakes manufacturing environments. Built with zero-trust security, offline-first architecture, and AI-powered predictive maintenance.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     COMMAND INTERFACE                        │
│  Next.js 14 • JWT Auth • Offline-First (RxDB) • QR Scanner │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      THE AIRLOCK (API)                       │
│     NestJS • Double-Sig Auth • FIPS Crypto • Rate Limiting  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                    DATA LAYER                                │
│  PostgreSQL (Ledger) • TimescaleDB (Telemetry) • ClickHouse │
│  MinIO (Object Storage) • MQTT (IoT) • RxDB (Local)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  INTELLIGENCE LAYER                          │
│  Isolation Forest • Anomaly Detection • Predictive Maintenance│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ (LTS)
- **Python** 3.10+
- **Docker** & Docker Compose
- **Poetry** (Python package manager)

### 1. Clone & Install
```bash
git clone https://github.com/ymmc1111/Obsidian.git
cd Obsidian
npm install
```

### 2. Start Infrastructure
```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- TimescaleDB (port 5433)
- ClickHouse (port 8123)
- MinIO (port 9000/9001)
- MQTT Broker (port 1883)

### 3. Run Database Migrations
```bash
cat packages/database/migrations/*.sql | docker exec -i pocket_ops_db psql -U admin -d pocket_ops
```

### 4. Start Services

**Terminal 1** - API Core:
```bash
npm run dev --workspace=@pocket-ops/api-core
```

**Terminal 2** - Web Client:
```bash
npm run dev --workspace=@pocket-ops/web-client
```

**Terminal 3** - Data Pipeline:
```bash
npm run dev --workspace=@pocket-ops/data-pipeline
```

**Terminal 4** - Telemetry Service:
```bash
npm run dev --workspace=@pocket-ops/telemetry-service
```

**Terminal 5** - AI Service:
```bash
cd apps/ai-service
poetry install
poetry run python src/main.py
```

**Terminal 6** - Science Lab:
```bash
cd apps/science-lab
poetry install
poetry run streamlit run app.py
```

### 5. Start Machine Simulator (Optional)
```bash
node simulator.js
```

### 6. Access Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web Client** | http://localhost:3000 | operator / password123 |
| **API Core** | http://localhost:3001 | - |
| **Science Lab** | http://localhost:8501 | - |
| **AI Service** | http://localhost:8000 | - |
| **MinIO Console** | http://localhost:9001 | admin / password |

---

## 📚 Features

### 🔒 Security
- **JWT Authentication**: Secure token-based auth
- **Double-Signature**: Two-person rule for critical actions
- **Immutable Ledger**: SHA-256 hash-chained audit log
- **FIPS Crypto**: Ed25519 signatures, AES-GCM encryption

### 🏭 Manufacturing
- **Offline-First**: Works in Faraday cages and dead zones
- **QR/Barcode Scanner**: Asset tracking via device camera
- **Real-time Telemetry**: MQTT ingestion from machines
- **Inventory Management**: Live stock tracking with sync

### 🤖 AI & Analytics
- **Predictive Maintenance**: Isolation Forest anomaly detection
- **Risk Assessment**: LOW → MEDIUM → HIGH → CRITICAL
- **Time-Series Analysis**: ClickHouse OLAP queries
- **Real-time Dashboard**: WebSocket streaming

---

## 🗂️ Project Structure

```
Obsidian/
├── apps/
│   ├── api-core/          # NestJS backend (The Airlock)
│   ├── web-client/        # Next.js frontend (Command Interface)
│   ├── data-pipeline/     # ETL service (Postgres → ClickHouse)
│   ├── telemetry-service/ # MQTT → TimescaleDB ingestion
│   ├── ai-service/        # Predictive maintenance engine
│   └── science-lab/       # Streamlit analytics dashboard
├── packages/
│   ├── database/          # Migrations & DB utilities
│   ├── logger/            # FIPS-compliant logging (Pino)
│   ├── schema/            # Shared Zod schemas
│   └── ui/                # Shared React components
├── k8s/                   # Kubernetes manifests
├── docker-compose.yml     # Production stack
└── docker-compose.dev.yml # Development infrastructure
```

---

## 🐳 Docker Deployment

### Build Images
```bash
./build-images.sh
```

### Deploy Full Stack
```bash
docker compose up -d
```

### Deploy to Kubernetes
```bash
kubectl apply -k k8s/base
```

---

## 🔧 Configuration

### Environment Variables

**API Core** (`apps/api-core`):
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=password
POSTGRES_DB=pocket_ops
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

**Telemetry Service** (`apps/telemetry-service`):
```env
MQTT_BROKER=mqtt://localhost:1883
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=pocket_ops_telemetry
```

**AI Service** (`apps/ai-service`):
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=pocket_ops_telemetry
```

---

## 📊 Monitoring

### Health Checks
- **API Core**: `GET http://localhost:3001/health`
- **AI Service**: `GET http://localhost:8000/health`

### Logs
```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f api-core
```

---

## 🧪 Testing

### Run Machine Simulator
```bash
node simulator.js
```

This generates telemetry for 4 machines:
- CNC-01, CNC-02
- MILL-01, LATHE-01

### Test Offline Mode
1. Open DevTools (F12)
2. Network tab → Check "Offline"
3. Make inventory changes
4. Uncheck "Offline"
5. Watch auto-sync

### Test AI Predictions
1. Run simulator for 5+ minutes
2. Navigate to `http://localhost:3000/ai`
3. Click "REFRESH ANALYSIS"
4. View risk levels and recommendations

---

## 🛡️ Security Best Practices

### Production Checklist
- [ ] Change default passwords
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Set up backup strategy
- [ ] Configure HSM for key storage

### FIPS 140-2 Compliance
- Ed25519 for signatures
- SHA-256 for hashing
- AES-GCM for encryption
- Pino logger with PII redaction

---

## 📖 Documentation

### User Guides
- [Authentication](docs/auth.md)
- [Inventory Management](docs/inventory.md)
- [Telemetry Setup](docs/telemetry.md)
- [AI Predictions](docs/ai.md)

### Developer Guides
- [API Reference](docs/api.md)
- [Database Schema](docs/schema.md)
- [Deployment](docs/deployment.md)

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🎯 Roadmap

### Completed ✅
- Phase 1: Foundation & Security Core
- Phase 2: Command Interface
- Phase 3: Deployment
- Phase 4: Manufacturing Hardening
- Phase 5: Telemetry Integration
- Phase 6: AI Integration

### In Progress 🚧
- Phase 7: Production Hardening

### Planned 📋
- Phase 8: Advanced Analytics
- Phase 9: Mobile App
- Phase 10: Multi-Site Deployment

---

## 🏆 Built With

- **Frontend**: Next.js 14, React, TailwindCSS, Framer Motion
- **Backend**: NestJS, FastAPI, Node.js
- **Databases**: PostgreSQL, TimescaleDB, ClickHouse, RxDB
- **IoT**: MQTT (Mosquitto)
- **AI/ML**: scikit-learn, pandas, numpy
- **Infrastructure**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana (planned)

---

**Operation Obsidian** - Where security meets intelligence.

*"The tolerance for error is zero. The tolerance for lag is zero. The tolerance for bad design is negative."*
