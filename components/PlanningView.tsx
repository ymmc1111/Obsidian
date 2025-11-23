import React from 'react';
import { INITIAL_SCHEDULES, INITIAL_CALIBRATIONS } from '../services/mockData';
import { TacticalCard, StatusBadge } from './Shared';
import { Zap, AlertCircle, PenTool, Calendar, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { ComplianceMode } from '../types';

const FORECAST_DATA = [
  { month: 'Nov', demand: 4000, capacity: 5000 },
  { month: 'Dec', demand: 3000, capacity: 4800 },
  { month: 'Jan', demand: 5500, capacity: 5000 }, // Over capacity
  { month: 'Feb', demand: 4500, capacity: 5200 },
];

// Mock transformation of schedules to Gantt-friendly data
// We simulate "Day 0" as Oct 28
const GANTT_DATA = INITIAL_SCHEDULES.map(sch => {
    let offset = 0;
    // Simple mock logic for date offset
    if (sch.startDate.includes('10-28')) offset = 0;
    if (sch.startDate.includes('11-01')) offset = 4;
    if (sch.startDate.includes('11-05')) offset = 8;
    if (sch.startDate.includes('11-12')) offset = 15;
    
    return {
        name: sch.machineCenter,
        offset: offset,
        duration: Math.ceil(sch.plannedQty / 20) + 2, // Mock duration based on qty
        status: sch.status,
        part: sch.partNumber
    };
});

interface PlanningViewProps {
    complianceMode?: ComplianceMode;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ complianceMode }) => {
  const isPharmaMode = complianceMode === ComplianceMode.PHARMA_US || complianceMode === ComplianceMode.PHARMA_EU;

  const getBarColor = (status: string) => {
      switch(status) {
          case 'Delayed': return '#EF4444'; // Red
          case 'In Progress': return '#F97316'; // Orange
          case 'Scheduled': 
          default: return '#1D1D1F'; // Black
      }
  };

  return (
    <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto">
      
      {/* Top: Gantt Timeline */}
      <TacticalCard title="Production Schedule Timeline" className="h-80 md:h-96">
         <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-900 rounded-sm"></div>Scheduled</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div>In Progress</div>
             <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div>Delayed</div>
         </div>
         <ResponsiveContainer width="100%" height="85%">
            <BarChart 
                data={GANTT_DATA} 
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
                    tick={{fontSize: 11, fill: '#6B7280', fontWeight: 500}} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    cursor={{fill: '#F9FAFB'}}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[1]?.payload; // Access the main bar payload
                            if (!data) return null;
                            return (
                                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs">
                                    <p className="font-bold text-gray-900 mb-1">{data.name}</p>
                                    <p className="text-gray-500">Part: <span className="font-mono text-gray-700">{data.part}</span></p>
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
                    {GANTT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                    ))}
                </Bar>
            </BarChart>
         </ResponsiveContainer>
         
         {/* Custom X-Axis Labels Simulation */}
         <div className="flex justify-between pl-[140px] pr-8 text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2">
            <span>Oct 28</span>
            <span>Nov 04</span>
            <span>Nov 11</span>
            <span>Nov 18</span>
            <span>Nov 25</span>
         </div>
      </TacticalCard>

      {/* Mid Section: Forecast & Calibration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Demand vs Capacity Chart */}
        <TacticalCard title="Demand Forecast vs. Capacity" className={`lg:col-span-${isPharmaMode ? '2' : '3'} h-80`}>
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORECAST_DATA} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
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

        {/* Pharma GxP Calibration (Conditional) */}
        {isPharmaMode && (
           <TacticalCard title="Calibration & PM Schedule" className="h-80 overflow-y-auto">
              <div className="space-y-3">
                  {INITIAL_CALIBRATIONS.map((cal, i) => (
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