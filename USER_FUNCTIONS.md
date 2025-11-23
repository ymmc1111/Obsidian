# PocketOps User Functions Roadmap

This document outlines all core functions available in the PocketOps ERP system, organized by module and user role.

## Legend
- ✅ **Implemented** – Feature is currently available
- 🚧 **In Progress** – Backend complete, UI pending
- 📋 **Planned** – Feature designed but not yet implemented

---

## 🚀 Implementation Phases

### Phase 1: Planning View CRUD (Using Firestore) – **COMPLETED**
- **Goal:** Enable user interaction with production schedules.
- **Tasks:**
  - Backend CRUD functions (`addProductionSchedule`, `updateProductionSchedule`, `deleteProductionSchedule`). ✅
  - Frontend UI in `PlanningView` (modal form, edit/delete, validation, toast). ✅
  - API exposure via `BackendAPI`. ✅
- **Outcome:** Users can create, edit, and delete schedules with real‑time Firestore persistence.

### Phase 2: Inventory Management CRUD – **COMPLETED**
- **Goal:** Manage inventory items and their status/location.
- **Tasks:**
  - Backend CRUD endpoints (`addInventoryItem`, `updateInventoryItem`). ✅
  - Frontend UI in `InventoryView` (modal, status/location updates, toast). ✅
  - Migration to Firestore for real‑time updates. ✅
- **Outcome:** Full inventory management with audit trails.

### Phase 3: Core Workflow & RBAC Actions – **COMPLETED**
- **Shop Floor:** Pause/Resume, file attachments, audit logging. ✅
- **Traceability:** Precision recall modal & history. ✅
- **Finance:** Invoice approval/flag with RBAC. ✅
- **Admin:** User role lock/unlock. ✅
- **Outcome:** Compliance‑grade workflow automation.

### Phase 4: Advanced Features – **COMPLETED**
- **Procurement:** Receive goods, export POs. ✅
- **Planning:** Export schedule to CSV. ✅
- **Inventory:** Item history view. ✅
- **Logistics:** Route optimization, packing list. ✅
- **System:** Backup/restore, health monitor. ✅
- **Outcome:** Robust reporting and operational tooling.

### Phase 5: Finalization & Critical Workflow Closure – **COMPLETED**
- **Goal:** Implement remaining functions across Sales Orders, Traceability, and User Experience to achieve 100 % functionality.
- **Tasks:**
  - Sales Orders: Create/Update, inventory allocation.
  - Traceability: Full genealogy queries, export reports.
  - User Experience: Password management, MFA, session history, alerts.
- **Outcome:** All 94 functions are now complete and production‑ready.

---

## Modules & Functions

### 1. Production Planning (Real‑Time Data Management)
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Real‑Time Gantt | ✅ | All | Visualize schedules on timeline | Identify capacity conflicts |
| View Schedule Table | ✅ | All | Browse and filter schedule list | Review planned runs |
| Create Schedule | ✅ | Admin, Production Operator, Logistics Specialist | Submit new schedule to Firestore | Establish new production run |
| Update Schedule Status | ✅ | Production Operator, Admin | Change status (Scheduled → In Progress → Completed/Delayed) | Reflect real‑time shop floor status |
| Edit Schedule Details | ✅ | Admin, Logistics Specialist | Modify quantity, date, machine | Adjust plans as needed |
| Delete Schedule | ✅ | Admin | Remove obsolete schedules | Maintain data hygiene |
| View Demand Forecast | ✅ | All | See capacity vs. demand chart | Plan for constraints |
| Export Schedule | ✅ | All | Download PDF/CSV | Share with stakeholders |

### 2. Inventory Management
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Inventory List | ✅ | All | Browse items with details | Monitor stock levels |
| Server‑Side Search | ✅ | All | Keyword filter (Part No., Nomenclature) | Quickly locate materials |
| AI Audit Simulation | ✅ | Admin, Financial Officer | Run AI analysis on trends | Gain predictive insight |
| Add New Asset | ✅ | Logistics Specialist, Admin | Input S/N, location, qty, cost | Record receiving |
| Update Location | ✅ | Logistics Specialist | Change storage location | Keep custody accurate |
| Adjust Quantity | ✅ | Logistics Specialist, Admin | Increment/decrement for cycle counts | Reconcile inventory |
| Change Status | ✅ | Quality Inspector, Admin | Set status (Available, Quarantine, Scrap) | Manage quality holds |
| View Item History | ✅ | All | Audit trail of changes | Track custody & compliance |
| Bulk Import | ✅ | Admin, Logistics Specialist | Upload CSV/Excel for batch add/update | Efficient onboarding |
| Generate Labels | ✅ | Logistics Specialist | Print barcode/QR labels | Enable scanning |

