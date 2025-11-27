import { z } from 'zod';

export enum SensitivityLevel {
    UNCLASSIFIED = 'UNCLASSIFIED',
    CUI = 'CUI',
    SECRET = 'SECRET'
}

export const SensitivityLevelSchema = z.nativeEnum(SensitivityLevel);

export enum ItemStatus {
    AVAILABLE = 'AVAILABLE',
    ALLOCATED = 'ALLOCATED',
    QUARANTINE = 'QUARANTINE',
    SCRAP = 'SCRAP'
}

export const ItemStatusSchema = z.nativeEnum(ItemStatus);

export enum InvoiceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

export const InvoiceStatusSchema = z.nativeEnum(InvoiceStatus);

export enum PurchaseOrderStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PARTIAL = 'PARTIAL',
    FILLED = 'FILLED',
    CLOSED = 'CLOSED'
}

export const PurchaseOrderStatusSchema = z.nativeEnum(PurchaseOrderStatus);

export enum SalesOrderStatus {
    NEW = 'NEW',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    BACKORDERED = 'BACKORDERED'
}

export const SalesOrderStatusSchema = z.nativeEnum(SalesOrderStatus);

export enum UserRole {
    ADMIN = 'Admin',
    FINANCIAL_OFFICER = 'Financial Officer',
    QUALITY_INSPECTOR = 'Quality Inspector',
    PRODUCTION_OPERATOR = 'Production Operator',
    LOGISTICS_SPECIALIST = 'Logistics Specialist'
}

export const UserRoleSchema = z.nativeEnum(UserRole);

export enum ComplianceMode {
    DEFENCE = 'DEFENCE',
    PHARMA_US = 'PHARMA_US',
    PHARMA_EU = 'PHARMA_EU',
    GCAP = 'GCAP'
}

export const ComplianceModeSchema = z.nativeEnum(ComplianceMode);

