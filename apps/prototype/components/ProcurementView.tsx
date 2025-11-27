import React, { useState, useEffect, useCallback } from 'react';
import { BackendAPI } from '../services/backend/api.ts';
import { StatusBadge, TacticalCard, Toast } from './Shared.tsx';
import { ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, RefreshCw, Plus, X, Package, DollarSign, Download } from 'lucide-react';
import { PurchaseOrder, Vendor, PurchaseOrderStatus, SystemUser } from '../types.ts';
import { MOCK_PART_NUMBERS } from '../services/mockData.ts';

// --- Purchase Order Form Component (Modal) ---
interface POFormProps {
   onClose: () => void;
   vendors: Vendor[];
   onNewPO: (newPO: PurchaseOrder) => void;
   currentUser: SystemUser | null;
}

const POForm: React.FC<POFormProps> = ({ onClose, vendors, onNewPO, currentUser }) => {
   const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
   const [partNumber, setPartNumber] = useState(MOCK_PART_NUMBERS[0]);
   const [qty, setQty] = useState('100');
   const [unitCost, setUnitCost] = useState('12.50');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async () => {
      if (!vendorId || !partNumber || !qty || !unitCost) {
         setError("All fields are required.");
         return;
      }

      setLoading(true);
      setError(null);

      try {
         const poData = {
            vendorId,
            items: [{
               partNumber,
               qty: parseInt(qty, 10),
               unitCost: parseFloat(unitCost)
            }]
         };

         // F. Create Purchase Order - Passed currentUser
         const newPO = await BackendAPI.createPurchaseOrder(poData, currentUser);
         onNewPO(newPO);
         onClose();
      } catch (e) {
         console.error("Failed to create PO:", e);
         setError("Failed to submit Purchase Order. Check console for details.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
         <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100 max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-display font-bold text-gray-900">Create New Purchase Order (F)</h3>
               <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-gray-500" />
               </button>
            </div>

            <div className="space-y-4">
               {/* Vendor Selection */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor</label>
                  <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}
                     className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading}>
                     {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.cageCode})</option>
                     ))}
                  </select>
               </div>

               <h4 className="text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">Order Item Details (Single Item Mock)</h4>

               {/* Part Number */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Part Number</label>
                  <select value={partNumber} onChange={(e) => setPartNumber(e.target.value)}
                     className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading}>
                     {MOCK_PART_NUMBERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                     <input type="number" value={qty} onChange={(e) => setQty(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" min="1" disabled={loading} />
                  </div>
                  {/* Unit Cost */}
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Unit Cost ($)</label>
                     <input type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium font-mono focus:ring-2 focus:ring-black/5 outline-none" min="0.01" step="0.01" disabled={loading} />
                  </div>
               </div>

               {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            </div>

            <button
               onClick={handleSubmit}
               disabled={loading}
               className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
               {loading ? <RefreshCw size={20} className="animate-spin" /> : 'Submit Purchase Order (F)'}
            </button>
         </div>
      </div>
   );
};
// --- End PO Form Component ---

interface ProcurementViewProps {
   currentUser: SystemUser | null; // Added currentUser prop
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({ currentUser }) => {
   const [vendors, setVendors] = useState<Vendor[]>([]);
   const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
   const [resolvingId, setResolvingId] = useState<string | null>(null);
   const [isPOModalOpen, setIsPOModalOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(true); // Added explicit loading state
   const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

   const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
   };

   // Initial Data Load (Fixes the hang by ensuring try...catch)
   useEffect(() => {
      const loadProcurementData = async () => {
         try {
            // Ensure both promises are handled together
            const [vendorData, poData] = await Promise.all([
               BackendAPI.getVendors(),
               BackendAPI.getPurchaseOrders()
            ]);
            setVendors(vendorData);
            setPurchaseOrders(poData);
         } catch (e) {
            console.error("Failed to load procurement data (Vendors or POs):", e);
            // CRITICAL FIX: Set state to empty arrays on failure 
            // to exit the initial loading screen and prevent hang.
            setVendors([]);
            setPurchaseOrders([]);
            // Optionally alert the user that mock data could not be loaded
         } finally {
            setIsLoading(false); // Guarantees the component will render
         }
      };
      loadProcurementData();
   }, []); // Empty dependency array means it runs once on mount

   // Update PO list after creation (F)
   const handleNewPO = useCallback((newPO: PurchaseOrder) => {
      setPurchaseOrders(prev => [newPO, ...prev]);
   }, []);

   // H. Toggle Vendor Status (Active <-> On Hold)
   const toggleVendorStatus = async (id: string, currentStatus: 'Active' | 'On Hold') => {
      const newStatus = currentStatus === 'Active' ? 'On Hold' : 'Active';
      try {
         // Passed currentUser to updateVendorStatus
         await BackendAPI.updateVendorStatus(id, newStatus, currentUser);
         // Optimistic UI Update (API has the logic to log the audit trail)
         setVendors(prev => prev.map(v =>
            v.id === id ? { ...v, status: newStatus } : v
         ));
      } catch (e) {
         console.error("Failed to update vendor status:", e);
         alert("Failed to update vendor status.");
      }
   };

   // Mock logic for 3-Way Match (I)
   const getMatchStatus = (id: string) => {
      if (id === 'PO-2024-001') return 'Complete';
      if (id === 'PO-2024-002') return 'Pending';
      if (id === 'PO-2024-003') return 'Mismatched';
      // New POs are always pending until received/invoiced
      if (id.startsWith('PO-NEW')) return 'Pending';
      return 'Pending';
   };

   // I. Resolve Mismatch Action
   const resolveMatch = (id: string) => {
      setResolvingId(id);
      // Simulate API call and final confirmation
      setTimeout(() => {
         setResolvingId(null);
         showToast(`Discrepancy for ${id} flagged for manual override.`, 'success');
      }, 1000);
   };

   // Receive PO Action
   const handleReceive = async (poId: string) => {
      try {
         const updatedPO = await BackendAPI.receivePurchaseOrder(poId, currentUser);
         setPurchaseOrders(prev => prev.map(po => po.id === poId ? updatedPO : po));
         showToast(`PO ${poId} received. Inventory updated.`, 'success');
      } catch (e) {
         console.error("Failed to receive PO:", e);
         showToast("Failed to receive PO.", 'error');
      }
   };

   // Export CSV Action
   const handleExportCSV = () => {
      const headers = ['PO Number', 'Vendor', 'Date', 'Total Amount', 'Status'];
      const rows = purchaseOrders.map(po => {
         const vendor = vendors.find(v => v.id === po.vendorId);
         return [
            po.id,
            vendor?.name || 'Unknown',
            po.date,
            po.totalAmount.toFixed(2),
            po.status
         ].join(',');
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "purchase_orders.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Purchase Orders exported to CSV.", 'success');
   };

   // Renders the loading screen while data is being fetched
   if (isLoading) {
      return (
         <div className="flex items-center justify-center h-full text-gray-500">Loading Procurement Data...</div>
      );
   }

   // CRITICAL FIX: Explicit check for null/undefined 'vendors' to fix the TypeError: Cannot read properties of undefined (reading 'length')
   // This is the correct guard once isLoading is false.
   if (!vendors || vendors.length === 0) {
      return (
         <div className="flex items-center justify-center h-full text-gray-500">No Vendor Data Available. Please check system health.</div>
      );
   }


   return (
      <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto">

         {/* PO Creation Modal */}
         {isPOModalOpen && (
            <POForm
               onClose={() => setIsPOModalOpen(false)}
               vendors={vendors}
               onNewPO={handleNewPO}
               currentUser={currentUser} // Passed currentUser prop
            />
         )}

         {/* Top Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
               <div className="flex flex-col sm:flex-row sm:items-end justify-between h-full pb-2 gap-4">
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
                  <button className="flex items-center justify-center gap-2 text-sm font-bold text-black bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto">
                     Review Exceptions <ArrowRight size={16} />
                  </button>
               </div>
            </TacticalCard>
         </div>

         {/* Vendor Management Table (H. Vendor Management) */}
         <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Vendor Compliance Grid</h3>
               <button className="flex items-center gap-2 text-sm font-bold text-black bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                  <Plus size={16} /> Add New Vendor
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
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
                                 onClick={() => toggleVendorStatus(vendor.id, vendor.status)}
                                 className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${vendor.status === 'Active'
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                              >
                                 {vendor.status === 'Active' ? 'Set On Hold (H)' : 'Activate (H)'}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* PO Table (F. Create Purchase Order) */}
         <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Active Purchase Orders</h3>
               <div className="flex gap-2 w-full sm:w-auto">
                  <button
                     onClick={handleExportCSV}
                     className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex-1 sm:flex-initial justify-center"
                  >
                     <Download size={16} />
                     Export CSV
                  </button>
                  <button
                     onClick={() => setIsPOModalOpen(true)}
                     className="flex items-center gap-2 text-sm font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors shadow-key flex-1 sm:flex-initial justify-center"
                  >
                     <Plus size={16} />
                     Create New PO (F)
                  </button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                     <tr>
                        <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">PO Number</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Line Item</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">3-Way Match (I)</th>
                        <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {[...purchaseOrders].reverse().map(po => { // Reverse to show new POs first
                        const vendor = vendors.find(v => v.id === po.vendorId);
                        const matchStatus = getMatchStatus(po.id);
                        const lineItem = po.items[0]; // Assuming single item for mock
                        return (
                           <tr key={po.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{po.id}</td>
                              <td className="py-4 text-sm font-medium text-gray-900">{vendor?.name}</td>
                              <td className="py-4 text-xs text-gray-500">
                                 <span className="font-bold text-gray-800">{lineItem.partNumber}</span> ({lineItem.qty} units)
                              </td>
                              <td className="py-4 text-sm font-mono font-medium text-gray-900">${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="py-4"><StatusBadge status={po.status} /></td>
                              <td className="py-4">
                                 <div className="flex items-center gap-2">
                                    <StatusBadge status={matchStatus} />
                                    {matchStatus === 'Mismatched' && <AlertTriangle size={14} className="text-red-500" />}
                                 </div>
                              </td>
                              <td className="py-4 pr-2 text-right">
                                 {matchStatus === 'Mismatched' ? (
                                    <button
                                       onClick={() => resolveMatch(po.id)}
                                       disabled={resolvingId === po.id}
                                       className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                                    >
                                       {resolvingId === po.id ? <RefreshCw size={12} className="animate-spin" /> : null}
                                       Resolve (I)
                                    </button>
                                 ) : po.status === PurchaseOrderStatus.SENT || po.status === PurchaseOrderStatus.PARTIAL ? (
                                    <button
                                       onClick={() => handleReceive(po.id)}
                                       className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 ml-auto"
                                    >
                                       <Package size={12} /> Receive
                                    </button>
                                 ) : (
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
         {/* Toast Notification */}
         {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
   );
};