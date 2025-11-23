
import React, { useState } from 'react';
import { INITIAL_INVOICES, INITIAL_VENDORS } from '../services/mockData';
import { TacticalCard, StatWidget, StatusBadge } from './Shared';
import { DollarSign, Clock, Lock, TrendingUp, Check, AlertTriangle } from 'lucide-react';
import { Invoice, InvoiceStatus, ComplianceMode } from '../types';

interface FinanceViewProps {
    complianceMode: ComplianceMode;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ complianceMode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Actions
  const approveInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: InvoiceStatus.APPROVED } : inv
    ));
  };

  const flagInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: InvoiceStatus.OVERDUE } : inv
    ));
  };
  
  // Calculate KPIs (Real-time based on state)
  const totalAP = invoices
    .filter(inv => ['PENDING', 'APPROVED', 'OVERDUE'].includes(inv.status))
    .reduce((acc, curr) => acc + curr.amountDue, 0);
    
  const overdueCount = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;

  const getAuditStatusText = () => {
      switch(complianceMode) {
          case ComplianceMode.PHARMA_US: return "21 CFR Part 11";
          case ComplianceMode.PHARMA_EU: return "EU GMP Compliant";
          case ComplianceMode.GCAP: return "Global Audit Pass";
          case ComplianceMode.DEFENCE:
          default: return "ITAR Secure";
      }
  };

  return (
    <div className="h-full flex flex-col bg-white p-8 gap-6 overflow-y-auto">
      
      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-40">
        <StatWidget 
            title="Total AP" 
            value={`$${(totalAP / 1000).toFixed(1)}k`} 
            icon={DollarSign} 
            color="blue"
        />
        <StatWidget 
            title="Overdue Invoices" 
            value={overdueCount} 
            unit="Docs"
            icon={Clock} 
            color={overdueCount > 0 ? 'orange' : 'default'}
        />
        <StatWidget 
            title="Audit Status" 
            value={getAuditStatusText()} 
            icon={Lock} 
            color="default"
        />
         {/* COG Valuation Card */}
        <TacticalCard title="COG Valuation" className="bg-black text-white border-none">
            <div className="flex flex-col justify-between h-full mt-1">
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

      {/* Invoice Ledger */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Auditable AP Ledger</h3>
            <div className="flex gap-2">
                <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black px-3 py-1 bg-gray-50 rounded-lg transition-colors">Open</button>
                <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black px-3 py-1 transition-colors">History</button>
            </div>
         </div>
         
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
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
                                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                            title="Approve"
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                        <button 
                                            onClick={() => flagInvoice(inv.id)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                            title="Flag Overdue"
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
    </div>
  );
};
