import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TacticalCard, StatWidget } from './Shared';
import { AlertCircle, CheckCircle2, Package } from 'lucide-react';

const DATA = [
  { name: 'M', value: 4000, compliance: 98 },
  { name: 'T', value: 3000, compliance: 99 },
  { name: 'W', value: 2000, compliance: 97 },
  { name: 'T', value: 2780, compliance: 100 },
  { name: 'F', value: 1890, compliance: 98 },
  { name: 'S', value: 2390, compliance: 100 },
  { name: 'S', value: 3490, compliance: 100 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 h-full overflow-y-auto">
      
      {/* KPI Row */}
      <div className="md:col-span-1 h-48">
        <StatWidget 
          title="Readiness" 
          value="98.4" 
          unit="%" 
          icon={CheckCircle2} 
          color="default"
        />
      </div>
      <div className="md:col-span-1 h-48">
        <StatWidget 
          title="Active NCRs" 
          value="3" 
          trend="+1" 
          icon={AlertCircle} 
          color="orange"
        />
      </div>
      <div className="md:col-span-1 h-48">
        <StatWidget 
          title="Inventory" 
          value="$4.2M" 
          icon={Package} 
          color="blue"
        />
      </div>
      
      {/* Mini Chart Widget */}
      <TacticalCard className="md:col-span-1 h-48 bg-gray-900 text-white border-none" title="Velocity">
         <div className="h-full w-full flex items-end pb-2">
            <ResponsiveContainer width="100%" height="70%">
                <AreaChart data={DATA}>
                    <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </TacticalCard>

      {/* Main Chart Section */}
      <TacticalCard title="Production Throughput" className="md:col-span-3 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} 
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9CA3AF', fontSize: 12}} 
            />
            <Tooltip 
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                padding: '12px 16px'
              }}
            />
            <Bar 
                dataKey="value" 
                fill="#1D1D1F" 
                radius={[6, 6, 6, 6]} 
                barSize={40} 
                activeBar={{fill: '#007AFF'}}
            />
          </BarChart>
        </ResponsiveContainer>
      </TacticalCard>

      {/* Side Feed */}
      <TacticalCard title="Compliance" className="md:col-span-1 h-96">
        <div className="space-y-6 mt-2">
            {[
                { label: 'ITAR Control', status: 'Secure', time: '08:00' },
                { label: 'CMMC Audit', status: 'Pending', time: '14:30' },
                { label: 'Material Certs', status: 'Valid', time: 'Now' },
            ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                        <p className="font-medium text-sm text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Pending' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                </div>
            ))}
            
            <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">System Version 2.4.0</p>
            </div>
        </div>
      </TacticalCard>

    </div>
  );
};