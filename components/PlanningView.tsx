
import React from 'react';
import { INITIAL_SCHEDULES, INITIAL_INVENTORY } from '../services/mockData';
import { TacticalCard, StatusBadge } from './Shared';
import { MapPin, Calendar, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const FORECAST_DATA = [
  { month: 'Nov', demand: 4000, capacity: 5000 },
  { month: 'Dec', demand: 3000, capacity: 4800 },
  { month: 'Jan', demand: 5500, capacity: 5000 }, // Over capacity
  { month: 'Feb', demand: 4500, capacity: 5200 },
];

export const PlanningView: React.FC = () => {
  // Extract unique locations from inventory for Facility Grid
  const uniqueLocations = Array.from(new Set(INITIAL_INVENTORY.map(i => i.location))).map(loc => {
    return {
      name: loc,
      status: loc.includes('SECURE') ? 'Restricted' : 'Nominal',
      occupancy: Math.floor(Math.random() * 40) + 50 // Mock percentage
    };
  });

  return (
    <div className="h-full flex flex-col bg-white p-8 gap-6 overflow-y-auto">
      
      {/* Top Section: Forecast & Facility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Demand vs Capacity Chart */}
        <TacticalCard title="Demand Forecast vs. Capacity" className="lg:col-span-2 h-80">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORECAST_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
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

        {/* Facility Locations Grid */}
        <TacticalCard title="Facility Locations Grid" className="h-80 overflow-hidden flex flex-col">
           <div className="overflow-y-auto pr-2 space-y-3 mt-2 flex-1">
              {uniqueLocations.map((loc, idx) => (
                 <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${loc.status === 'Restricted' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">{loc.status} Access</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-600">{loc.occupancy}% Full</p>
                       <div className="w-12 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${loc.occupancy > 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${loc.occupancy}%` }}></div>
                       </div>
                    </div>
                 </div>
              ))}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium">
                 + Add New Zone
              </div>
           </div>
        </TacticalCard>
      </div>

      {/* Production Schedule Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900">Master Production Schedule</h3>
            <div className="flex items-center gap-2">
               <span className="text-xs font-medium text-gray-400">View:</span>
               <button className="text-xs font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-900">Weekly</button>
               <button className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-50">Monthly</button>
            </div>
         </div>
         
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr>
                     <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule ID</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Part Number</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Machine Center</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Planned Qty</th>
                     <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Load Factor</th>
                     <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {INITIAL_SCHEDULES.map(sch => (
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
                           <StatusBadge status={sch.status} />
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
