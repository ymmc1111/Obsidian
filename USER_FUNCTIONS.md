# PocketOps User Functions Roadmap

This document outlines all the core functions users should be able to perform in the PocketOps ERP system, organized by module and user role.

## Legend
- ✅ **Implemented** - Feature is currently available
- 🚧 **In Progress** - Feature is partially implemented
- 📋 **Planned** - Feature is designed but not yet implemented

---

## 🚀 Implementation Phases

### Phase 1: Planning View CRUD (Using Firestore) - **CURRENT PRIORITY**

**Goal**: Enable user interaction with the first persistent data set (Production Schedules)

**Tasks**:
1. ✅ Add CRUD functions to `services/firebaseProductionService.ts`
   - ✅ `addProductionSchedule()` - Create new schedules
   - ✅ `updateProductionSchedule()` - Update existing schedules  
   - ✅ `deleteProductionSchedule()` - Delete schedules
   
2. 📋 Update `components/PlanningView.tsx` - Add UI for CRUD operations
   - Add modal form for creating/editing schedules
   - Add edit/delete buttons to schedule table rows
   - Implement form validation and error handling
   - Add success/error toast notifications

3. 📋 Update `services/backend/api.ts` - Expose CRUD endpoints
   - Wrap Firebase functions in BackendAPI interface
   - Maintain consistent API layer

**Expected Outcome**: Users can create, edit, and delete production schedules with real-time Firestore persistence.

---

### Phase 2: Inventory Management CRUD

**Goal**: Enable users to add new inventory items and update their status/location

**Tasks**:
1. 📋 Update `services/backend/api.ts` - Add Inventory CRUD endpoints
   - `addInventoryItem()` - Create new inventory items
   - `updateInventoryItem()` - Update item details
   - `updateInventoryLocation()` - Change storage location
   - `updateInventoryQuantity()` - Adjust quantities
   - `updateInventoryStatus()` - Change item status
   - `deleteInventoryItem()` - Remove items

2. 📋 Update `components/InventoryView.tsx` - Add UI for CRUD operations
   - Add modal form for creating/editing items
   - Add inline edit buttons for location and quantity
   - Add status dropdown for quick status changes
   - Implement bulk operations (import CSV)
   - Add confirmation dialogs for destructive actions

3. 📋 Migrate to Firestore (Optional)
   - Move inventory data from mock DB to Firestore
   - Implement real-time inventory updates
   - Add inventory history tracking

**Expected Outcome**: Users can fully manage inventory with persistent storage and audit trails.

---

### Phase 3: Core Workflow & RBAC Actions

**Goal**: Implement compliance-driven actions with role-based access control

**Tasks**:
1. 📋 Update `components/ShopFloorView.tsx` - Enhanced Step Sign-Off
   - Persist step completions to backend
   - Add CAPA (Corrective Action) reporting
   - Implement file/photo attachments
   - Add role-based step restrictions

2. 📋 Update `components/TraceView.tsx` - Precision Recall with RBAC
   - Add role check (Admin, Quality Inspector only)
   - Implement recall confirmation dialog
   - Add recall history tracking
   - Generate recall reports

3. 📋 Update `components/FinanceView.tsx` - Invoice Approval Workflow
   - Add approve/reject buttons with role check
   - Implement approval audit logging
   - Add payment status tracking
   - Generate approval reports

4. 📋 Update `components/AdminView.tsx` - User Role Management
   - Enable role editing with proper authorization
   - Add user lock/unlock functionality
   - Implement compliance mode audit logging
   - Add user activity monitoring

5. 📋 Update `App.tsx` - Pass User Context
   - Pass `currentUser` and `currentUserRole` to child components
   - Implement global RBAC helper functions
   - Add permission checking middleware

**Expected Outcome**: Full workflow automation with compliance-grade audit trails and role-based security.

---

### Phase 4: Advanced Features (Future)

**Planned Enhancements**:
- Dashboard customization and alerts
- Advanced reporting and exports
- Route optimization for logistics
- Predictive analytics with AI/ML
- Multi-tenant support
- External API integrations
- Native mobile applications

---

## 1. Production Planning (Real-Time Data Management)

