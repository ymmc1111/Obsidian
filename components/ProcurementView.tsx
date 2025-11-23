import React, { useState } from 'react';
import { INITIAL_POS, INITIAL_VENDORS } from '../services/mockData';
import { StatusBadge, TacticalCard } from './Shared';
import { ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { PurchaseOrder, Vendor } from '../types';

export const ProcurementView: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Toggle Vendor Status (Active <-> On Hold)
  const toggleVendorStatus = (id: string) => {
    setVendors(prev => prev.map(v => 
      v.id === id ? { ...v, status: v.status === 'Active' ? 'On Hold' : 'Active' } : v
    ));
  };

  // Mock logic for 3-Way Match
  const getMatchStatus = (id: string) => {
    if (id === 'PO-2024-001') return 'Complete';
    if (id === 'PO-2024-002') return 'Pending';
    if (id === 'PO-2024-003') return 'Mismatched';
    return 'Pending';
  };

  // Resolve Mismatch Action
  const resolveMatch = (id: string) => {
    setResolvingId(id);
    // Simulate API call
    setTimeout(() => {
      setResolvingId(null);
      // In a real app, this would update the Receiving Slip or Invoice to match
      alert(`Discrepancy for ${id} has been flagged for manual override.`);
    }, 1000);
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

      {/* Vendor Management Table */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Vendor Compliance Grid</h3>
        </div>
        <div className="overflow-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr>
                    <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor Name</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CAGE Code</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {vendors.map(vendor => (
                    <tr key={vendor.id} className="group hover:bg-gray-50 transition-colors">
                       <td className="py-4 pl-2 font-medium text-gray-900">{vendor.name}</td>
                       <td className="py-4 text-sm font-mono text-gray-500">{vendor.cageCode}</td>
                       <td className="py-4 text-sm text-gray-500">{vendor.contact}</td>
                       <td className="py-4"><StatusBadge status={vendor.status} /></td>
                       <td className="py-4 pr-2 text-right">
                          <button 
                             onClick={() => toggleVendorStatus(vendor.id)}
                             className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                vendor.status === 'Active' 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                             }`}
                          >
                             {vendor.status === 'Active' ? 'Set On Hold' : 'Activate'}
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* PO Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Active Purchase Orders</h3>
         </div>
         
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr>
                     <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">PO Number</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">3-Way Match</th>
                     <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {purchaseOrders.map(po => {
                     const vendor = vendors.find(v => v.id === po.vendorId);
                     const matchStatus = getMatchStatus(po.id);
                     return (
                        <tr key={po.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{po.id}</td>
                           <td className="py-4 text-sm font-medium text-gray-900">{vendor?.name}</td>
                           <td className="py-4 text-sm font-mono font-medium text-gray-900">${po.totalAmount.toLocaleString()}</td>
                           <td className="py-4"><StatusBadge status={po.status} /></td>
                           <td className="py-4">
                              <div className="flex items-center gap-2">
                                 <StatusBadge status={matchStatus} />
                                 {matchStatus === 'Mismatched' && <AlertTriangle size={14} className="text-red-500" />}
                              </div>
                           </td>
                           <td className="py-4 pr-2 text-right">
                              {matchStatus === 'Mismatched' && (
                                 <button 
                                    onClick={() => resolveMatch(po.id)}
                                    disabled={resolvingId === po.id}
                                    className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                                 >
                                    {resolvingId === po.id ? <RefreshCw size={12} className="animate-spin" /> : null}
                                    Resolve
                                 </button>
                              )}
                              {matchStatus === 'Complete' && (
                                 <div className="flex justify-end">
                                     <CheckCircle size={18} className="text-green-500 opacity-50" />
                                 </div>
                              )}
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