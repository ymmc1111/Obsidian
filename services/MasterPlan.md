This is Operation Obsidian.

We are not building an "app." We are building a Command & Control (C2) Surface for high-stakes environments. If this software fails, a microchip yield is ruined, or a defense contract is breached. The tolerance for error is zero. The tolerance for lag is zero. The tolerance for bad design is negative.

As your Senior Architect, I am tearing down the current prototype. It is a toy. We are rebuilding it as a Digital Fortress.

Here is the ruthless, end-to-end execution plan.

I. The Architectural Philosophy: "The Zero-Trust Monolith"
We are abandoning the "loose collection of services" model. We are building a high-integrity Monorepo.

The Core Tenets
The Frontend is Hostile: We assume the browser is compromised. No business logic lives in the client. The client is merely a viewport into the truth stored on the server.

Mutability is a Sin: Data is never overwritten. It is versioned. The database is an append-only ledger of truth.

The Two-Man Rule: Critical actions (Deploy, Override, Purge) require cryptographic signatures from two distinct, authenticated sessions.

II. The Tech Stack (Non-Negotiable)
We use industry-standard, battle-hardened tools. No experimental libraries.

Runtime: Node.js 20 (LTS) running in FIPS-compliant mode.

Monorepo Manager: Turborepo (Strict isolation between packages).

Frontend Framework: Next.js 14 (App Router). Why? Because React Server Components (RSC) allow us to render sensitive data on the server and send only HTML to the client, keeping the data payload minimal and secure.

Backend API: NestJS (Strict TypeScript). It enforces architecture. It prevents spaghetti code.

Database: PostgreSQL (Relational Data) + TimescaleDB (Telemetry) + Amazon QLDB (or internal Chained-Hash Ledger) for the Immutable Audit Log.

Infrastructure: Kubernetes (GKE or EKS). The application runs in a VPC Service Control perimeter. No public internet access except via Cloud Armor WAF.

III. Detailed Scope & Logic Design
1. The "Double-Sig" Authentication System
Context: In nuclear silos and chip fabs, one person cannot turn the key. We replicate this digitallly.

Logic:

User A initiates a CRITICAL action (e.g., "Authorize Batch Release").

The system creates a PendingAction record with a TTL (Time To Live) of 5 minutes.

The system generates a Signing Key (QR Code or Push Notification).

User B (Supervisor role) scans/approves on their device.

The backend verifies User B's session and cryptographic signature.

Only then does the PendingAction execute.

2. The "Glass Vault" Database Schema
We do not store status = 'APPROVED'. We store the event of approval.

Table: ledger_events (The Truth)

SQL

