import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TacticalCard } from './Shared';
import { AlertTriangle, Activity, Package, ShieldCheck } from 'lucide-react';

const DATA = [
  { name: 'Mon', value: 4000, compliance: 98 },
  { name: 'Tue', value: 3000, compliance: 99 },
  { name: 'Wed', value: 2000, compliance: 97 },
  { name: 'Thu', value: 2780, compliance: 100 },
  { name: 'Fri', value: 1890, compliance: 98 },
  { name: 'Sat', value: 2390, compliance: 100 },
  { name: 'Sun', value: 3490, compliance: 100 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 h-full overflow-y-auto">
      {/* KPI Cards */}
      <TacticalCard className="md:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">Readiness Level</p>
            <h2 className="text-2xl font-bold text-white">98.4%</h2>
          </div>
          <Activity className="text-emerald-500" />
        </div>
        <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 w-[98.4%] h-full"></div>
        </div>
      </TacticalCard>

      <TacticalCard className="md:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">Open NCRs</p>
            <h2 className="text-2xl font-bold text-amber-500">3</h2>
          </div>
          <AlertTriangle className="text-amber-500" />
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">2 Production, 1 Supply Chain</p>
      </TacticalCard>

       <TacticalCard className="md:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">Inventory Value</p>
            <h2 className="text-2xl font-bold text-white">$4.2M</h2>
          </div>
          <Package className="text-blue-500" />
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">152 Active SKUs</p>
      </TacticalCard>

       <TacticalCard className="md:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-mono uppercase">Compliance</p>
            <h2 className="text-2xl font-bold text-emerald-500">ITAR</h2>
          </div>
          <ShieldCheck className="text-emerald-500" />
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">Audited: Today 0800</p>
      </TacticalCard>

      {/* Main Chart */}
      <TacticalCard title="Production Throughput (Unit/Hr)" className="md:col-span-3 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ color: '#10b981' }}
              cursor={{fill: '#1e293b'}}
            />
            <Bar dataKey="value" fill="#10b981" barSize={30} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TacticalCard>

      <TacticalCard title="Quality Trends" className="md:col-span-1 h-80">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis domain={[90, 100]} stroke="#64748b" fontSize={10} />
                <Line type="monotone" dataKey="compliance" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
      </TacticalCard>
    </div>
  );
};