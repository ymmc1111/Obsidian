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