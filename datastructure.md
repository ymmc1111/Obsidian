Here is the detailed file structure, database design, API architecture, and application logic for the Operation Obsidian: Data Science & AI Expansion. This plan is designed to be future-proof, FIPS-compliant, and ready for high-stakes Data Science and MLOps workflows.

1. File Structure (Extended Monorepo)
We will expand the existing Turborepo structure to include the new Data Science and MLOps domains.

Plaintext

pocket-ops-monorepo/
├── apps/
│   ├── web-client/                 # Next.js 14 (UI) - The "Command" Interface
│   ├── api-core/                   # NestJS (Transactional API) - The "Airlock"
│   ├── data-pipeline/              # Python + Dagster (ETL & Orchestration) - The "Cortex"
│   │   ├── assets/                 # Dagster assets (Bronze, Silver, Gold tables)
│   │   ├── sensors/                # Event-driven triggers (e.g., new Ledger entry)
│   │   ├── resources/              # DB connections, S3 clients
│   │   └── dbt_project/            # dbt models for SQL transformations
│   ├── science-lab/                # JupyterHub / Streamlit (Exploration) - The "Sandbox"
│   │   ├── notebooks/              # Shared, versioned notebooks
│   │   └── dashboards/             # Streamlit apps for quick visualization
│   └── model-serving/              # Ray Serve / TorchServe (Inference) - The "Engine"
│       ├── models/                 # Model artifacts and wrappers
│       └── api/                    # Inference endpoints (GRPC/REST)
├── packages/
│   ├── schema/                     # Shared Zod & Protobuf definitions (Single Source of Truth)
│   │   ├── src/
│   │   │   ├── events.proto        # Protobuf for Ledger Events
│   │   │   ├── features.yaml       # Feature Store definitions
│   │   │   └── api.ts              # API types
│   ├── ml-core/                    # Shared Python logic
│   │   ├── src/
│   │   │   ├── feature_store/      # Feast feature definitions
│   │   │   ├── model_registry/     # MLflow wrapper
│   │   │   └── crypto/             # FIPS-compliant crypto utilities (Python)
│   └── database/                   # Prisma/TypeORM schemas + Migration Scripts
│       ├── prisma/
│       │   └── schema.prisma       # Transactional DB Schema
│       └── clickhouse/             # OLAP Schema migrations
├── infrastructure/
│   ├── k8s/                        # Helm Charts for GKE/EKS
│   │   ├── jupyterhub/             # Data Science environment config
│   │   └── mlflow/                 # Model Registry config
│   ├── terraform/                  # IaC for Cloud Resources
│   │   ├── s3.tf                   # Data Lake (MinIO/S3)
│   │   └── db.tf                   # PostgreSQL & ClickHouse
│   └── local/                      # Docker Compose for air-gapped dev
└── mcp-server/                     # Model Context Protocol Server (The Agent Brain)
2. Database Architecture: "The Medallion Ledger"
We separate OLTP (Transactional) from OLAP (Analytical) to ensure performance and security.

A. The Source of Truth (OLTP)
Technology: PostgreSQL (Relational) + TimescaleDB (Telemetry) + Amazon QLDB (Immutable Ledger).

Role: Captures every event in real-time. High write throughput, strict consistency.

Schema (ledger_events): As defined in Phase 1, but optimized for replication.

B. The Analytical Lakehouse (OLAP)
Technology: ClickHouse (High-performance OLAP) or DuckDB (Embedded/Local).

Role: Serves complex queries for Data Science and BI.

Layers (The Medallion Architecture):

Bronze Layer (Raw History):

Content: Direct, appended replication of ledger_events.

Format: JSONB blobs. PII is encrypted (at rest).

Access: Restricted to Data Engineers / Pipeline Service Accounts.

Silver Layer (Cleaned & Enriched):

Content: Deduplicated, validated, and flattened data.

Transformation: ledger_events → fact_inventory_movements, dim_machines.

Security: PII is hashed or redacted using FIPS-compliant algorithms.

Access: Data Scientists (Read-Only).

Gold Layer (Feature Store):

Content: Aggregated metrics ready for ML training (e.g., avg_daily_oee, failure_rate_7d).

Technology: Feast (Feature Store) backed by Redis (Online) and ClickHouse (Offline).

Access: ML Training Jobs & Inference Services.