**Module**: `PlanningView`  
**Data Source**: Firebase Firestore (Real-time)  
**Priority**: HIGH (First Firestore-backed module)

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Real-Time Gantt** | ✅ | All | View all current schedules visualized on the timeline chart | Identify capacity conflicts and delivery dates at a glance |
| **B. View Schedule Table** | ✅ | All | Browse master production schedule with filtering and sorting | Review all planned production runs |
| **C. Create Schedule** | 📋 | Admin, Production Operator, Logistics Specialist | Input details (Part No., Qty, Machine, Date) and submit to Firestore | Establish a new production run in the master schedule |
| **D. Update Schedule Status** | 📋 | Production Operator, Admin | Change status (Scheduled → In Progress → Completed/Delayed) | Reflect real-time status of the shop floor |
| **E. Edit Schedule Details** | 📋 | Admin, Logistics Specialist | Modify quantity, date, or machine assignment | Adjust plans based on changing requirements |
| **F. Delete Schedule** | 📋 | Admin | Remove obsolete or cancelled schedules | Maintain data hygiene in the planning grid |
| **G. View Demand Forecast** | ✅ | All | See projected demand vs. capacity chart | Plan for capacity constraints |
| **H. Export Schedule** | 📋 | All | Download schedule as PDF or CSV | Share with stakeholders or import to other systems |

---

## 2. Inventory Management

**Module**: `InventoryView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: MEDIUM

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Inventory List** | ✅ | All | Browse all inventory items with details | Monitor stock levels and locations |
| **B. Server-Side Search** | ✅ | All | Enter keyword (Part No., Nomenclature) to filter instantly | Quickly locate specific materials or assets |
| **C. AI Audit Simulation** | ✅ | Admin, Financial Officer | Trigger simulated AI analysis of inventory trends | Gain predictive insight into shortages or dead stock |
| **D. Add New Asset** | 📋 | Logistics Specialist, Admin | Input data for new part (S/N, Location, Qty, Cost) | Record physical receiving of materials |
| **E. Update Location** | 📋 | Logistics Specialist | Change storage location (e.g., WH-A → WH-C) | Maintain accurate custody of assets |
| **F. Adjust Quantity** | 📋 | Logistics Specialist, Admin | Increase/decrease quantity for cycle counts | Reconcile physical vs. system inventory |
| **G. Change Status** | 📋 | Quality Inspector, Admin | Update status (Available → Quarantine → Scrap) | Manage quality holds and dispositions |
| **H. View Item History** | 📋 | All | See audit trail of all changes to an item | Track who moved or modified inventory |
| **I. Bulk Import** | 📋 | Admin | Upload CSV file to add multiple items | Efficiently onboard large inventory datasets |
| **J. Generate Labels** | 📋 | Logistics Specialist | Print barcode/QR labels for items | Enable scanning and tracking |

---

## 3. Production (Shop Floor & Travelers)

**Module**: `TravelerView`, `ShopFloorView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: HIGH (Critical for manufacturing operations)

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Active Traveler** | ✅ | All | See current production run and steps | Monitor work-in-progress |
| **B. Step Sign-Off** | ✅ | Production Operator (Role-based) | Click "Verify & Sign" to complete a step | Create non-repudiable audit log entry |
| **C. View Step Details** | ✅ | All | Expand step to see instructions and inputs | Understand work requirements |
| **D. Report Deviation (CAPA)** | 📋 | Quality Inspector, Production Operator | Initiate Corrective Action request from floor | Document quality failures instantly |
| **E. Attach Photos/Files** | 📋 | Production Operator, Quality Inspector | Upload images or documents to a step | Provide visual evidence of work |
| **F. View Traceability Log** | ✅ | Quality Inspector | Access full audit history of production run | Ensure material and process compliance |
| **G. Pause/Resume Production** | 📋 | Production Operator, Admin | Halt or restart a production run | Manage interruptions and downtime |
| **H. Complete Production Run** | 📋 | Quality Inspector, Admin | Mark entire traveler as COMPLETED | Close out finished work |
| **I. Print Traveler** | 📋 | All | Generate PDF of traveler for paper backup | Provide shop floor reference |

---

## 4. Finance & Procurement

