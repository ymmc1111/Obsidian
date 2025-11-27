import React, { useState, useEffect } from 'react';
import { INITIAL_VENDORS } from '../services/mockData';
import { BackendAPI } from '../services/backend/api';
import { TacticalCard, StatWidget, StatusBadge, Toast } from './Shared';
import { DollarSign, Clock, Lock, TrendingUp, Check, AlertTriangle, ArrowUpRight, ArrowDownRight, PieChart, Scale, Download } from 'lucide-react';
import { Invoice, InvoiceStatus, ComplianceMode, FinancialKPI, SystemUser, UserRole } from '../types';
import { telemetryService } from '../services/telemetryService';

interface FinanceViewProps {
    complianceMode: ComplianceMode;
    currentUser: SystemUser | null;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ complianceMode, currentUser }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [financialKPIs, setFinancialKPIs] = useState<FinancialKPI[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const isFinanceAuthorized = currentUser?.role === UserRole.FINANCIAL_OFFICER || currentUser?.role === UserRole.ADMIN;

    // Initial Data Fetch
    useEffect(() => {
        const loadFinanceData = async () => {
            try {
                const [invData, kpiData] = await Promise.all([
                    BackendAPI.getInvoices(),
                    BackendAPI.getFinancialKPIs()
                ]);
                setInvoices(invData);
                setFinancialKPIs(kpiData);
            } catch (e) {
                console.error("Finance data load failed", e);
            }
        };
        loadFinanceData();
    }, []);

    // Actions
    const approveInvoice = async (id: string) => {
        // C. Approve Invoice
        if (!isFinanceAuthorized) {
            showToast("Access Denied: Financial Officer role required.", 'error');
            return;
        }

        // Optimistic Update
        setInvoices(prev => prev.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatus.APPROVED } : inv
        ));

        try {
            await BackendAPI.updateInvoiceStatus(id, InvoiceStatus.APPROVED, currentUser);
            // Record KPI: AP Approval
            telemetryService.incrementCounter('ap_approval_count', { invoice_id: id });
            showToast("Invoice Approved", 'success');
        } catch (e) {
            console.error("Approval failed", e);
            // In real app, revert state here
            setInvoices(prev => prev.map(inv =>
                inv.id === id ? { ...inv, status: InvoiceStatus.PENDING } : inv
            ));
            showToast("Approval failed", 'error');
        }
    };

    const flagInvoice = async (id: string) => {
        // D. Flag Invoice
        if (!isFinanceAuthorized) {
            showToast("Access Denied: Financial Officer role required.", 'error');
            return;
        }

        // Optimistic Update: Change status to OVERDUE for a Flag action
        setInvoices(prev => prev.map(inv =>
            inv.id === id ? { ...inv, status: InvoiceStatus.OVERDUE } : inv
        ));

        try {
            await BackendAPI.updateInvoiceStatus(id, InvoiceStatus.OVERDUE, currentUser);
            showToast("Invoice Flagged as Overdue", 'success');
        } catch (e) {
            console.error("Flagging failed", e);
            // In real app, revert state here
            setInvoices(prev => prev.map(inv =>
                inv.id === id ? { ...inv, status: InvoiceStatus.PENDING } : inv
            ));
            showToast("Flagging failed", 'error');
        }
    };

    // Export Financial Report
    const handleExportFinancialReport = () => {
        const reportDate = new Date().toLocaleDateString();
        const reportTime = new Date().toLocaleTimeString();

        // Calculate P&L metrics
        const totalRevenue = financialKPIs.find(k => k.label === 'Revenue')?.value || 0;
        const totalCOGS = financialKPIs.find(k => k.label === 'COGS')?.value || 0;
        const grossProfit = totalRevenue - totalCOGS;
        const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : '0.00';

        // Calculate AP metrics
        const pendingInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PENDING);
        const approvedInvoices = invoices.filter(inv => inv.status === InvoiceStatus.APPROVED);
        const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE);

        // Generate report content
        let reportContent = `
╔════════════════════════════════════════════════════════════╗
║          FINANCIAL REPORT - P&L STATEMENT                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Generated: ${reportDate} at ${reportTime.padEnd(20)}║
║  Compliance Mode: ${complianceMode.padEnd(35)}║
║  Report Type: Profit & Loss + Accounts Payable            ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  PROFIT & LOSS SUMMARY                                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Revenue:                    $${totalRevenue.toLocaleString().padStart(20)} ║
║  Cost of Goods Sold (COGS):  $${totalCOGS.toLocaleString().padStart(20)} ║
║  ─────────────────────────────────────────────────────     ║
║  Gross Profit:               $${grossProfit.toLocaleString().padStart(20)} ║
║  Gross Margin:                ${grossMargin}%${' '.repeat(20 - grossMargin.length)} ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  ACCOUNTS PAYABLE SUMMARY                                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Total AP Outstanding:       $${totalAP.toLocaleString().padStart(20)} ║
║  Pending Invoices:            ${pendingInvoices.length.toString().padStart(21)} ║
║  Approved Invoices:           ${approvedInvoices.length.toString().padStart(21)} ║
║  Overdue Invoices:            ${overdueInvoices.length.toString().padStart(21)} ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  INVOICE DETAILS                                           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
`;

        // Add invoice details
        invoices.slice(0, 10).forEach((inv, idx) => {
            reportContent += `║  ${(idx + 1).toString().padStart(2)}. ${inv.id.padEnd(15)} $${inv.amountDue.toLocaleString().padStart(10)} ${inv.status.padEnd(12)}║\n`;
        });

        if (invoices.length > 10) {
            reportContent += `║  ... and ${(invoices.length - 10)} more invoices${' '.repeat(30)}║\n`;
        }

        reportContent += `║                                                            ║
╠════════════════════════════════════════════════════════════╣
║  KEY FINANCIAL RATIOS                                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
`;

        // Add KPIs
        financialKPIs.forEach(kpi => {
            const label = kpi.label.padEnd(30);
            const value = typeof kpi.value === 'number' ? `$${kpi.value.toLocaleString()}` : kpi.value;
            reportContent += `║  ${label} ${value.toString().padStart(22)} ║\n`;
        });

        reportContent += `║                                                            ║
╚════════════════════════════════════════════════════════════╝

This is an official financial document.
Hash: 0x${Math.random().toString(16).substring(2, 18)}
        `;

        // Create blob and download
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Financial_Report_${Date.now()}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Financial report exported successfully", 'success');
    };

    // Calculate KPIs (Real-time based on state)
    const totalAP = invoices
        .filter(inv => ['PENDING', 'APPROVED', 'OVERDUE'].includes(inv.status))
        .reduce((acc, curr) => acc + curr.amountDue, 0);

    const overdueCount = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;

    const getAuditStatusText = () => {
        switch (complianceMode) {
            case ComplianceMode.PHARMA_US: return "21 CFR Part 11";
            case ComplianceMode.PHARMA_EU: return "EU GMP Compliant";
            case ComplianceMode.GCAP: return "Global Audit Pass";
            case ComplianceMode.DEFENCE:
            default: return "ITAR Secure";
        }
    };

    const plItems = financialKPIs.filter(k => k.type === 'PL');
    const bsItems = financialKPIs.filter(k => k.type === 'BS');

    return (
        <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto">

            {/* KPI Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="h-auto md:h-40">
                    <StatWidget
                        title="Total AP"
                        value={`$${(totalAP / 1000).toFixed(1)}k`}
                        icon={DollarSign}
                        color="blue"
                    />
                </div>
                <div className="h-auto md:h-40">
                    <StatWidget
                        title="Overdue Invoices"
                        value={overdueCount}
                        unit="Docs"
                        icon={Clock}
                        color={overdueCount > 0 ? 'orange' : 'default'}
                    />
                </div>
                <div className="h-auto md:h-40">
                    <StatWidget
                        title="Audit Status"
                        value={getAuditStatusText()}
                        icon={Lock}
                        color="default"
                    />
                </div>
                {/* COG Valuation Card */}
                <TacticalCard title="COG Valuation" className="bg-black text-white border-none h-auto md:h-40">
                    <div className="flex flex-col justify-between h-full mt-1 gap-2">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Current Method</p>
                            <p className="text-lg font-bold text-white flex items-center gap-2">
                                Weighted Avg
                                <TrendingUp size={16} className="text-green-400" />
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">Next Audit: Q4 2024</p>
                    </div>
                </TacticalCard>
            </div>

            {/* Core Financial Reporting */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Accounts Payable</h3>
                    <button
                        onClick={handleExportFinancialReport}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-key font-bold text-sm"
                    >
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Profit & Loss Summary */}
                    <TacticalCard title="Profit & Loss Summary (Q3 YTD)">
                        <div className="space-y-4 mt-2">
                            {plItems.map((kpi, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <PieChart size={16} className="text-gray-500" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{kpi.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold text-gray-900">
                                            {kpi.name.includes('Margin') ? `${kpi.value}%` : `$${(kpi.value / 1000).toFixed(0)}k`}
                                        </p>
                                        <p className={`text-xs font-medium flex items-center justify-end gap-1 ${kpi.trend.includes('+') ? 'text-green-600' : 'text-red-500'}`}>
                                            {kpi.trend.includes('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {kpi.trend}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2 flex justify-end">
                                <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors">View Full Statement &rarr;</button>
                            </div>
                        </div>
                    </TacticalCard>

                    {/* Balance Sheet Snapshot */}
                    <TacticalCard title="Balance Sheet Snapshot">
                        <div className="space-y-4 mt-2">
                            {bsItems.map((kpi, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <Scale size={16} className="text-gray-500" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{kpi.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold text-gray-900">{kpi.value}</p>
                                        <p className="text-xs font-medium text-gray-500">{kpi.trend}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mt-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className="text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Liquidity Insight</span>
                                </div>
                                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                                    Current ratio indicates healthy liquidity. Sufficient working capital to support planned Q4 inventory expansion.
                                </p>
                            </div>
                        </div>
                    </TacticalCard>
                </div>
            </div>

            {/* Invoice Ledger */}
            <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Auditable AP Ledger</h3>
                    <div className="flex gap-2">
                        <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black px-3 py-1 bg-gray-50 rounded-lg transition-colors">Open</button>
                        <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black px-3 py-1 transition-colors">History</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr>
                                <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice ID</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">GL Account</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map(inv => {
                                const vendor = INITIAL_VENDORS.find(v => v.id === inv.vendorId);
                                return (
                                    <tr key={inv.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{inv.id}</td>
                                        <td className="py-4 text-sm text-gray-900 font-medium">{vendor?.name}</td>
                                        <td className="py-4 text-sm font-mono text-gray-500">{inv.glAccount}</td>
                                        <td className="py-4 text-sm text-gray-500">{inv.date.split('T')[0]}</td>
                                        <td className="py-4 text-sm font-mono font-medium text-gray-900">${inv.amountDue.toLocaleString()}</td>
                                        <td className="py-4">
                                            <StatusBadge status={inv.status} />
                                        </td>
                                        <td className="py-4 pr-2 text-right">
                                            <div className="flex justify-end gap-2">
                                                {inv.status === InvoiceStatus.PENDING && (
                                                    <>
                                                        <button
                                                            onClick={() => approveInvoice(inv.id)}
                                                            disabled={!isFinanceAuthorized}
                                                            className={`p-2 rounded-lg transition-colors ${isFinanceAuthorized ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                            title={isFinanceAuthorized ? "Approve (C)" : "Role Restricted"}
                                                        >
                                                            <Check size={16} strokeWidth={3} />
                                                        </button>
                                                        <button
                                                            onClick={() => flagInvoice(inv.id)}
                                                            disabled={!isFinanceAuthorized}
                                                            className={`p-2 rounded-lg transition-colors ${isFinanceAuthorized ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                            title={isFinanceAuthorized ? "Flag Overdue (D)" : "Role Restricted"}
                                                        >
                                                            <AlertTriangle size={16} strokeWidth={2.5} />
                                                        </button>
                                                    </>
                                                )}
                                                {inv.status === InvoiceStatus.APPROVED && (
                                                    <span className="text-xs font-bold text-green-600 flex items-center h-8">Ready for Payment</span>
                                                )}
                                                {inv.status === InvoiceStatus.OVERDUE && (
                                                    <span className="text-xs font-bold text-red-600 flex items-center h-8">Flagged</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};