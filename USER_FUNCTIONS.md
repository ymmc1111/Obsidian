# PocketOps User Functions Roadmap

This document outlines all the core functions users should be able to perform in the PocketOps ERP system, organized by module and user role.

## Legend
✅ Implemented - Feature is currently available
🚧 In Progress - Feature is partially implemented (e.g., backend complete, UI pending)
📋 Planned - Feature is designed but not yet implemented

---

## 🚀 Implementation Phases

### Phase 1: Planning View CRUD (Using Firestore) - COMPLETED
**Goal:** Enable user interaction with the first persistent data set (Production Schedules)

**Tasks**
- **Backend:** Add CRUD functions to Firestore Service  
  ✅ `addProductionSchedule()`, `updateProductionSchedule()`, `deleteProductionSchedule()` are complete.
- **Frontend:** Implement CRUD UI in `PlanningView`  
  ✅ Modal form, edit/delete buttons, validation, and toast notifications are implemented.
- **API:** Expose CRUD endpoints via `BackendAPI`  
  ✅ Wrap Firebase functions in `BackendAPI` interface for consistency.

**Expected Outcome:** Users can create, edit, and delete production schedules with real‑time Firestore persistence.

### Phase 2: Inventory Management CRUD - COMPLETED
**Goal:** Enable users to add new inventory items and update their status/location

**Tasks**
- **Backend:** Add Inventory CRUD endpoints  
  ✅ `addInventoryItem()`, `updateInventoryItem()` are functional on Firestore.
- **Frontend:** Implement CRUD UI in `InventoryView`  
  ✅ Modal form for Add/Edit, including status and location updates, is implemented with Toast notifications.
- **Migrate to Firestore** ✅ Inventory data moved to Firestore for real‑time updates and history tracking.

**Expected Outcome:** Users can fully manage inventory with persistent storage and audit trails.

### Phase 3: Core Workflow & RBAC Actions - COMPLETED
**Goal:** Implement compliance‑driven actions with role‑based access control to complete key workflows.

**Tasks**
- **Shop Floor:** Enhanced Sign‑Off  
  ✅ Pause/Resume and File Attachments implemented with audit logging.
- **Traceability:** Precision Recall  
  ✅ Recall Confirmation Modal and Recall History implemented.
- **Finance:** Invoice Approval Workflow  
  ✅ RBAC checks added for Approve/Flag actions with Toast feedback.
- **Admin:** User Role Management  
  ✅ Account Lock/Unlock functionality added to Role Editor.

**Expected Outcome:** Full workflow automation with compliance‑grade audit trails and role‑based security.

### Phase 4: Advanced Features - COMPLETED
**Goal:** Enhance system capabilities with reporting, procurement workflows, and deeper analytics.

**Tasks**
- **Procurement:** Complete Workflow
  ✅ Receive Goods and Export POs implemented.
- **Planning:** Reporting
  ✅ Export Schedule to CSV implemented.
- **Inventory:** Audit
  ✅ View Item History implemented.
- **Logistics:** Optimization
  ✅ Route optimization and Packing List generation implemented.
- **System:** Health & Maintenance
  ✅ Backup/Restore and Health Monitor implemented.

**Expected Outcome:** A fully featured ERP with closed-loop workflows and robust reporting.

---

## Modules & Functions

### 1. Production Planning (Real‑Time Data Management)
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Real‑Time Gantt | ✅ | All | View all current schedules visualized on the timeline chart | Identify capacity conflicts and delivery dates at a glance |
| View Schedule Table | ✅ | All | Browse master production schedule with filtering and sorting | Review all planned production runs |
| Create Schedule | ✅ | Admin, Production Operator, Logistics Specialist | Input details (Part No., Qty, Machine, Date) and submit to Firestore | Establish a new production run |
| Update Schedule Status | ✅ | Production Operator, Admin | Change status (Scheduled → In Progress → Completed/Delayed) | Reflect real‑time status of the shop floor |
| Edit Schedule Details | ✅ | Admin, Logistics Specialist | Modify quantity, date, or machine assignment | Adjust plans based on changing requirements |
| Delete Schedule | ✅ | Admin | Remove obsolete or cancelled schedules | Maintain data hygiene |
| View Demand Forecast | ✅ | All | See projected demand vs. capacity chart | Plan for capacity constraints |
| Export Schedule | ✅ | All | Download schedule as PDF or CSV | Share with stakeholders |

