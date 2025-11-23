import React from 'react';
import { INITIAL_INVOICES, INITIAL_VENDORS } from '../services/mockData';
import { TacticalCard, StatWidget, StatusBadge } from './Shared';
import { DollarSign, Clock, Lock, TrendingUp } from 'lucide-react';

export const FinanceView: React.FC = () => {
  
  // Calculate KPIs
  const totalAP = INITIAL_INVOICES
    .filter(inv => ['PENDING', 'APPROVED', 'OVERDUE'].includes(inv.status))
    .reduce((acc, curr) => acc + curr.amountDue, 0);
    
  const overdueCount = INITIAL_INVOICES.filter(inv => inv.status === 'OVERDUE').length;

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
            title="ITAR Audit" 
            value="Secure" 
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
                     <th className="pb-4 pl-2 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Invoice ID</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Vendor</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">GL Account</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Date</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Amount</th>
                     <th className="pb-4 pr-2 text-right font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {INITIAL_INVOICES.map(inv => {
                     const vendor = INITIAL_VENDORS.find(v => v.id === inv.vendorId);
                     return (
                        <tr key={inv.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{inv.id}</td>
                           <td className="py-4 text-sm text-gray-900 font-medium">{vendor?.name}</td>
                           <td className="py-4 text-sm font-mono text-gray-500">{inv.glAccount}</td>
                           <td className="py-4 text-sm text-gray-500">{inv.date.split('T')[0]}</td>
                           <td className="py-4 text-sm font-mono font-medium text-gray-900">${inv.amountDue.toLocaleString()}</td>
                           <td className="py-4 pr-2 text-right">
                              <StatusBadge status={inv.status} />
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