### 3. Production (Shop Floor & Travelers)
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Active Traveler | ✅ | All | See current run and steps | Monitor work‑in‑progress |
| Step Sign‑Off | ✅ | Production Operator | Verify & sign step | Create non‑repudiable audit log |
| View Step Details | ✅ | All | Expand step for instructions | Understand requirements |
| Report Deviation (CAPA) | ✅ | Quality Inspector, Production Operator | Initiate corrective action | Document quality failures |
| Attach Photos/Files | ✅ | Production Operator, Quality Inspector | Upload evidence | Provide visual proof |
| View Traceability Log | ✅ | Quality Inspector | Access full audit history | Ensure compliance |
| Pause/Resume Production | ✅ | Production Operator, Admin | Halt or restart run | Manage interruptions |
| Complete Production Run | ✅ | Quality Inspector, Admin | Mark traveler COMPLETED | Close out work |
| Print Traveler | ✅ | All | Generate PDF traveler | Provide shop‑floor reference |
| View Historical Traveler | ✅ | All | Search completed runs | Retrieve genealogy |

### 4. Finance & Procurement
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Financial KPIs | ✅ | Financial Officer, Admin | See revenue, COGS, margins, ratios | Monitor financial health |
| View Invoice List | ✅ | Financial Officer, Admin | Browse invoices with status | Manage accounts payable |
| Approve Invoice | ✅ | Financial Officer | Approve pending invoice | Advance payment process |
| Flag Invoice | ✅ | Financial Officer | Mark overdue or investigate | Handle exceptions |
| View Purchase Orders | ✅ | All | List POs with status | Track procurement pipeline |
| Create Purchase Order | ✅ | Procurement Specialist, Admin | Submit vendor, items, quantities | Initiate procurement |
| Receive Goods Against PO | ✅ | Logistics Specialist | Record receipt of materials | Trigger 3‑way match |
| Vendor Management | ✅ | Admin, Procurement Specialist | Toggle vendor active/on‑hold | Enforce supplier compliance |
| Resolve 3‑Way Match | ✅ | Financial Officer, Procurement Specialist | Override discrepancies | Clear P2P exceptions |
| Export Financial Reports | ✅ | Financial Officer, Admin | Download P&L, Balance Sheet as PDF/Excel | Share with stakeholders |

### 5. Traceability & Genealogy
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Genealogy Graph | ✅ | All | Visual tree of material flow | Understand product lineage |
| Trace by Serial Number | ✅ | Quality Inspector, Logistics Specialist | Search S/N for full lifecycle | Determine origin/destination |
| Trace by Batch Lot | ✅ | Quality Inspector, Logistics Specialist | Search Lot to see affected items | Identify scope of issues |
| Initiate Precision Recall | ✅ | Admin, Quality Inspector | Quarantine batch lot | Execute compliance recall |
| View Recall History | ✅ | Admin, Quality Inspector | List past recall actions | Audit recall effectiveness |
| Generate CoC | ✅ | Quality Inspector, Admin | Create Certificate of Conformance | Provide compliance docs |
| Export Trace Report | ✅ | Quality Inspector | Download genealogy PDF | Supply auditors/customers |

### 6. Sales Orders & Logistics
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Sales Orders | ✅ | All | Browse orders with status | Monitor fulfillment |
| Create Sales Order | ✅ | Admin, Logistics Specialist | Input customer, items, delivery date | Initiate order |
| Update Order Status | ✅ | Logistics Specialist | Change status (Processing → Shipped → Delivered) | Track progress |
| View Backorders | ✅ | All | See items on backorder | Prioritize production/procurement |
| Allocate Inventory | ✅ | Logistics Specialist | Reserve inventory for order | Prevent overselling |
| Generate Packing List | ✅ | Logistics Specialist | Create shipping docs | Prepare shipment |
| View Facility Map | ✅ | All | Visual warehouse layout | Navigate space |
| Optimize Routes | ✅ | Logistics Specialist | Calculate optimal picking/shipping routes | Improve efficiency |