### 2. Inventory Management
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Inventory List | ✅ | All | Browse all inventory items with details | Monitor stock levels and locations |
| Server‑Side Search | ✅ | All | Enter keyword (Part No., Nomenclature) to filter instantly | Quickly locate specific materials |
| AI Audit Simulation | ✅ | Admin, Financial Officer | Trigger simulated AI analysis of inventory trends | Gain predictive insight |
| Add New Asset | ✅ | Logistics Specialist, Admin | Input data for new part (S/N, Location, Qty, Cost) | Record physical receiving |
| Update Location | ✅ | Logistics Specialist | Change storage location (e.g., WH‑A → WH‑C) | Maintain accurate custody |
| Adjust Quantity | ✅ | Logistics Specialist, Admin | Increase/decrease quantity for cycle counts | Reconcile physical vs. system inventory |
| Change Status | ✅ | Quality Inspector, Admin | Update status (Available → Quarantine → Scrap) | Manage quality holds |
| View Item History | ✅ | All | See audit trail of all changes (location, quantity, status) | Track custody and compliance |
| Bulk Import | 📋 | Admin, Logistics Specialist | Upload CSV/Excel to add or update multiple items | Efficient onboarding |
| Generate Labels | 📋 | Logistics Specialist | Print barcode/QR labels for items | Enable scanning and tracking |

### 3. Production (Shop Floor & Travelers)
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Active Traveler | ✅ | All | See current production run and steps | Monitor work‑in‑progress |
| Step Sign‑Off | ✅ | Production Operator | Click “Verify & Sign” to complete a step | Create non‑repudiable audit log |
| View Step Details | ✅ | All | Expand step to see instructions and inputs | Understand work requirements |
| Report Deviation (CAPA) | ✅ | Quality Inspector, Production Operator | Initiate corrective action request | Document quality failures instantly |
| Attach Photos/Files | ✅ | Production Operator, Quality Inspector | Upload images or documents to a step | Provide visual evidence |
| View Traceability Log | ✅ | Quality Inspector | Access full audit history of production run | Ensure material and process compliance |
| Pause/Resume Production | ✅ | Production Operator, Admin | Halt or restart a production run | Manage interruptions and downtime |
| Complete Production Run | ✅ | Quality Inspector, Admin | Mark entire traveler as COMPLETED | Close out finished work |
| Print Traveler | 📋 | All | Generate PDF of traveler for paper backup | Provide shop floor reference |
| View Historical Traveler | ✅ | All | Search and view completed runs by Part No. or Run ID | Retrieve full genealogy |

### 4. Finance & Procurement
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Financial KPIs | ✅ | Financial Officer, Admin | See revenue, COGS, margins, ratios | Monitor financial health |
| View Invoice List | ✅ | Financial Officer, Admin | Browse all invoices with status | Manage accounts payable |
| Approve Invoice | ✅ | Financial Officer | Click “Approve” on pending invoice | Move invoices forward for payment |
| Flag Invoice | ✅ | Financial Officer | Mark invoice as Overdue or investigate | Manage payment exceptions |
| View Purchase Orders | ✅ | All | See all POs with status and vendors | Track procurement pipeline |
| Create Purchase Order | ✅ | Procurement Specialist, Admin | Input vendor, items, quantities, and submit | Initiate material procurement |
| Receive Goods Against PO | ✅ | Logistics Specialist | Record receipt of materials against a PO | Trigger 3‑way match and update inventory |
| Vendor Management | ✅ | Admin, Procurement Specialist | Toggle vendor status (Active ↔ On Hold) | Enforce supplier compliance |
| Resolve 3‑Way Match | ✅ | Financial Officer, Procurement Specialist | Manually override PO/Receipt/Invoice discrepancy | Clear P2P exceptions |
| Export Financial Reports | 📋 | Financial Officer, Admin | Download P&L, Balance Sheet as PDF/Excel | Share with stakeholders |