Getty Images
Explore
3. API Handling & Middle Layer: "The Data Airlock"
Data Scientists need access to massive datasets, but we cannot expose the database directly. We use a high-performance gRPC Airlock.

A. The API (NestJS + gRPC)
Service: AnalyticsService in apps/api-core.

Protocol: gRPC (Google Remote Procedure Call) using Protobuf.

Why gRPC?

Performance: Binary streaming is 10x faster than JSON REST for large datasets.

Type Safety: Protobuf enforces strict schema compliance.

Streaming: Allows Data Scientists to stream terabytes of data without crashing memory.

B. Endpoints (Proto Definitions)
Protocol Buffers

service AnalyticsDataService {
  // Stream Silver Layer data for analysis
  rpc StreamSilverData (QueryRequest) returns (stream RowData);

  // Fetch real-time features for inference
  rpc GetOnlineFeatures (FeatureRequest) returns (FeatureResponse);
}

message QueryRequest {
  string entity_type = 1; // e.g., "INVENTORY", "MACHINE"
  TimeRange time_range = 2;
  string compliance_mode = 3; // Enforce access control
}
C. The "Data Guard" Middleware
Interceptor: Every gRPC call passes through a DataGuardInterceptor.

Logic:

Auth: Validates mTLS certificate and JWT Service Token.

Policy: Checks PolicyEngine (e.g., "Can User X access 'SECRET' batch data?").

Masking: Dynamically masks fields marked as @Sensitive in the Protobuf definition if the user lacks clearance.

4. Application Logic: "The Cortex" (Orchestration & MLOps)
We need a brain to manage the flow of data and the lifecycle of models.

A. The Orchestrator (Dagster)
Role: Manages the data pipeline and ML workflows.

Key Assets:

bronze_ledger_events: Source asset, checks for new data in Postgres.

silver_cleaning_job: dbt model that cleans and hashes PII.

gold_feature_computation: Aggregates metrics for the Feature Store.

Logic:

Event-Driven: Triggered by ledger_events updates (via CDC/Debezium).

Quality Checks: Runs Great Expectations tests on every batch. If data quality drops (e.g., null values in machine_id), the pipeline halts and alerts.

B. The "Drift Watchdog"
Logic:

Compare: training_data_distribution (from Gold Layer) vs. live_inference_distribution (from Model Serving).

Trigger: Daily Dagster job.

Action: If drift > threshold (e.g., 5% shift in temperature readings), flag model as "Stale" in the Model Registry and alert the DS team. Fallback to heuristic rules in the meantime.

C. Inference Logic (Human-in-the-Loop)
Scenario: Predictive Maintenance (e.g., "Spindle Failure Likely").

Flow:

Ingest: monitoringService sends MQTT telemetry.

Processing: model-serving fetches history from Feature Store (Redis) + live telemetry.

Inference: Run ONNX model. Probability: 0.89.

App Logic:

Do Not Auto-Act: Do not shut down the machine (risk of false positive).

Alert: Send "Red Alert" to ShopFloorView via WebSocket.

UI: Show a "Confirm Emergency Stop" slider to the operator.

Feedback Loop: If operator ignores, log as "False Positive" for re-training.

5. Future-Proofing for AI Agents (MCP)
To enable future AI agents (e.g., "Virtual Plant Manager") to safely query the system:

Model Context Protocol (MCP): Implement an MCP Server (apps/mcp-server).

Role: Acts as the standard interface for LLMs/Agents to query system state.

Capabilities:

get_inventory_level(item_id)

get_machine_status(machine_id)

query_audit_log(time_range)

Security: The MCP server enforces the same RBAC and masking rules as the human interface. The Agent has its own Service Account.

6. Execution Checklist
[ ] Infrastructure:

[ ] Deploy MinIO (S3 compatible object storage).

[ ] Deploy ClickHouse (OLAP DB).

[ ] Deploy MLflow (Model Registry).

[ ] Data Pipeline:

[ ] Initialize Dagster project in apps/data-pipeline.

[ ] Create dbt project for Silver/Gold transformations.

[ ] Feature Store:

[ ] Define features.yaml in packages/ml-core.

[ ] Configure Feast to use Redis (Online) and ClickHouse (Offline).

[ ] Compute Environment:

[ ] Configure JupyterHub for Data Scientists with read-only access to the Silver Layer via the gRPC Airlock.

This architecture provides a robust, secure, and scalable foundation for advanced analytics and AI, ensuring that Data Science is a core engineering discipline, not an afterthought.