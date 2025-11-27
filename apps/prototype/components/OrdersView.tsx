
import React, { useState } from 'react';
import { INITIAL_ORDERS, generateCoC } from '../services/mockData';
import { TacticalCard, StatusBadge, Toast } from './Shared';
import { Globe, Truck, RotateCcw, Box, RefreshCcw, FileCheck, CheckCircle2, FileText, Plus, X, Edit, Package } from 'lucide-react';
import { SalesOrder, CertificateOfConformance, ComplianceMode, SalesOrderStatus } from '../types';
import { telemetryService } from '../services/telemetryService';

interface OrdersViewProps {
   complianceMode: ComplianceMode;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ complianceMode }) => {
   const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
   const [generatedCoC, setGeneratedCoC] = useState<CertificateOfConformance | null>(null);
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

   const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
   };

   // Sales Order Form State
   const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
   const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

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

   const handleGenerateCoC = () => {
      // Start Trace
      const span = telemetryService.startSpan('coc_generation_process');

      if (orders.length > 0) {
         const coc = generateCoC(orders[0].id, complianceMode);
         setGeneratedCoC(coc);
         showToast("CoC Generated Successfully", 'success');
      }

      // End Trace (simulating completion immediately as mock func is sync)
      telemetryService.endSpan(span);
   };

   const handleGeneratePackingList = (orderId: string) => {
      // Mock Packing List Generation
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const content = `PACKING LIST\n\nOrder ID: ${order.id}\nCustomer: ${order.customer}\nLocation: ${order.fulfillmentLocation}\n\nItems:\n- Item A (Qty: 10)\n- Item B (Qty: 5)\n\nTotal Weight: 45kg\nVerified By: Logistics`;

      // Create a blob and download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PackingList_${orderId}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Packing List generated for ${orderId}`, 'success');
   };

   // Create/Update Sales Order
   const handleSaveOrder = (orderData: Omit<SalesOrder, 'id'>) => {
      if (editingOrder) {
         // Update existing order
         setOrders(prev => prev.map(o =>
            o.id === editingOrder.id ? { ...orderData, id: editingOrder.id } : o
         ));
         showToast(`Order ${editingOrder.id} updated successfully`, 'success');
      } else {
         // Create new order
         const newOrder: SalesOrder = {
            ...orderData,
            id: `SO-${Date.now()}`
         };
         setOrders(prev => [newOrder, ...prev]);
         showToast(`Order ${newOrder.id} created successfully`, 'success');
      }
      setIsOrderFormOpen(false);
      setEditingOrder(null);
   };

   // Update Order Status
   const handleUpdateStatus = (orderId: string, newStatus: SalesOrderStatus) => {
      setOrders(prev => prev.map(o =>
         o.id === orderId ? { ...o, status: newStatus } : o
      ));
      showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
   };

   // Allocate Inventory (Mock)
   const handleAllocateInventory = (orderId: string) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Mock allocation logic
      setOrders(prev => prev.map(o =>
         o.id === orderId ? { ...o, backorderedItems: 0 } : o
      ));
      showToast(`Inventory allocated for order ${orderId}`, 'success');
   };

   return (
      <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto relative">

         {/* Top Logic Engines */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            <TacticalCard title="Fulfillment Logic Engine">
               <div className="mt-2 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4 items-center">
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                        <Globe size={20} />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Active Rule #1</p>
                        <p className="text-sm font-medium text-gray-900 leading-snug">
                           If Customer is <span className="font-bold">DoD/Space</span>, Route to: <span className="font-bold">US-East WH (ITAR Compliant)</span>
                        </p>
                     </div>
                     <div className="text-right shrink-0">
                        <StatusBadge status="Active" />
                        <p className="text-[10px] text-gray-400 mt-1">Run: 4m ago</p>
                     </div>
                  </div>
               </div>
            </TacticalCard>

            <TacticalCard title="Returns (RMA) Tracking">
               <div className="flex flex-col sm:flex-row gap-4 mt-2">
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
         <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Global Sales Orders</h3>
               <div className="flex gap-2 w-full sm:w-auto">
                  <button
                     onClick={handleGenerateCoC}
                     className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-initial justify-center"
                  >
                     <FileCheck size={16} />
                     Generate CoC
                  </button>
                  <button
                     onClick={() => {
                        setEditingOrder(null);
                        setIsOrderFormOpen(true);
                     }}
                     className="flex items-center gap-2 text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-key flex-1 sm:flex-initial justify-center"
                  >
                     <Plus size={16} />
                     Create Order
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                     <tr>
                        <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Fulfillment Node</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Backorder</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {orders.map(so => (
                        <tr key={so.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{so.id}</td>
                           <td className="py-4 text-sm font-bold text-gray-900">{so.customer}</td>
                           <td className="py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-500 ${so.fulfillmentLocation.includes('Secure') ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
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
                              <div className="flex justify-end gap-2">
                                 {so.backorderedItems > 0 && (
                                    <button
                                       onClick={() => handleAllocateInventory(so.id)}
                                       className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                       title="Allocate Inventory"
                                    >
                                       <Package size={16} />
                                    </button>
                                 )}
                                 <button
                                    onClick={() => {
                                       setEditingOrder(so);
                                       setIsOrderFormOpen(true);
                                    }}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit Order"
                                 >
                                    <Edit size={16} />
                                 </button>
                                 <button
                                    onClick={() => handleGeneratePackingList(so.id)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Generate Packing List"
                                 >
                                    <FileText size={16} />
                                 </button>
                                 <button
                                    onClick={() => rerouteOrder(so.id)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Reroute Order"
                                 >
                                    <RefreshCcw size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* CoC Modal / Notification */}
         {generatedCoC && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
               <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center mb-6 text-green-500">
                     <CheckCircle2 size={48} />
                  </div>
                  <div className="text-center mb-6">
                     <h3 className="text-2xl font-display font-bold text-gray-900">CoC Generated</h3>
                     <p className="text-gray-500 mt-1">Official Compliance Artifact Created</p>
                  </div>

                  <div className="space-y-4 bg-gray-50 p-6 rounded-2xl mb-6">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Document ID</span>
                        <span className="font-mono font-bold text-gray-900">{generatedCoC.id}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Compliance Mode</span>
                        <span className="font-bold text-gray-900">{generatedCoC.complianceMode}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Inspection</span>
                        <span className="font-bold text-green-600">{generatedCoC.finalInspectionStatus}</span>
                     </div>
                     <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Digital Signature</p>
                        <p className="font-mono text-[10px] text-gray-500 break-all">{generatedCoC.digitalSignature}</p>
                     </div>
                     <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Statement</p>
                        <p className="text-xs text-gray-800 italic">{generatedCoC.complianceStatement}</p>
                     </div>
                  </div>

                  <button
                     onClick={() => setGeneratedCoC(null)}
                     className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors"
                  >
                     Dismiss & Archive
                  </button>
               </div>
            </div>
         )}

         {/* Sales Order Form Modal */}
         {isOrderFormOpen && (
            <SalesOrderForm
               order={editingOrder}
               onClose={() => {
                  setIsOrderFormOpen(false);
                  setEditingOrder(null);
               }}
               onSave={handleSaveOrder}
               onUpdateStatus={editingOrder ? handleUpdateStatus : undefined}
            />
         )}

         {/* Toast Notification */}
         {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
   );
};

// Sales Order Form Component
const SalesOrderForm = ({
   order,
   onClose,
   onSave,
   onUpdateStatus
}: {
   order: SalesOrder | null;
   onClose: () => void;
   onSave: (order: Omit<SalesOrder, 'id'>) => void;
   onUpdateStatus?: (orderId: string, status: SalesOrderStatus) => void;
}) => {
   const [formData, setFormData] = useState<Omit<SalesOrder, 'id'>>({
      customer: order?.customer || '',
      date: order?.date || new Date().toISOString().split('T')[0],
      totalAmount: order?.totalAmount || 0,
      status: order?.status || SalesOrderStatus.NEW,
      fulfillmentLocation: order?.fulfillmentLocation || 'US-East WH (Secure)',
      backorderedItems: order?.backorderedItems || 0
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
   };

   const handleStatusChange = (newStatus: SalesOrderStatus) => {
      if (order && onUpdateStatus) {
         onUpdateStatus(order.id, newStatus);
         setFormData({ ...formData, status: newStatus });
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
         <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 max-w-2xl w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-2xl font-display font-bold text-gray-900">
                     {order ? 'Edit Sales Order' : 'Create Sales Order'}
                  </h3>
                  {order && (
                     <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
                  )}
               </div>
               <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-gray-500" />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {/* Customer */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Customer Name
                  </label>
                  <input
                     type="text"
                     required
                     value={formData.customer}
                     onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                     placeholder="Enter customer name"
                  />
               </div>

               {/* Date */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Order Date
                  </label>
                  <input
                     type="date"
                     required
                     value={formData.date}
                     onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
               </div>

               {/* Total Amount */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Total Amount ($)
                  </label>
                  <input
                     type="number"
                     required
                     min="0"
                     step="0.01"
                     value={formData.totalAmount}
                     onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                     placeholder="0.00"
                  />
               </div>

               {/* Fulfillment Location */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Fulfillment Location
                  </label>
                  <select
                     value={formData.fulfillmentLocation}
                     onChange={(e) => setFormData({ ...formData, fulfillmentLocation: e.target.value })}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                     <option value="US-East WH (Secure)">US-East WH (Secure)</option>
                     <option value="Nevada Depot">Nevada Depot</option>
                     <option value="EU Distribution Center">EU Distribution Center</option>
                     <option value="APAC Hub">APAC Hub</option>
                  </select>
               </div>

               {/* Backordered Items */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Backordered Items
                  </label>
                  <input
                     type="number"
                     min="0"
                     value={formData.backorderedItems}
                     onChange={(e) => setFormData({ ...formData, backorderedItems: parseInt(e.target.value) })}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
               </div>

               {/* Status (for editing only) */}
               {order && onUpdateStatus && (
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Order Status
                     </label>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.values(SalesOrderStatus).map((status) => (
                           <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(status)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${formData.status === status
                                 ? 'bg-black text-white shadow-key'
                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                 }`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Actions */}
               <div className="flex gap-3 pt-4">
                  <button
                     type="submit"
                     className="flex-1 py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors"
                  >
                     {order ? 'Update Order' : 'Create Order'}
                  </button>
                  <button
                     type="button"
                     onClick={onClose}
                     className="flex-1 py-3.5 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                  >
                     Cancel
                  </button>
               </div>
            </form>
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