**Module**: `FinanceView`, `ProcurementView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: MEDIUM

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Financial KPIs** | ✅ | Financial Officer, Admin | See revenue, COGS, margins, ratios | Monitor financial health |
| **B. View Invoice List** | ✅ | Financial Officer, Admin | Browse all invoices with status | Manage accounts payable |
| **C. Approve Invoice** | 🚧 | Financial Officer | Click "Approve" on pending invoice | Move invoices forward for payment |
| **D. Flag Invoice** | 📋 | Financial Officer | Mark invoice as Overdue or requiring investigation | Manage payment exceptions |
| **E. View Purchase Orders** | ✅ | All | See all POs with status and vendors | Track procurement pipeline |
| **F. Create Purchase Order** | 📋 | Procurement Specialist, Admin | Input vendor, items, quantities, and submit | Initiate material procurement |
| **G. Receive Against PO** | 📋 | Logistics Specialist | Record receipt of materials | Trigger 3-way match process |
| **H. Vendor Management** | 📋 | Admin, Procurement Specialist | Toggle vendor status (Active ↔ On Hold) | Enforce supplier compliance |
| **I. Resolve 3-Way Match** | 📋 | Financial Officer, Procurement Specialist | Manually override PO/Receipt/Invoice discrepancy | Clear P2P exceptions |
| **J. Export Financial Reports** | 📋 | Financial Officer, Admin | Download P&L, Balance Sheet as PDF/Excel | Share with stakeholders |

---

## 5. Traceability & Genealogy

**Module**: `TraceView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: HIGH (Regulatory compliance)

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Genealogy Graph** | ✅ | All | See visual tree of material flow | Understand product lineage |
| **B. Trace by Serial Number** | 📋 | Quality Inspector, Logistics Specialist | Search by S/N to view full lifecycle path | Determine origin and destination of asset |
| **C. Trace by Batch Lot** | 📋 | Quality Inspector, Logistics Specialist | Search by Lot to see all affected items | Identify scope of quality issues |
| **D. Initiate Precision Recall** | 🚧 | Admin, Quality Inspector | Flag all items in Batch Lot to QUARANTINE | Execute compliance-mandated recalls rapidly |
| **E. View Recall History** | 📋 | Admin, Quality Inspector | See all past recall actions | Audit recall effectiveness |
| **F. Generate CoC** | ✅ | Quality Inspector, Admin | Create Certificate of Conformance for order | Provide compliance documentation to customer |
| **G. Export Trace Report** | 📋 | Quality Inspector | Download genealogy as PDF | Provide to auditors or customers |

---

## 6. Sales Orders & Logistics

**Module**: `OrdersView`, `LogisticsView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: MEDIUM

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View Sales Orders** | ✅ | All | Browse all customer orders with status | Monitor order fulfillment |
| **B. Create Sales Order** | 📋 | Admin, Logistics Specialist | Input customer, items, delivery date | Initiate order fulfillment process |
| **C. Update Order Status** | 📋 | Logistics Specialist | Change status (Processing → Shipped → Delivered) | Track order progress |
| **D. View Backorders** | ✅ | All | See items on backorder across all orders | Prioritize production or procurement |
| **E. Allocate Inventory** | 📋 | Logistics Specialist | Reserve inventory for specific order | Prevent overselling |
| **F. Generate Packing List** | 📋 | Logistics Specialist | Create shipping documentation | Prepare for shipment |
| **G. View Facility Map** | ✅ | All | See warehouse layout and zones | Navigate physical space |
| **H. Optimize Routes** | 📋 | Logistics Specialist | Calculate optimal picking/shipping routes | Improve efficiency |

---

## 7. System Administration

**Module**: `AdminView`  
**Data Source**: Mock Database (Backend API)  
**Priority**: HIGH (Security & compliance)

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View User Directory** | ✅ | Admin | See all system users with roles and status | Manage user access |
| **B. Edit User Role** | 📋 | Admin | Change UserRole for any user | Enforce Role-Based Access Control (RBAC) |
| **C. Lock/Unlock User** | 📋 | Admin | Toggle user status (Active ↔ Locked) | Disable compromised or terminated accounts |
| **D. Switch Compliance Mode** | ✅ | Admin | Select regulatory framework (DEFENCE, PHARMA_US, etc.) | Adapt system rules globally |
| **E. View System Logs** | ✅ | Admin | Browse audit trail of all system actions | Investigate security or compliance events |
| **F. View Validation Docs** | ✅ | Admin | Check status of IQ/OQ/PQ validations | Maintain regulatory readiness |
| **G. View Calibrations** | ✅ | Admin, Quality Inspector | See calibration schedule and status | Ensure measurement accuracy |
| **H. Manage CAPA** | ✅ | Admin, Quality Inspector | View and update Corrective Actions | Track quality improvements |
| **I. System Health Monitor** | 📋 | Admin | View database, API, and service status | Ensure system availability |
| **J. Backup & Restore** | 📋 | Admin | Trigger manual backup or restore operation | Protect against data loss |

---

## 8. Authentication & User Profile

**Module**: `Login`, `App` (Global)  
**Data Source**: Backend API + Firebase Auth  
**Priority**: HIGH (Security foundation)

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. Login** | ✅ | All | Enter email and password to authenticate | Gain access to system |
| **B. Logout** | ✅ | All | Click logout to end session | Secure account when done |
| **C. View Profile** | ✅ | All | See own name, email, role, last active | Verify identity and permissions |
| **D. Change Password** | 📋 | All | Update own password | Maintain account security |
| **E. Enable MFA** | 📋 | All | Set up multi-factor authentication | Enhance account security |
| **F. View Session History** | 📋 | All | See login history and devices | Detect unauthorized access |
| **G. Role Cycling (Demo)** | ✅ | All | Click profile to cycle through roles | Test different permission levels |

---

## 9. Dashboard & Analytics

**Module**: `Dashboard`  
**Data Source**: Multiple sources (aggregated)  
**Priority**: MEDIUM

| Function | Status | User Roles | Action | Goal |
|----------|--------|------------|--------|------|
| **A. View KPI Cards** | ✅ | All | See key metrics at a glance | Monitor business performance |
| **B. View OEE Chart** | ✅ | All | See machine efficiency metrics | Identify production bottlenecks |
| **C. View Live Audit Feed** | ✅ | All | See real-time system activity ticker | Monitor system usage |
| **D. Customize Dashboard** | 📋 | All | Drag/drop widgets, save layout | Personalize view |
| **E. Export Dashboard** | 📋 | All | Download dashboard as PDF | Share with stakeholders |
| **F. Set Alerts** | 📋 | All | Configure notifications for KPI thresholds | Proactive issue detection |

---

## Implementation Priority Matrix

### Phase 1: Core CRUD Operations (Immediate)
1. **Production Planning**: Create, Edit, Delete schedules (Firestore-backed)
2. **Inventory**: Add, Update, Delete items
3. **Finance**: Approve/Reject invoices

### Phase 2: Advanced Features (Short-term)
1. **Traceability**: Enhanced search and recall functions
2. **Production**: CAPA reporting and file attachments
3. **Admin**: User role management

### Phase 3: Analytics & Optimization (Medium-term)
1. **Dashboard**: Customization and alerts
2. **Logistics**: Route optimization
3. **Reporting**: Advanced exports and scheduling

### Phase 4: Enterprise Features (Long-term)
1. **Multi-tenant**: Support multiple organizations
2. **API**: External integrations
3. **Mobile**: Native mobile apps
4. **AI/ML**: Predictive analytics and recommendations

---

## Technical Implementation Notes

### Firestore Collections Structure
```
production_schedules/
  - {scheduleId}
    - id, partNumber, plannedQty, startDate, machineCenter, loadFactor, status
    - createdAt, updatedAt, createdBy