### 5. Traceability & Genealogy
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Genealogy Graph | ✅ | All | See visual tree of material flow | Understand product lineage |
| Trace by Serial Number | 📋 | Quality Inspector, Logistics Specialist | Search by S/N to view full lifecycle | Determine origin and destination |
| Trace by Batch Lot | 📋 | Quality Inspector, Logistics Specialist | Search by Lot to see all affected items | Identify scope of quality issues |
| Initiate Precision Recall | ✅ | Admin, Quality Inspector | Flag all items in Batch Lot to QUARANTINE | Execute compliance‑mandated recalls |
| View Recall History | ✅ | Admin, Quality Inspector | See all past recall actions | Audit recall effectiveness |
| Generate CoC | ✅ | Quality Inspector, Admin | Create Certificate of Conformance for order | Provide compliance documentation |
| Export Trace Report | 📋 | Quality Inspector | Download genealogy as PDF | Provide to auditors or customers |

### 6. Sales Orders & Logistics
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View Sales Orders | ✅ | All | Browse all customer orders with status | Monitor order fulfillment |
| Create Sales Order | ✅ | Admin, Logistics Specialist | Input customer, items, delivery date | Initiate order fulfillment |
| Update Order Status | ✅ | Logistics Specialist | Change status (Processing → Shipped → Delivered) | Track order progress |
| View Backorders | ✅ | All | See items on backorder across all orders | Prioritize production or procurement |
| Allocate Inventory | ✅ | Logistics Specialist | Reserve inventory for specific order | Prevent overselling |
| Generate Packing List | ✅ | Logistics Specialist | Create shipping documentation | Prepare for shipment |
| View Facility Map | ✅ | All | See warehouse layout and zones | Navigate physical space |
| Optimize Routes | ✅ | Logistics Specialist | Calculate optimal picking/shipping routes | Improve efficiency |

### 7. System Administration
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View User Directory | ✅ | Admin | See all system users with roles and status | Manage user access |
| Edit User Role | ✅ | Admin | Change user role | Enforce RBAC |
| Lock/Unlock User | ✅ | Admin | Toggle user status (Active ↔ Locked) | Disable compromised accounts |
| Switch Compliance Mode | ✅ | Admin | Select regulatory framework (DEFENCE, PHARMA_US, etc.) | Adapt system rules globally |
| View System Logs | ✅ | Admin | Browse audit trail of all system actions | Investigate security events |
| View Validation Docs | ✅ | Admin | Check status of IQ/OQ/PQ validations | Maintain regulatory readiness |
| View Calibrations | ✅ | Admin, Quality Inspector | See calibration schedule and status | Ensure measurement accuracy |
| Manage CAPA | ✅ | Admin, Quality Inspector | View and update corrective actions | Track quality improvements |
| System Health Monitor | ✅ | Admin | View real‑time status of database, API, services | Ensure system availability |
| Backup & Restore | ✅ | Admin | Trigger manual backup or restore | Protect against data loss |
| Close/Verify CAPA | 📋 | Admin, Quality Inspector | Review and sign off completed CAPA | Formalize resolution |
| Manage Physical Access | 📋 | Admin, Security Officer | Map user roles to physical access zones | Enforce regulatory security |

### 8. Authentication & User Profile
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| Login | ✅ | All | Enter email and password to authenticate | Gain access to system |
| Logout | ✅ | All | Click logout to end session | Secure account |
| View Profile | ✅ | All | See own name, email, role, last active | Verify identity |
| Change Password | 📋 | All | Update own password | Maintain account security |
| Enable MFA | 📋 | All | Set up multi‑factor authentication | Enhance security |
| View Session History | 📋 | All | See login history and devices | Detect unauthorized access |
| Role Cycling (Demo) | ✅ | All | Click profile to cycle through roles | Test permission levels |

### 9. Dashboard & Analytics
| Function | Status | User Roles | Action | Goal |
|---|---|---|---|---|
| View KPI Cards | ✅ | All | See key metrics at a glance | Monitor business performance |
| View OEE Chart | ✅ | All | See machine efficiency metrics | Identify bottlenecks |
| View Live Audit Feed | ✅ | All | See real‑time system activity ticker | Monitor system usage |
| Customize Dashboard | 📋 | All | Drag/drop widgets, save layout | Personalize view |
| Export Dashboard | 📋 | All | Download dashboard as PDF | Share with stakeholders |
| Set Alerts | 📋 | All | Configure notifications for KPI thresholds | Proactive issue detection |

## Next Steps
1. Review this document with stakeholders to prioritize features
2. Create GitHub issues for each planned function
3. Design UI mockups for create/edit forms
4. Implement Phase 1 functions starting with Production Planning
5. Add comprehensive testing for each new function
6. Update user documentation as features are released

*Last Updated: 2025-11-22*
*Document Version: 1.0*