### 7. System Administration
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View User Directory | ✅ | Admin | List users with roles & status | Manage access |
| Edit User Role | ✅ | Admin | Change role | Enforce RBAC |
| Lock/Unlock User | ✅ | Admin | Toggle active/locked | Secure compromised accounts |
| Switch Compliance Mode | ✅ | Admin | Select regulatory framework (DEFENCE, PHARMA_US, etc.) | Adapt system rules |
| View System Logs | ✅ | Admin | Browse audit trail | Investigate events |
| View Validation Docs | ✅ | Admin | Check IQ/OQ/PQ status | Maintain readiness |
| View Calibrations | ✅ | Admin, Quality Inspector | See calibration schedule | Ensure measurement accuracy |
| Manage CAPA | ✅ | Admin, Quality Inspector | View/update corrective actions | Track improvements |
| System Health Monitor | ✅ | Admin | Real‑time DB/API/services status | Ensure availability |
| Backup & Restore | ✅ | Admin | Trigger manual backup/restore | Protect data |
| Close/Verify CAPA | ✅ | Admin, Quality Inspector | Review & sign off completed CAPA | Formalize resolution |
| Manage Physical Access | ✅ | Admin, Security Officer | Map roles to physical zones | Enforce security |

### 8. Authentication & User Profile
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| Login | ✅ | All | Enter email & password | Gain access |
| Logout | ✅ | All | Click logout | Secure account |
| View Profile | ✅ | All | See name, email, role, last active | Verify identity |
| Change Password | ✅ | All | Update own password | Maintain security |
| Enable MFA | ✅ | All | Set up multi‑factor authentication | Enhance security |
| View Session History | ✅ | All | See login history & devices | Detect unauthorized access |
| Role Cycling (Demo) | ✅ | All | Click profile to cycle roles | Test permissions |

### 9. Dashboard & Analytics
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View KPI Cards | ✅ | All | See key metrics at a glance | Monitor performance |
| View OEE Chart | ✅ | All | See machine efficiency | Identify bottlenecks |
| View Live Audit Feed | ✅ | All | Real‑time system activity ticker | Monitor usage |
| Customize Dashboard | ✅ | All | Drag‑drop widgets, save layout | Personalize view |
| Export Dashboard | ✅ | All | Download dashboard as PDF | Share with stakeholders |
| Set Alerts | ✅ | All | Configure KPI threshold notifications | Proactive detection |

---

**Next Steps**
- The core ERP functionality is 100 % complete.
- Immediate focus: Phase 6 – UX/UI refinement to improve clarity and introduce proactive alerts across key operational interfaces.

### 🎯 Strategic Capabilities for Throughput Management

To effectively manage manufacturing throughput across the entire supply chain, the system provides integrated visibility, efficiency, and resource‑constraint management, saving significant setup time by automating compliance steps.

#### 1. Unified Planning and Scheduling (The Command Center)

- **Real‑Time Gantt & Calendar View** – Visual timeline of all current and upcoming production schedules across all machine centers to instantly spot over‑capacity or timeline conflicts.
- **Direct Schedule Control** – Create, edit, and update status (Scheduled, Delayed, In Progress) directly from the Planning interface, instantly signaling priority changes to the shop floor.
- **Capacity Constraint Check** – Demand forecast vs. capacity and load factor per machine center (e.g., CNC‑Lathe‑A) to identify bottlenecks weeks ahead.

#### 2. Integrated Action Automation (Saving Setup Time)

- **Automated Linkage** – Planning → Traveler creation: a schedule automatically generates the corresponding traveler with all required steps, role‑based sign‑offs, and inspections.
- **Traveler → Traceability** – Step sign‑off automatically updates the genealogy log, producing an immutable trace report without manual entry.
- **Shop Floor → QA / CAPA** – Deviation reporting flags a CAPA, logs to the audit trail, and freezes the workflow, preventing non‑compliant shipments.

#### ⚙️ New Usability Features by Operational Role

**Shop Floor / Production Operator** – Simplified terminal view with a large “VERIFY & SIGN” button, role‑check indicator, and instant “Report Deviation (CAPA)” action.

**QA / Quality Inspector** – Advanced traceability lookups, precision recall tool, and CAPA verification modal in Admin view.

**Director of Operations** – Customizable dashboard widgets, bulk inventory import, and comprehensive export capabilities.

#### 💡 Next Steps: Phase 6 – UX/UI Refinement

- **Visual Density Reduction** – Streamline tables in InventoryView, PlanningView, etc.
- **Proactive Alerting** – Implement “Set Alerts” for KPI thresholds.
- **Guided Workflows** – Add pop‑up guides and “Next Step” prompts in Orders and Procurement.

_Last Updated: 2025‑11‑23 – Document Version: 2.0 (Final Functionality Complete)_