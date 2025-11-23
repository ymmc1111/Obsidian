import React, { useState } from 'react';
import { INITIAL_ORDERS } from '../services/mockData';
import { TacticalCard, StatusBadge } from './Shared';
import { Globe, Truck, RotateCcw, Box, RefreshCcw } from 'lucide-react';
import { SalesOrder } from '../types';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);

  // Action: Reroute Order
  const rerouteOrder = (id: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const newLocation = order.fulfillmentLocation === 'US-East WH (Secure)' 
          ? 'Nevada Depot' 
          : 'US-East WH (Secure)';
        return { ...order, fulfillmentLocation: newLocation };
      }
      return order;
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white p-8 gap-6 overflow-y-auto">
      
      {/* Top Logic Engines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <TacticalCard title="Fulfillment Logic Engine">
           <div className="mt-2 space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Globe size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Active Rule #1</p>
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                       If Customer is <span className="font-bold">DoD/Space</span>, Route to: <span className="font-bold">US-East WH (ITAR Compliant)</span>
                    </p>
                 </div>
                 <div className="text-right">
                    <StatusBadge status="Active" />
                    <p className="text-[10px] text-gray-400 mt-1">Run: 4m ago</p>
                 </div>
              </div>
           </div>
        </TacticalCard>

        <TacticalCard title="Returns (RMA) Tracking">
           <div className="flex gap-4 mt-2">
              <div className="flex-1 p-4 bg-orange-50 rounded-2xl flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Truck size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">In-Transit</span>
                 </div>
                 <p className="text-3xl font-display font-bold text-gray-900">4</p>
              </div>
              <div className="flex-1 p-4 bg-red-50 rounded-2xl flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-red-600 mb-2">
                    <Box size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">Quarantine</span>
                 </div>
                 <p className="text-3xl font-display font-bold text-gray-900">12</p>
              </div>
              <div className="flex items-center justify-center p-4">
                 <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                    <RotateCcw size={20} />
                 </button>
              </div>
           </div>
        </TacticalCard>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Global Sales Orders</h3>
            <button className="text-sm font-medium text-gray-400 hover:text-black">Export Manifest</button>
         </div>
         
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr>
                     <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment Node</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Backorder</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                     <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Route Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {orders.map(so => (
                     <tr key={so.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{so.id}</td>
                        <td className="py-4 text-sm font-bold text-gray-900">{so.customer}</td>
                        <td className="py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-500 ${
                              so.fulfillmentLocation.includes('Secure') ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                           }`}>
                              <ShieldCheck size={12} /> {so.fulfillmentLocation}
                           </span>
                        </td>
                        <td className="py-4">
                           {so.backorderedItems > 0 ? (
                              <span className="text-xs font-bold text-red-500">{so.backorderedItems} Items</span>
                           ) : (
                              <span className="text-xs text-gray-400">-</span>
                           )}
                        </td>
                        <td className="py-4 text-sm font-mono font-medium text-gray-900">${so.totalAmount.toLocaleString()}</td>
                        <td className="py-4">
                           <StatusBadge status={so.status} />
                        </td>
                        <td className="py-4 pr-2 text-right">
                           <button 
                              onClick={() => rerouteOrder(so.id)}
                              className="text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                           >
                              <RefreshCcw size={12} /> Reroute
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

function ShieldCheck({ size, className }: { size: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}