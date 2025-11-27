# PocketOps: Adaptive Resource Platform (Defense & Regulated Industries)

**PocketOps** is a next-generation Enterprise Resource Planning (ERP) and Manufacturing Execution System (MES) designed specifically for high-compliance environments (Defense, Aerospace, Pharma). It features a "Backend-First" architecture that decouples the frontend from data logic, ensuring data integrity, auditability, and scalability.

## 🚀 Key Features

*   **Adaptive Compliance Modes:** Seamlessly switch between **DEFENCE** (ITAR/CMMC), **PHARMA** (21 CFR Part 11/GxP), and **GCAP** (Global Audit) modes, dynamically adjusting UI and validation rules.
*   **Decoupled Architecture:** A robust, simulated **Backend API** layer separates the React frontend from data storage, mimicking a real-world microservices environment.
*   **Immutable Audit Logging:** All critical actions (Sign-offs, Recalls, Approvals) are cryptographically hashed and logged to a non-repudiable audit trail.
*   **Real-Time Observability:** Integrated **Telemetry Service** monitors system health, tracks distributed traces for complex actions, and alerts on slow database queries.
*   **AI-Powered Insights:** "Tactical Assistant" integration (simulated via Gemini API hooks) provides predictive analytics for inventory shortages and supply chain risks.
*   **Role-Based Shop Floor:** A dedicated, simplified interface for operators (`ShopFloorView`) with biometric-style verification and CAPA deviation reporting.

## 🏗️ Architecture

The application is built on a modern stack designed for performance and security:

*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS (iOS-inspired design).
*   **Data Layer:** Simulated Node.js/Express `BackendAPI` with a "PostgreSQL-like" in-memory database (`db.ts`).
*   **Observability:** Custom `TelemetryService` for APM-style tracing and metrics.
*   **Compliance:** `AuditService` with client-side hash generation and server-side integrity verification.

## 🛠️ Run Locally

**Prerequisites:** Node.js (v18+)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set Environment Variables:**
    Create a `.env.local` file and add your Gemini API key (optional for AI features):
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Explore the App:**
    *   **Dashboard:** View real-time OEE and Financial KPIs.
    *   **Inventory:** Test the "Server-Side Search" and watch the console for Telemetry logs.
    *   **Shop Floor:** Switch to "Operator" role and sign off on traveler steps.
    *   **Traceability:** Initiate a mock "Recall" to see the immutable audit log in action.

## 📦 Deployment

The application is architected to be container-ready. The `services/backend` directory is structured to be easily lifted into a standalone Node.js or Python (MCP) service for production deployment.

---

*Built with ❤️ for the future of secure manufacturing.*
