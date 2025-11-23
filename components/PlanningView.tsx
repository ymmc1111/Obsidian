import React, { useState, useEffect, useCallback } from 'react';
import { BackendAPI } from '../services/backend/api.ts';
import { TacticalCard, StatusBadge } from './Shared.tsx';
import { Zap, AlertCircle, PenTool, X, Plus, Edit3, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { ComplianceMode, ProductionSchedule, CalibrationRecord } from '../types.ts';

// Mock data for dropdowns (should eventually be API calls)
const MACHINE_CENTERS = ['CNC-Lathe-A', 'Assembly-Cleanroom', 'Cutting-Bay-1', '3D-Print-Metal', 'Laser-Engrave-B'];
const PART_NUMBERS = ['XB-70-TI', 'GUID-SYS-V4', 'THRUSTER-NZL-09', 'ELEC-CTRL-PCB', 'FRAME-ASSY-S2'];
const STATUS_OPTIONS = ['Scheduled', 'In Progress', 'Delayed'];

// --- Schedule Form Component (Modal) ---
const ScheduleForm = ({ onClose, scheduleToEdit }: { onClose: () => void, scheduleToEdit: ProductionSchedule | null }) => {
   const isEdit = !!scheduleToEdit;
   const [partNumber, setPartNumber] = useState(scheduleToEdit?.partNumber || PART_NUMBERS[0]);
   const [machineCenter, setMachineCenter] = useState(scheduleToEdit?.machineCenter || MACHINE_CENTERS[0]);
   const [plannedQty, setPlannedQty] = useState(scheduleToEdit?.plannedQty.toString() || '100');
   const [startDate, setStartDate] = useState(scheduleToEdit?.startDate || new Date().toISOString().split('T')[0]);
   const [status, setStatus] = useState(scheduleToEdit?.status || STATUS_OPTIONS[0]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async () => {
      if (!partNumber || !machineCenter || !plannedQty || !startDate) {
         setError("All fields are required.");
         return;
      }

      setLoading(true);
      setError(null);

      const scheduleData: Omit<ProductionSchedule, 'id' | 'loadFactor'> = {
         partNumber,
         machineCenter,
         plannedQty: parseInt(plannedQty, 10),
         startDate,
         status: status as 'Scheduled' | 'Delayed' | 'In Progress',
      };

      try {
         if (isEdit && scheduleToEdit) {
            // Update existing schedule
            await BackendAPI.updateProductionSchedule(scheduleToEdit.id, scheduleData);
         } else {
            // Create new schedule
            // Add a mock loadFactor (realistically calculated by backend, but needed for the UI type)
            await BackendAPI.addProductionSchedule({
               ...scheduleData,
               loadFactor: 0 // Will be set by Firestore seed/update if not sent
            });
         }
         onClose();
      } catch (e) {
         console.error("Schedule action failed:", e);
         setError("Failed to save schedule. Check console for details.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
         <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100 max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-display font-bold text-gray-900">{isEdit ? `Edit Schedule: ${scheduleToEdit?.id}` : 'Create New Production Schedule'}</h3>
               <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} className="text-gray-500" />
               </button>
            </div>

            <div className="space-y-4">
               {/* Part Number */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Part Number</label>
                  <select value={partNumber} onChange={(e) => setPartNumber(e.target.value)}
                     className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading}>
                     {PART_NUMBERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
               </div>
               {/* Machine Center */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Machine Center</label>
                  <select value={machineCenter} onChange={(e) => setMachineCenter(e.target.value)}
                     className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading}>
                     {MACHINE_CENTERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               {/* Quantity and Date - Side by Side */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Planned Quantity</label>
                     <input type="number" value={plannedQty} onChange={(e) => setPlannedQty(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" min="1" disabled={loading} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start Date</label>
                     <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} />
                  </div>
               </div>
               {/* Status */}
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                     className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} >
                     {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>

               {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            </div>

            <button
               onClick={handleSubmit}
               disabled={loading}
               className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
               {loading ? <Zap size={20} className="animate-spin" /> : (isEdit ? 'Save Changes' : 'Create Schedule')}
            </button>
         </div>
      </div>
   );
};
// --- End Schedule Form Component ---


// Updated FORECAST_DATA to cover 3 months (Oct, Nov, Dec)
const FORECAST_DATA = [
   { month: 'Oct', demand: 3800, capacity: 5000 },
   { month: 'Nov', demand: 5500, capacity: 5000 }, // Over capacity
   { month: 'Dec', demand: 4200, capacity: 5200 },
   { month: 'Jan', demand: 4000, capacity: 5000 }, // Next month
];

interface PlanningViewProps {
   complianceMode?: ComplianceMode;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ complianceMode }) => {
   const isPharmaMode = complianceMode === ComplianceMode.PHARMA_US || complianceMode === ComplianceMode.PHARMA_EU;

   const [schedules, setSchedules] = useState<ProductionSchedule[]>([]);
   const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);

   // CRUD State Management
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [scheduleToEdit, setScheduleToEdit] = useState<ProductionSchedule | null>(null);

   // Real-time Subscription to Production Schedules (Firestore)
   useEffect(() => {
      // 1. Load Calibrations once (still mock data from API)
      BackendAPI.getCalibrations().then(setCalibrations);

      // 2. Subscribe to Production Schedules in real-time
      const unsubscribe = BackendAPI.subscribeToProductionSchedules(setSchedules);

      // Return the unsubscribe function for cleanup
      return () => unsubscribe();
   }, []); // Empty dependency array means it runs once on mount

   // CRUD Handlers
   const handleOpenCreate = () => {
      setScheduleToEdit(null);
      setIsModalOpen(true);
   };

   const handleOpenEdit = (schedule: ProductionSchedule) => {
      setScheduleToEdit(schedule);
      setIsModalOpen(true);
   };

   const handleCloseModal = () => {
      setIsModalOpen(false);
      setScheduleToEdit(null);
   };

   const handleDelete = useCallback(async (scheduleId: string, partNumber: string) => {
      // Use custom modal for confirmation instead of alert/confirm
      if (!window.confirm(`SECURITY WARNING: Are you sure you want to delete schedule ${scheduleId} (${partNumber})? This action is logged.`)) {
         return;
      }

      try {
         // We are deliberately calling the exposed API endpoint here
         await BackendAPI.deleteProductionSchedule(scheduleId);
         // Firestore subscription handles the UI update automatically
      } catch (e) {
         console.error("Failed to delete schedule:", e);
         alert("Failed to delete schedule. Check console for details.");
      }
   }, []);


   const ganttData = schedules.map(sch => {
      // Calculate offset based on days from Oct 1st
      const date = new Date(sch.startDate);
      const startOfOct = new Date('2024-10-01');
      const diffTime = Math.abs(date.getTime() - startOfOct.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate offset and duration dynamically
      const offset = diffDays > 0 ? diffDays : 0;
      // Ensure duration calculation is robust
      const duration = Math.ceil(sch.plannedQty / 100) + Math.round(Math.random() * 5) || 5;

      return {
         name: sch.machineCenter,
         offset: offset,
         duration: duration,
         status: sch.status,
         part: sch.partNumber
      };
   });

   const getBarColor = (status: string) => {
      switch (status) {
         case 'Delayed': return '#EF4444'; // Red
         case 'In Progress': return '#F97316'; // Orange
         case 'Scheduled':
         case 'Completed': // Also a final state, often fine to be black/gray
         default: return '#1D1D1F'; // Black
      }
   };

   return (
      <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto">

         {/* Schedule Form Modal */}
         {isModalOpen && <ScheduleForm onClose={handleCloseModal} scheduleToEdit={scheduleToEdit} />}

         {/* Top: Gantt Timeline */}
         <TacticalCard
            title="Production Schedule Timeline"
            className="h-80 md:h-96"
            action={
               <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-key"
               >
                  <Plus size={16} />
                  Add Schedule (C)
               </button>
            }
         >
            <div className="text-sm text-gray-400 mb-2">
               [Image of Production Planning Gantt Chart]
            </div>
            <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-900 rounded-sm"></div>Scheduled / Completed</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div>In Progress</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>Delayed</div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
               <BarChart
                  data={ganttData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
                  barSize={20}
               >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                  <XAxis type="number" hide />
                  <YAxis
                     dataKey="name"
                     type="category"
                     width={120}
                     tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                     axisLine={false}
                     tickLine={false}
                  />
                  <Tooltip
                     cursor={{ fill: '#F9FAFB' }}
                     content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                           const data = payload[1]?.payload; // Access the main bar payload
                           if (!data) return null;
                           // Find the actual schedule item to show more detail (e.g., start date)
                           const scheduleItem = schedules.find(s => s.machineCenter === data.name && s.partNumber === data.part);

                           return (
                              <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs">
                                 <p className="font-bold text-gray-900 mb-1">{data.name}</p>
                                 <p className="text-gray-500">Part: <span className="font-mono text-gray-700">{data.part}</span></p>
                                 {scheduleItem && <p className="text-gray-500">Start: <span className="font-mono text-gray-700">{scheduleItem.startDate}</span></p>}
                                 <p className="text-gray-500">Est. Duration: {data.duration} days</p>
                                 <div className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${data.status === 'Delayed' ? 'bg-red-500' : data.status === 'In Progress' ? 'bg-orange-500' : 'bg-gray-900'}`}>
                                    {data.status}
                                 </div>
                              </div>
                           );
                        }
                        return null;
                     }}
                  />
                  {/* Transparent bar for offset */}
                  <Bar dataKey="offset" stackId="a" fill="transparent" />
                  {/* Actual duration bar */}
                  <Bar dataKey="duration" stackId="a" radius={[4, 4, 4, 4]}>
                     {ganttData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>

            {/* Custom X-Axis Labels Simulation */}
            <div className="flex justify-between pl-[140px] pr-8 text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2">
               <span>Oct 01</span>
               <span>Oct 15</span>
               <span>Nov 01</span>
               <span>Nov 15</span>
               <span>Dec 01</span>
               <span>Dec 15</span>
            </div>
         </TacticalCard>

         {/* Mid Section: Forecast & Calibration */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* Demand vs Capacity Chart */}
            <TacticalCard title="Demand Forecast vs. Capacity" className={`lg:col-span-${isPharmaMode ? '2' : '3'} h-80`}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FORECAST_DATA} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                     <Tooltip
                        cursor={{ fill: '#F9FAFB' }}
                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                     />
                     <Legend iconType="circle" />
                     <Bar dataKey="demand" name="Projected Demand" fill="#000000" radius={[4, 4, 4, 4]} barSize={30} />
                     <Bar dataKey="capacity" name="Max Capacity" fill="#E5E7EB" radius={[4, 4, 4, 4]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </TacticalCard>

            {/* Pharma GxP Calibration (Conditional) */}
            {isPharmaMode && (
               <TacticalCard title="Calibration & PM Schedule" className="h-80 overflow-y-auto">
                  <div className="space-y-3">
                     {calibrations.map((cal, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                 <PenTool size={16} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{cal.instrumentId}</p>
                                 <p className="text-xs text-gray-500">Next: {cal.nextCalibration}</p>
                              </div>
                           </div>
                           <StatusBadge status={cal.status} />
                        </div>
                     ))}
                  </div>
               </TacticalCard>
            )}
         </div>

         {/* Production Schedule Table */}
         <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Master Production Schedule</h3>
               <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 hidden sm:inline">View:</span>
                  <button className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-900">Weekly</button>
                  <button className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50">Monthly</button>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                     <tr>
                        <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule ID</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Part Number</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Machine Center</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Planned Qty</th>
                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Load Factor</th>
                        <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Status/Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {schedules.map(sch => (
                        <tr key={sch.id} className="group hover:bg-gray-50 transition-colors">
                           <td className="py-4 pl-2 font-mono text-sm font-medium text-gray-900">{sch.id}</td>
                           <td className="py-4 text-sm font-bold text-gray-900">{sch.partNumber}</td>
                           <td className="py-4">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                 <Zap size={14} className="text-gray-400" /> {sch.machineCenter}
                              </span>
                           </td>
                           <td className="py-4 text-sm text-gray-500">{sch.startDate}</td>
                           <td className="py-4 text-sm font-mono font-medium text-gray-900">{sch.plannedQty}</td>
                           <td className="py-4 w-32">
                              <div className="flex items-center gap-2">
                                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                       className={`h-full rounded-full ${sch.loadFactor > 90 ? 'bg-red-500' : sch.loadFactor > 75 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                       style={{ width: `${sch.loadFactor}%` }}
                                    ></div>
                                 </div>
                                 <span className="text-xs font-bold text-gray-500">{sch.loadFactor}%</span>
                              </div>
                           </td>
                           <td className="py-4 pr-2 text-right">
                              <div className="flex justify-end items-center gap-2">
                                 <StatusBadge status={sch.status} />
                                 <button
                                    onClick={() => handleOpenEdit(sch)}
                                    className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit Schedule"
                                 >
                                    <Edit3 size={16} />
                                 </button>
                                 <button
                                    onClick={() => handleDelete(sch.id, sch.partNumber)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Schedule"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                              {sch.status === 'Delayed' && (
                                 <div className="flex items-center justify-end gap-1 mt-1 text-red-500 text-[10px] font-bold uppercase">
                                    <AlertCircle size={10} /> Needs Attn
                                 </div>
                              )}
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