export const InventoryItemSchema = z.object({
    id: z.string(),
    partNumber: z.string(),
    nomenclature: z.string(),
    cageCode: z.string(),
    serialNumber: z.string(),
    location: z.string(),
    quantity: z.number(),
    unitCost: z.number(),
    status: ItemStatusSchema,
    sensitivity: SensitivityLevelSchema,
    batchLot: z.string(),
    expirationDate: z.string().optional(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const AuditLogEntrySchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    actor: z.string(),
    action: z.string(),
    details: z.string(),
    hash: z.string(),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

export const TravelerStepSchema = z.object({
    id: z.string(),
    order: z.number(),
    instruction: z.string(),
    requiredRole: z.string(),
    completed: z.boolean(),
    completedBy: z.string().optional(),
    timestamp: z.string().optional(),
    inputs: z.array(z.object({
        label: z.string(),
        value: z.string(),
        type: z.enum(['text', 'number', 'passfail'])
    })).optional(),
    attachments: z.array(z.string()).optional(),
});

export type TravelerStep = z.infer<typeof TravelerStepSchema>;

export const ProductionRunSchema = z.object({
    id: z.string(),
    partNumber: z.string(),
    quantity: z.number(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'HALTED']),
    currentStepIndex: z.number(),
    steps: z.array(TravelerStepSchema),
});

export type ProductionRun = z.infer<typeof ProductionRunSchema>;

export const VendorSchema = z.object({
    id: z.string(),
    name: z.string(),
    cageCode: z.string(),
    contact: z.string(),
    status: z.enum(['Active', 'On Hold']),
});

export type Vendor = z.infer<typeof VendorSchema>;

export const PurchaseOrderSchema = z.object({
    id: z.string(),
    vendorId: z.string(),
    date: z.string(),
    totalAmount: z.number(),
    status: PurchaseOrderStatusSchema,
    items: z.array(z.object({
        partNumber: z.string(),
        qty: z.number(),
        unitCost: z.number()
    })),
});

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const ReceivingSlipSchema = z.object({
    id: z.string(),
    poId: z.string(),
    date: z.string(),
    matchStatus: z.enum(['Pending', 'Complete', 'Mismatched']),
});

export type ReceivingSlip = z.infer<typeof ReceivingSlipSchema>;

export const InvoiceSchema = z.object({
    id: z.string(),
    poId: z.string(),
    vendorId: z.string(),
    date: z.string(),
    amountDue: z.number(),
    status: InvoiceStatusSchema,
    glAccount: z.string(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const SalesOrderSchema = z.object({
    id: z.string(),
    customer: z.string(),
    date: z.string(),
    totalAmount: z.number(),
    status: SalesOrderStatusSchema,
    fulfillmentLocation: z.string(),
    backorderedItems: z.number(),
});

export type SalesOrder = z.infer<typeof SalesOrderSchema>;

export const SystemUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: UserRoleSchema,
    status: z.enum(['Active', 'Locked']),
    lastActive: z.string(),
});

export type SystemUser = z.infer<typeof SystemUserSchema>;

export const ProductionScheduleSchema = z.object({
    id: z.string(),
    partNumber: z.string(),
    plannedQty: z.number(),
    startDate: z.string(),
    machineCenter: z.string(),
    loadFactor: z.number(),
    status: z.enum(['Scheduled', 'Delayed', 'In Progress']),
});

export type ProductionSchedule = z.infer<typeof ProductionScheduleSchema>;

export const CertificateOfConformanceSchema = z.object({
    id: z.string(),
    salesOrderId: z.string(),
    partNumber: z.string(),
    quantityShipped: z.number(),
    finalInspectionStatus: z.enum(['Passed', 'Failed']),
    digitalSignature: z.string(),
    rawMaterialTrace: z.array(z.object({
        item: z.string(),
        lotNumber: z.string(),
        vendorCage: z.string()
    })),
    complianceStatement: z.string(),
    complianceMode: ComplianceModeSchema,
});

export type CertificateOfConformance = z.infer<typeof CertificateOfConformanceSchema>;

export const CAPAEntrySchema = z.object({
    id: z.string(),
    description: z.string(),
    status: z.enum(['Open', 'Investigation', 'Closed']),
    deviationType: z.string(),
    priority: z.enum(['High', 'Medium']),
    createdBy: z.string(),
});

export type CAPAEntry = z.infer<typeof CAPAEntrySchema>;

export const ValidationDocumentSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['IQ', 'OQ', 'PQ', 'SOP']),
    status: z.enum(['Valid', 'Review Needed', 'Expired']),
    nextReviewDate: z.string(),
});

export type ValidationDocument = z.infer<typeof ValidationDocumentSchema>;

export const CalibrationRecordSchema = z.object({
    id: z.string(),
    instrumentId: z.string(),
    nextCalibration: z.string(),
    lastCalibration: z.string(),
    status: z.enum(['Valid', 'Expiring Soon', 'Expired', 'Overdue', 'Calibrated']),
});

export type CalibrationRecord = z.infer<typeof CalibrationRecordSchema>;

export const EnvironmentalLogSchema = z.object({
    id: z.string(),
    location: z.string(),
    sensorId: z.string(),
    metric: z.enum(['Temp', 'Humidity', 'Pressure']),
    value: z.string(),
    timestamp: z.string(),
    alertLevel: z.enum(['Nominal', 'Warning', 'Critical']),
});

export type EnvironmentalLog = z.infer<typeof EnvironmentalLogSchema>;

export const FinancialKPISchema = z.object({
    name: z.string(),
    value: z.number(),
    trend: z.string(),
    type: z.enum(['PL', 'BS']),
});

export type FinancialKPI = z.infer<typeof FinancialKPISchema>;

export const OEEDataSchema = z.object({
    machineId: z.string(),
    availability: z.number(),
    performance: z.number(),
    quality: z.number(),
    status: z.enum(['Running', 'Down']),
    alerts: z.number(),
});

export type OEEData = z.infer<typeof OEEDataSchema>;
