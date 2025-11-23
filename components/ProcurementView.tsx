import React from 'react';
import { INITIAL_POS, INITIAL_VENDORS } from '../services/mockData';
import { StatusBadge, TacticalCard } from './Shared';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const ProcurementView: React.FC = () => {
  
  // Logic to determine matching status based on mock ID
  const getMatchStatus = (id: string) => {
    if (id === 'PO-2024-001') return 'Complete';
    if (id === 'PO-2024-002') return 'Pending';
    if (id === 'PO-2024-003') return 'Mismatched';
    return 'Pending';
  };

  return (
    <div className="h-full flex flex-col bg-white p-8 gap-6 overflow-y-auto">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TacticalCard title="Vendor Gateway Access" className="md:col-span-1 bg-gray-900 text-white border-none">
          <div className="flex flex-col justify-between h-full">
             <div className="flex items-start gap-4 mt-2">
                <div className="p-3 bg-white/10 rounded-2xl">
                   <ShieldCheck className="text-green-400" size={24} />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-white">Titanium Dynamics</h4>
                   <p className="text-sm text-gray-400">CAGE: 1A2B3</p>
                </div>
             </div>
             <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                   <span className="text-gray-400">Portal Status</span>
                   <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <div className="bg-green-400 w-full h-full"></div>
                </div>
             </div>
          </div>
        </TacticalCard>

        <TacticalCard title="3-Way Match Velocity" className="md:col-span-2">
           <div className="flex items-end justify-between h-full pb-2">
              <div className="flex gap-8">
                 <div>
                    <p className="text-sm text-gray-400 mb-1">Auto-Matched</p>
                    <p className="text-3xl font-display font-bold text-gray-900">84%</p>
                 </div>
                 <div>
                    <p className="text-sm text-gray-400 mb-1">Exceptions</p>
                    <p className="text-3xl font-display font-bold text-gray-900">12</p>
                 </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-black bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                 Review Exceptions <ArrowRight size={16} />
              </button>
           </div>
        </TacticalCard>
      </div>

      {/* PO Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Active Purchase Orders</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
         </div>
         
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr>
                     <th className="pb-4 pl-2 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">PO Number</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Vendor</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Date</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Total</th>
                     <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                     <th className="pb-4 pr-2 text-right font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">3-Way Match</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {INITIAL_POS.map(po => {
                     const vendor = INITIAL_VENDORS.find(v => v.id === po.vendorId);
                     const matchStatus = getMatchStatus(po.id);
                     return (
                        <tr key={po.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{po.id}</td>
                           <td className="py-4">
                              <div className="font-medium text-gray-900 text-sm">{vendor?.name}</div>
                              <div className="text-[10px] text-gray-400">ID: {vendor?.id}</div>
                           </td>
                           <td className="py-4 text-sm text-gray-500">{po.date.split('T')[0]}</td>
                           <td className="py-4 text-sm font-mono font-medium text-gray-900">${po.totalAmount.toLocaleString()}</td>
                           <td className="py-4"><StatusBadge status={po.status} /></td>
                           <td className="py-4 pr-2 text-right">
                              <StatusBadge status={matchStatus} />
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