inventory_items/
  - {itemId}
    - id, partNumber, nomenclature, quantity, location, status, etc.
    - auditLog: [{ timestamp, action, userId }]

sales_orders/
  - {orderId}
    - id, customer, items[], status, fulfillmentLocation
    - createdAt, updatedAt

users/
  - {userId}
    - id, name, email, role, status, lastActive
    - sessionHistory: [{ timestamp, ipAddress, device }]
```

### API Endpoints to Implement
```typescript
// Production Planning
POST   /api/v1/schedules              // Create schedule
PUT    /api/v1/schedules/:id          // Update schedule
DELETE /api/v1/schedules/:id          // Delete schedule
GET    /api/v1/schedules              // Subscribe to real-time updates

// Inventory
POST   /api/v1/inventory              // Add item
PUT    /api/v1/inventory/:id          // Update item
DELETE /api/v1/inventory/:id          // Delete item
PATCH  /api/v1/inventory/:id/location // Update location
PATCH  /api/v1/inventory/:id/quantity // Adjust quantity

// Finance
PATCH  /api/v1/invoices/:id/approve   // Approve invoice
PATCH  /api/v1/invoices/:id/flag      // Flag invoice
POST   /api/v1/purchase-orders        // Create PO

// Traceability
POST   /api/v1/trace/recall           // Initiate recall
GET    /api/v1/trace/serial/:sn       // Trace by serial
GET    /api/v1/trace/batch/:lot       // Trace by batch

// Admin
PATCH  /api/v1/users/:id/role         // Update user role
PATCH  /api/v1/users/:id/status       // Lock/unlock user
```

---

## User Role Permissions Matrix

| Function Category | Admin | Financial Officer | Quality Inspector | Production Operator | Logistics Specialist |
|-------------------|-------|-------------------|-------------------|---------------------|----------------------|
| View All Data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Schedules | ✅ | ❌ | ❌ | ✅ | ✅ |
| Edit Schedules | ✅ | ❌ | ❌ | ✅ | ✅ |
| Delete Schedules | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Inventory | ✅ | ❌ | ❌ | ❌ | ✅ |
| Approve Invoices | ✅ | ✅ | ❌ | ❌ | ❌ |
| Sign Traveler Steps | ✅ | ❌ | ✅ | ✅ | ❌ |
| Initiate Recalls | ✅ | ❌ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change Compliance Mode | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Next Steps

1. **Review this document** with stakeholders to prioritize features
2. **Create GitHub issues** for each planned function
3. **Design UI mockups** for create/edit forms
4. **Implement Phase 1** functions starting with Production Planning
5. **Add comprehensive testing** for each new function
6. **Update user documentation** as features are released

---

*Last Updated: 2025-11-22*  
*Document Version: 1.0*