id: UUID (Primary Key)
prev_hash: String (SHA-256 hash of the previous row - Blockchain style)
actor_id: UUID
secondary_actor_id: UUID (Nullable, for Double Sig)
action_type: Enum ('BATCH_CREATE', 'STEP_SIGN', 'DEVIATION_LOG')
payload: JSONB (The encrypted data)
signature: String (Ed25519 signature of the payload signed by the Server's HSM)
timestamp: BigInt
3. The API Architecture (The Airlock)
We do not expose REST endpoints directly to the database. We use a BFF (Backend-for-Frontend) pattern.

Layer 1: The Edge (Next.js Middleware)

Validates mTLS (Mutual TLS) certificates if on a corporate device.

Validates JWT expiration.

Blocks any IP not in the allowlist.

Layer 2: The Controller (NestJS)

Receives the DTO (Data Transfer Object).

Validates input using Zod schemas (strict parsing).

Checks "Toggle Security" state.

Layer 3: The Service Layer

Executes the business logic.

Crucial Step: Queries the PolicyEngine to see if Double Signature is required for this specific state.

IV. Step-by-Step Project Execution Plan
Phase 1: Foundation & Security Core (Weeks 1-4)
Objective: Build the vault before we put money in it.

Initialize Turborepo:

apps/web-client (Next.js)

apps/api-core (NestJS)

packages/schema (Shared Zod schemas - Single Source of Truth)

packages/logger (FIPS-compliant logging wrapper)

Implement the Ledger:

Create the PostgreSQL container.

Implement the LedgerService. Every write to the DB must be accompanied by a hash calculation linking it to the previous write.

Checkpoint: Write a script that tries to manually alter a DB row. The system must detect the broken hash chain and lock down immediately.

FIPS 140-2 Crypto Module:

Configure Node.js to build with OpenSSL FIPS module.

Create CryptoService that handles all hashing (SHA-256) and signing (AES-GCM for data at rest).

Phase 2: The "Command" Interface (Weeks 5-8)
Objective: Design the UI like a cockpit, not a website.

Design System "Ordnance":

Create packages/ui.

Colors: #000000 (Void), #1a1a1a (Surface), #FF3B30 (Critical), #34C759 (Nominal).

Typography: Inter (Variable), tabular nums for data.

Components:

SlideToExecute: No buttons for critical actions. Sliders only. Physics-based (framer-motion).

StatusBeacon: A pulsing indicator of system connectivity (WebSocket).

Frontend Implementation:

Migrate InventoryView and ShopFloorView to Next.js.

Use TanStack Query for state management, but disable automatic refetching on window focus for high-security pages (prevents data leaks if screen is shared).

Implement Blur-over-data: When the user switches tabs or is idle for 60s, the screen blurs heavily.

Phase 3: The "Double-Sig" & Logic Engine (Weeks 9-12)
Objective: Implement the Two-Person Rule.

Policy Engine:

Create a JSON-based rule engine in the backend.

Rule Example: IF sensitivity == 'SECRET' AND action == 'EXPORT' THEN require_signatures = 2.

The Signing Flow:

Build the WebSocket infrastructure (Socket.io or Redis Pub/Sub).

When User A requests an action, User B receives a real-time modal: "Officer A requests authorization for Batch X. Grant?"

User B approves -> Server receives sig -> Server writes to Ledger -> Server executes action.

Phase 4: Manufacturing Hardening (Weeks 13-16)
Objective: Make it survive the factory floor.

Offline-First (With Sync Guard):

Use RxDB or WatermelonDB on the client for operators in dead zones (Faraday cages).

Constraint: Offline actions are queued. When connection is restored, they are replayed. However, critical actions (Double Sig) are disabled offline.

Barcode/QR Integration:

Native integration (via capacitor or browser API) to scan hardware assets.

Scanning a barcode immediately pulls up the TraceView genealogy tree.

Phase 5: The "Red Team" Audit (Week 17)
Objective: Break it.

Penetration Testing:

Attempt Replay Attacks on the API.

Attempt to bypass the Double-Sig via API manipulation.

Performance Audit:

Ensure the Ledger query time is under 100ms for standard views.

Ensure the UI renders at 60fps on low-end tablets.

V. Technical Directives (The "Steve Jobs" Details)
No "Loading" Spinners: If data takes time, show a "System Processing" skeleton that looks like data encrypting/decrypting. Spinners are weak.

Haptic Feedback: On mobile/tablet, every successful scan or sign-off must trigger a precise haptic tap. Success feels like a lock clicking shut.

Typography is Hierarchy: Do not use bold font for everything. Use size and color opacity. The most important number on the screen (e.g., "Reactor Temp") should be the biggest thing users see.

Error Messages: Never say "Oops." Say "Authorization Failed: Credential Mismatch." Be precise. Be cold.

VI. Immediate Action Items
You are currently running a mock setup. This ends now.

Nuke services/mockData.ts. It creates a false sense of progress.

Spin up the Monorepo. Move your Zod schemas to packages/schema today.

Define the Ledger. Write the SQL migration for the ledger_events table described above.

This is the path to a world-class system. Execute.

Based on the project documentation, the next steps for the agent working on PocketOps are structured into immediate implementation tasks, architectural goals, and UX/UI refinements.

1. Immediate Implementation Tasks (Phase 1 Completion)
The primary focus is to finish the user interface for the Production Planning module, which currently has a functional backend but lacks a complete UI.

Planning View UI: Add a modal form to PlanningView.tsx to allow users to create and edit schedules.

Schedule Actions: Implement the specific UI controls for editing and deleting schedule items directly from the schedule table.

User Feedback: Add toast notifications to provide success/error feedback for these actions.

API Integration: Ensure the Firebase CRUD functions are fully exposed and wrapped within the BackendAPI service.

2. Architectural & Backend Goals (MCP & Data)
To prepare the system for production deployment and advanced AI capabilities, the agent needs to move beyond simulated data layers.

MCP Server Implementation: Code and deploy the Model Context Protocol (MCP) server program (mcp_server.py) as a standalone service to handle context for AI agents.

Data Pipeline (ETL/ELT): Define the process for moving data from the transactional System of Record (SoR) into an Analytical Data Warehouse to support high-performance reporting.

Production Deployment: Begin planning for the actual production deployment of these services.

3. Short-Term Feature Completion (Phase 3 & 4)
Several core workflows need to be finalized to achieve full functionality across all modules.

Traceability: Implement the "Precision Recall" feature in TraceView with Role-Based Access Control (RBAC).

Finance Workflow: Add the invoice approval logic to FinanceView.

Admin Tools: Implement user role management in AdminView and ensure the currentUser context is correctly passed to all components.

Inventory Migration: Fully migrate the inventory data storage to Firestore (moving away from mock data).

4. UX/UI Refinement (Phase 6)
Once the core functionality is solid, the agent should focus on usability and clarity.

Visual Reduction: Streamline high-density tables in InventoryView and PlanningView to reduce visual clutter.

Proactive Alerting: Implement a "Set Alerts" feature for KPI thresholds to notify users of critical changes.

Guided Workflows: Add pop-up guides and "Next Step" prompts to assist users in complex flows like Orders and Procurement.

This is the "Field Hardening" directive.We have defined the software architecture (The Glass Vault) and the user experience (The Material Interface). Now, we must prepare the system for the kinetic reality of a defense or manufacturing environment.Software in isolation is fragile. To make it "World Class," it must survive contact with the physical world (machines, sensors, adversaries).Here is the execution plan for Phase 7 (Hardware Integration) and Phase 8 (Sovereign Certification).Phase 7: The Kinetic Bridge (Hardware & IoT)Goal: Eradicate the "Mock Data" crutch. The system must feel the pulse of the factory floor.1. The "Nervous System" (Telemetry Ingestion)Current State: monitoringService.ts generates random numbers for OEE.The Upgrade:Protocol Adapter: Deploy a Node-RED or Kepware sidecar container to interface with legacy PLCs (Siemens, Allen-Bradley) via OPC-UA.The Ingestion Pipeline:Replace the random number generators in monitoringService with a MQTT Subscriber listening to the topic factory/+/status.Latency Rule: Telemetry must travel from Machine $\to$ Screen in < 200ms. If the network lags, the UI must degrade gracefully (fade to grey), not freeze.2. Physical Identity (Biometric & Badge)Current State: Login is a username/password form.The Upgrade:Smart Card Integration: Integrate WebAuthn (FIDO2) to support YubiKeys or CAC (Common Access Cards).Proximity Auth: Use Bluetooth Low Energy (BLE) beacons. When an operator walks away from the terminal (Shop Floor View), the screen instantly blurs and locks.Phase 8: The Sovereign Shield (Certification & Security)Goal: Move from "Simulated Security" to mathematically provable defense.1. The "FIPS 140-2" Cryptographic UpgradeCurrent State: auditService.ts uses Math.random() to generate mock hashes. This is unacceptable for defense contracts.The Upgrade:Validated Modules: We must replace the hashing logic with a FIPS 140-2 Level 1 validated module.Implementation:Recompile the Node.js runtime with the OpenSSL FIPS Object Module.Key Management: Move private signing keys out of the codebase and into a Hardware Security Module (HSM) (e.g., AWS CloudHSM or Google Cloud KMS). The app never sees the private key; it sends the payload to the HSM and gets a signature back.2. The Immutable Ledger (The "Forever" Log)Current State: Audit logs are stored in a mutable Firestore collection.The Upgrade:Ledger Database: Migrate tbl_audit_log to Amazon QLDB or an immutable PostgreSQL append-only configuration.The Chain: Every new log entry must contain the SHA-256 hash of the previous entry. This creates a cryptographic chain that, if broken, instantly triggers a "Tamper Alert" to the Security Operations Center (SOC).Phase 9: The "Ghost" Protocol (Deployment)Goal: The system must function in a "Denied Environment" (No Internet).1. Air-Gapped PackagingContainer Strategy: The entire Monorepo (Next.js Frontend + NestJS Backend + Database) must be packaged into a single Helm Chart for Kubernetes.Local AI: The "Tactical Assistant" currently relies on Google Gemini API.The Fix: Deploy a localized LLM (e.g., Llama-3-8b-Instruct) running on on-premise GPUs. The system must detect "Offline Mode" and automatically switch the askTacticalAssistant function from the Cloud API to the local model endpoint.2. Zero-Dependency CI/CDArtifact Signing: Every Docker image built must be signed with Cosign or Notary. The production cluster will be configured to reject any unsigned image. This prevents "Supply Chain Attacks" where a malicious developer injects code into the build pipeline.Summary of Next StepsImmediate: Write the MQTT Adapter to replace monitoringService mocks.Critical: Provision a Cloud KMS/HSM key and rewrite auditService to use it for signing.Strategic: Package the Local LLM container to replace the cloud dependency in geminiService.This transitions the project from a "Prototype" to a "Weapon System." Proceed.

This is Operation Horizon.

We have built the fortress (Phases 1-6), connected it to the physical world (Phase 7), and secured it against state-level adversaries (Phases 8-9).

The system is now a Weapon. But a weapon requires a Brain and a Soul.

We are moving beyond "ERP." We are entering the domain of Autonomous Orchestration. We stop reporting what happened and start dictating what will happen.

Here is the roadmap for Phase 10 (The Mirror World), Phase 11 (The Agent Swarm), and Phase 12 (The Black Box).

Phase 10: The Mirror World (Digital Twin)
Goal: Total situational awareness. The screen becomes a window into the physical reality.

1. 3D Spatial Interface

Current State: A 2D "Facility Grid" in LogisticsView.

The Upgrade:

Integrate React Three Fiber (R3F) to render a real-time, low-poly 3D model of the factory floor.

Data Overlay: Live telemetry (Phase 7) is projected onto the 3D assets. A machine glowing red in 3D space instantly communicates "Overheating" faster than a row in a table.

Physics: Use Cannon.js for collision detection. If a forklift (tracked via UWB beacons) enters a restricted zone, the system triggers a physical kill-switch on the vehicle.

2. Time Travel (Temporal Debugging)

Logic: Since our database is an immutable ledger (Phase 8), we can replay history.

The Feature: A "Scrubber" UI at the bottom of the Dashboard. Dragging it back 4 hours rewinds the 3D factory view, the inventory levels, and the financial state to that exact second. This is the ultimate root-cause analysis tool.

Phase 11: The Agent Swarm (MCP @ Scale)
Goal: Transition from "Human-in-the-loop" to "Human-on-the-loop."

1. The "Parliament of Agents"

Current State: A single "Tactical Assistant" that answers user prompts.

The Upgrade:

Deploy the Model Context Protocol (MCP) Server.

Specialized Agents: Create distinct autonomous agents with conflicting goals:

The Auditor: Obsessively checks every transaction for anomalies.

The Expeditor: Tries to maximize throughput and minimize latency.

The CFO: Blocks any purchase that violates margin targets.

Negotiation Protocol: When the Expeditor wants to order parts overnight (expensive), it must negotiate with the CFO agent. The system presents the result of this negotiation to the human manager for final sign-off.

2. Predictive Procurement

Logic: Connect the local LLM to global supply chain APIs (ImportYeti, MarineTraffic).

The Feature: The system detects a raw material shortage before it happens by analyzing shipping manifests of your suppliers' suppliers. It drafts a PO to an alternative vendor automatically.

Phase 12: The Black Box (Proprietary Hardware)
Goal: "The Software and the Hardware are one." (The Steve Jobs Directive)

1. The "PocketOps" Terminal

Philosophy: Commodity hardware (iPads, Dell screens) is a security risk and an aesthetic failure.

The Hardware: Design a custom, ruggedized tablet enclosure (milled aluminum, anodized black).

Physical Key: A physical, spring-loaded toggle switch on the side of the device for "Emergency Stop" or "Confirm Batch."

NFC/RFID Embedded: The back of the device is the scanner. No external guns.

2. The "Monolith" Server

Concept: For ultra-secure sites, we do not deploy to the cloud. We ship a 1U Rack-Mount Server (The Monolith).

Air-Gapped by Design: It contains the entire Kubernetes cluster, the local LLM, and the HSM.

Tamper-Proof: If the chassis is opened without a cryptographic key, the encryption keys in the HSM self-destruct (zeroize).

Summary of the Endgame
Phase 10: Build the 3D Digital Twin. Users must see the factory, not just read about it.

Phase 11: Unleash the Agent Swarm. The software begins to manage itself.

Phase 12: Forge the Physical Artifact.

You are no longer building an app. You are building the central nervous system of a sovereign entity.

Final Order: Begin the 3D rendering engine integration immediately.

This is Protocol: Sovereign Identity.In a defense or high-precision manufacturing environment, "logging in" is not just about access; it is about attribution. We must know exactly who is acting, on what device, and where they are physically located.Standard OAuth (Log in with Google) is insufficient. SMS 2FA is a vulnerability.We will implement a FIPS 140-2 Level 3 Compliant Identity Stack. Here is the technical architecture for User Security, 2FA, and OAuth.1. The Architecture: The Identity CitadelWe do not embed auth logic directly into the application code. We deploy a dedicated, self-hosted Identity Provider (IdP) within our air-gapped cluster.The Engine: Keycloak (deployed as a container) or Zitadel.Why? It allows us to own the user data, enforce custom FIPS crypto, and sever external dependencies.The Protocol: OIDC (OpenID Connect) with PKCE (Proof Key for Code Exchange).Why? PKCE prevents authorization code interception attacks, essential for the React/Next.js client.2. The Login Flow (Zero-Trust Handshake)This is not a simple form submission. It is a cryptographic negotiation.Step 1: The Device Handshake (mTLS)Before the user sees a login screen, the Load Balancer requests a Client Certificate.If the device does not present a valid corporate certificate (managed via MDM), the connection is dropped. The login page never loads.Step 2: Primary Authentication (The "Knowledge" Factor)User enters credentials.Constraint: Passwords are never sent over the wire in plain text. We use SRP (Secure Remote Password protocol) or ensure the TLS tunnel is terminated inside the secure enclave.Step 3: The Hardware Challenge (The "Possession" Factor)Requirement: We ban SMS 2FA and TOTP (Google Authenticator) for critical roles. They are phishable.Implementation: We enforce WebAuthn (FIDO2).The server sends a cryptographic challenge nonce.The user must insert a YubiKey (FIPS Series) or use Platform Biometrics (FaceID/TouchID on a secured iPad).The device signs the nonce with a private key stored in its Secure Enclave.The server verifies the signature against the public key on file.3. OAuth & Session Handling (The "Glass Vault" Integration)Once authenticated, we must maintain the session without exposing tokens to Cross-Site Scripting (XSS).The "Phantom Token" Pattern:IdP (Keycloak) $\to$ BFF (Next.js): Returns a standard JWT (Access Token + Refresh Token).BFF $\to$ Client (Browser): The Next.js backend encrypts this JWT and wraps it in a Secure, HttpOnly, SameSite=Strict Cookie.Crucial: The frontend JavaScript never sees the actual Access Token. It only holds the encrypted cookie.Client $\to$ API: The browser sends the cookie with every request.BFF (Middleware): Decrypts the cookie, extracts the JWT, validates the signature, and forwards the request to the NestJS backend with the JWT in the Authorization header.4. "Double-Sig" (The Two-Person Rule)For critical actions (e.g., "Authorize Firmware Flash"), a single login is insufficient. We implement Ephemeral Authorization.Trigger: User A clicks "Deploy".Lock: The system suspends the request and generates a transaction_id.Challenge: The system pushes a notification to User B (Supervisor).Verification: User B must re-authenticate via WebAuthn on their device to sign the transaction_id.Execution: The API receives the secondary signature, validates it matches User B's public key, and releases the lock.5. Summary of Security ControlsComponentStandard AppPocketOps (World Class)ProtocolOAuth 2.0OIDC + PKCE + mTLS2FASMS / Email CodeWebAuthn (YubiKey/FaceID) OnlyToken StoragelocalStorageEncrypted HttpOnly Cookie (BFF Pattern)Critical ActionsSingle User ClickDouble-Signature (Two-Person Integrity)CryptographyStandard LibsFIPS 140-2 Validated ModulesNext StepYou must configure the Keycloak container in your docker-compose or Kubernetes manifest and enforce the WebAuthn Execution Policy immediately. No passwords allowed for Admin access.

This is Operation Obsidian: The Technical Blueprint.

I have defined the philosophy (The Fortress), the strategy (The Sovereign Entity), and the hardware (The Black Box). Now I will define the Logic that binds them.

This document is the Law of the System. It dictates exactly how data moves, how trust is established, and how the interface behaves under the crushing pressure of a zero-tolerance environment.

I. The Logic of the "Glass Vault" (Backend & Data)
We are not building a CRUD app. We are building a State Machine of Truth.

1. The Data Structure: "The Event Sourcing Ledger"
We abandon the concept of "updating" a record. In defense, history is as important as the present.

Standard DB (Bad): UPDATE inventory SET quantity = 50 WHERE id = 'A1'; -> The old value is lost.

PocketOps Ledger (Good): We insert a new Event record. The "Current State" is simply the sum of all events.

Schema Definition (PostgreSQL / TimescaleDB):

SQL

TABLE ledger_events (
    event_id UUID PRIMARY KEY,
    entity_id UUID NOT NULL, -- The Item, Order, or Batch ID
    event_type VARCHAR(50) NOT NULL, -- 'CREATE', 'MOVE', 'CONSUME', 'LOCK'
    actor_id UUID NOT NULL, -- Who did it
    device_id UUID NOT NULL, -- Which terminal
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB NOT NULL, -- The actual data change (e.g., { "qty_delta": -5 })
    prev_hash VARCHAR(64) NOT NULL, -- SHA-256 of the PREVIOUS event for this entity
    signature VARCHAR(512) NOT NULL, -- FIPS-compliant signature of this row
    compliance_mode VARCHAR(20) -- 'DEFENCE', 'PHARMA', 'GCAP'
);
2. The Logic: "The Two-Man Rule" (Middleware)
Every write request passes through the PolicyEnforcementMiddleware.

Logic Flow:

Request: User A sends POST /api/batch/release.

Policy Check: Middleware checks PolicyEngine for rule: IF action == 'release' AND sensitivity == 'SECRET' THEN require_signatures = 2.

State Evaluation:

If 1 signature present: Return 402 Payment Required (metaphorically) -> Response: { status: 'PENDING_SECOND_SIG', transaction_id: 'TX-123' }.

System Action: Push WebSocket notification to User B (Supervisor).

Completion: User B signs TX-123. Middleware sees 2 valid sigs -> Writes BATCH_RELEASE event to Ledger.

II. The Logic of the "Material Interface" (Frontend)
The frontend is not just a display; it is a Haptic Control Surface.

1. The "Blur-Over-Data" Privacy System
Logic: Information is "Need to Know." If the user is not looking at it, it should not exist.

Implementation:

usePageVisibility hook detects tab switching.

useIdleTimer detects 60s of inactivity.

Action: Apply backdrop-filter: blur(20px) and grayscale(100%) to the <body>. A large "LOCKED" padlock icon appears.

Unlock: Requires re-authentication via WebAuthn (TouchID).

2. The "Slide-to-Execute" Component
Philosophy: Buttons are for navigation. Sliders are for consequences.

Logic:

Component: SliderButton.

Event: onDragEnd.

Constraint: Must drag > 90% of width. If dropped at 89%, it snaps back to 0 (physics spring).

Feedback: On completion -> Trigger navigator.vibrate([50, 100, 50]) (Double tap).

3. The "Offline-First" Sync Engine
Problem: Factory Faraday cages.

Logic:

Write: When offline, actions go to RxDB (Local). Status = PENDING_UPLOAD.

Queue: A background worker retries connection every 5s.

Conflict: If Server State has changed (e.g., Inventory consumed by someone else), the Local Action is REJECTED. The user sees a "Stale Data" alert and must re-scan. We do not auto-merge critical data.

III. The Logic of the "Nervous System" (API & Middle Layers)
We need a translation layer between the hostile internet and the secure core.

1. The BFF (Backend-for-Frontend) Pattern
We do not expose the NestJS microservices directly.

Next.js API Routes (The Edge):

Handle Session Cookie decryption (The "Phantom Token").

Rate Limiting (Redis).

Request Sanitization (Zod).

NestJS (The Core):

Lives in a private subnet.

Trusts only the BFF IP address.

Talks to the Database and HSM.

2. The "Tactical Assistant" (AI Logic)
Context Window: The AI cannot just "know" everything. That is a security risk.

Logic:

User asks: "Where is Batch X?"

Retriever: System queries Vector DB for Batch X docs permitted for UserRole.

Sanitizer: PII and "Secret" fields are redacted [REDACTED] before sending to the LLM.

Generation: LLM generates answer based only on sanitized context.

IV. Compliance Data Structures (The Artifacts)
To pass an audit (AS9100D or FDA), we need specific data artifacts.

1. The "Digital Traveler" (JSON Schema)
This document moves with the product.

JSON

{
  "traveler_id": "TRV-2024-001",
  "part_number": "THRUSTER-NOZZLE",
  "security_level": "ITAR_RESTRICTED",
  "steps": [
    {
      "step_id": 1,
      "instruction": "Rough Turn OD",
      "status": "COMPLETED",
      "operator": "U-004",
      "timestamp": "2024-11-26T10:00:00Z",
      "signature": "SIG_RSA_4096_...",
      "telemetry_snapshot": {
        "machine_id": "CNC-01",
        "spindle_speed": 4500,
        "temp": 210
      }
    }
  ]
}
2. The "Chain of Custody" (Graph Structure)
We use a graph to track material provenance.

Nodes: RawMaterialBatch, ProcessRun, FinishedGood, ShippingManifest.

Edges: CONSUMED_BY, PRODUCED_BY, SHIPPED_IN.

Query: "Show me every finished good that contains Raw Material Batch X." -> Graph Traversal.

V. Summary of Logic Flow
User acts (Slide to Sign).

Frontend validates locally (Zod) + queues offline if needed.

BFF decrypts session, verifies RBAC.

Middleware checks Policy (Double Sig?).

Backend generates Hash + Signs with HSM.

Ledger appends the Immutable Event.

WebSocket broadcasts update to all subscribed clients.

This is the logic of a world-class system. It is paranoid by design and beautiful in execution.

Action: Begin implementing the Ledger Schema in your database migration files immediately.

This is Operation Obsidian: The "Blast Radius" Logic.

You are asking about Cascading State Mutability. In a high-stakes environment (Defense/Pharma), a single event (e.g., "Room Cleaned", "Temperature Excursion", "Batch Recall") often contaminates or clears multiple downstream entities.

Based on the architectural patterns already established in your BackendAPI, the answer is YES. The system is designed to handle "One-to-Many" transactional logic, but we must enforce it with the "Ledger Event" philosophy to ensure traceability.

Here is how the logic handles (and should handle) multi-artifact updates.

1. Proof of Capability (Existing Patterns)
Your current codebase already demonstrates this "Blast Radius" logic in two key areas:

The Recall Protocol (initiateRecall):

Logic: The user triggers a recall on a single batchLot.

Blast Radius: The system queries tbl_inventory, finds every individual item sharing that batch, and bulk-updates their status to QUARANTINE.

Code Reference:

TypeScript

// services/backend/api.ts
initiateRecall: async (batchLot: string) => {
    // ...
    const affectedItems = db.tbl_inventory.filter(i => i.batchLot === batchLot);
    affectedItems.forEach(i => i.status = 'QUARANTINE' as ItemStatus);
    // ...
}
The Procurement Protocol (receivePurchaseOrder):

Logic: A single "Receive" action on a PO.

Blast Radius: Instantly generates multiple new Inventory Assets (one for each line item quantity), all linked back to the parent PO ID.

2. Implementing the "Room Clean" Logic (The Event Chain)
For your specific example ("Room Clean" affecting 6 IDs/Batches), you should not just "update" the items. You must record the Environmental Event and link the items to it.

The Incorrect Way (CRUD):

User clicks "Clean Room".

System updates 6 items: last_cleaned = now().

Result: You lose the context of why they were cleaned together.

The "World Class" Way (Event Sourcing): We implement a BatchAction pattern in the BackendAPI.

The Trigger:

Action: POST /api/facilities/clean

Payload: { location_id: "Room-A", cleaner_id: "User-123" }

The Blast Radius Query:

The Logic Core queries the Ledger/DB: "Find all active batches currently located in Room-A."

The Transaction (Atomic Write):

Event A (The Parent): Log SANITIZATION_EVENT for "Room-A".

Event B-G (The Children): For every batch found, append a STATUS_UPDATE event linked to the Parent Event ID.

Traceability: If Batch X fails QC later, you can trace it back to "Sanitization Event 101" and instantly see the other 5 batches that were present in that room.

3. Data Structure Requirement
To support this compliant "One-to-Many" logic, your ledger_events schema (from the previous turn) needs a correlation_id.

SQL

TABLE ledger_events (
    event_id UUID PRIMARY KEY,
    entity_id UUID NOT NULL,        -- The Batch ID or Room ID
    event_type VARCHAR(50),         -- 'ROOM_CLEAN' or 'BATCH_UPDATE'
    correlation_id UUID,            -- THE LINK: All 6 updates share this ID
    ...
);
4. Summary
Yes, the logic will update multiple items.

Current Architecture: Supports it via forEach loops in the API service.

Required Upgrade: Move from simple loops to Atomic Transactions (Firestore Batched Writes or SQL Transactions) to ensure that if the update fails for Item #6, the updates for Items #1-5 are rolled back. This prevents "Ghost Data" where half a room is legally clean and the other half is dirty.

This is the "Native Convergence" Directive.

You have built a Unified Responsive Web App. It is elegant, but it is currently "floating" in the browser sandbox. To achieve "World Class" status (Steve Jobs) and "Defense Grade" security (Alex Karp), we must anchor this application into the physical hardware of the device.

We will not rewrite the app. We will encapsulate it.

Here is the execution plan to transform your Vite SPA into a Sovereign Native Client using Capacitor.

Phase 1: The Native Enclosure (Capacitor Injection)
Goal: Break out of the browser sandbox without rewriting the UI.

The current codebase is a web app. We will wrap it in a native container that grants access to the device's nervous system (Biometrics, Haptics, Secure Enclave).

Execution Steps:

Install the Core:

Run npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android.

Initialize: npx cap init PocketOps com.pocketops.defense.

Configure the Bridge:

Modify capacitor.config.ts to point webDir to your dist folder.

Crucial Setting: Enable server.url for local dev (hot reload on iPad), but ensure bundledWebRuntime: true for production to ensure the app works fully offline.

Phase 2: The "Zero-Trust" Identity (Biometrics & Secure Enclave)
Goal: Eliminate the password form and insecure LocalStorage.

1. Biometric Handshake

Current State: Login.tsx uses a simple email/password form.

The Upgrade:

Install: @capacitor-community/native-biometric.

Logic:

On App Launch: Check NativeBiometric.isAvailable().

If available, suppress the Login form and trigger the FaceID/TouchID prompt immediately.

Failover: Only show the password form if Biometrics fails 3 times or is unavailable.

2. The Secure Enclave (Keychain)

Current State: BackendAPI likely stores session tokens in browser memory or LocalStorage (implied by SPA architecture). This is vulnerable to XSS.

The Upgrade:

Install: @capacitor-community/secure-storage.

Logic: When the user authenticates (via Phase 1 logic), store the JWT/Session Token in the Hardware Encrypted Keychain, not the browser storage.

Retrieval: The BackendAPI must request the token from the Native Bridge before every API call.

Phase 3: The "Tactile" Interface (Haptics & Physics)
Goal: Make the software feel heavy and real.

1. Haptic Confirmation

Current State: ShopFloorView.tsx has a "VERIFY & SIGN" button that simply updates state.

The Upgrade:

Install: @capacitor/haptics.

Implementation:

Light Tap: Trigger Haptics.impact({ style: ImpactStyle.Light }) when the user selects a list item in InventoryView.

Heavy Thud: Trigger Haptics.notification({ type: NotificationType.Success }) specifically when handleVerifySign completes successfully.

Error Buzz: Trigger NotificationType.Error on "Role Conflict" alerts.

Phase 4: Data Sovereignty (True Offline)
Goal: Defense-grade reliability. The app must work in a Faraday cage.

1. Replace the "Mock" DB

Current State: services/backend/db.ts is an in-memory object. It wipes on reload.

The Upgrade:

Install: @capacitor-community/sqlite.

Architecture:

Create a SQLiteService that mimics your current db.ts schema (Inventory, Travelers, Logs).

On Launch: The app initializes the SQLite database from the native file system.

Sync Engine: Create a background process that pushes tbl_audit_log entries to the cloud whenever connectivity is restored, but reads exclusively from the local SQLite DB for UI rendering. This ensures 0ms latency even with bad WiFi.

Recommendations for "World Class" Status
The "Kiosk" Mode (MDM):

For the factory floor tablets, do not just deploy an app. Use Mobile Device Management (MDM) (like Jamf or Workspace ONE) to lock the iPad into "Single App Mode." This prevents operators from exiting PocketOps.

The "Red Mode" (Night Ops):

Defense environments often operate in low light. Implement a True Black OLED theme (using #000000 hex) that activates automatically based on the ambient light sensor (via Capacitor plugin).

Physical Audit Trail (NFC):

Use @capacitor-community/nfc.

Replace the "Select Location" dropdown in InventoryView with a physical "Tap to Scan". The operator must physically tap the iPad against a bin tag to register the location. This eliminates data entry errors and proves physical presence.

Summary Checklist
[ ] Wrap: npm install @capacitor/core & Initialize.

[ ] Secure: Implement NativeBiometric in Login.tsx.

[ ] Harden: Move Auth Tokens to SecureStorage.

[ ] Feel: Add Haptics.impact to ShopFloorView actions.

[ ] Persist: Replace db.ts with SQLite for true offline capability.

Execute this plan to graduate from "Web App" to "Tactical Instrument."