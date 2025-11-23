

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TacticalCard, StatWidget } from './Shared';
import { AlertCircle, CheckCircle2, Package, Zap, Sparkles, Bot, Plus, Activity, AlertTriangle } from 'lucide-react';
import { ComplianceMode } from '../types';
import { INITIAL_OEE_DATA } from '../services/mockData';

const DATA = [
  { name: 'M', value: 4000, compliance: 98 },
  { name: 'T', value: 3000, compliance: 99 },
  { name: 'W', value: 2000, compliance: 97 },
  { name: 'T', value: 2780, compliance: 100 },
  { name: 'F', value: 1890, compliance: 98 },
  { name: 'S', value: 2390, compliance: 100 },
  { name: 'S', value: 3490, compliance: 100 },
];

interface DashboardProps {
    complianceMode: ComplianceMode;
}

export const Dashboard: React.FC<DashboardProps> = ({ complianceMode }) => {
  const [simulationInput, setSimulationInput] = useState('');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    if (!simulationInput) return;
    setIsSimulating(true);
    setSimulationResult(null);
    
    // Mock AI delay
    setTimeout(() => {
        setIsSimulating(false);
        setSimulationResult("If we switch vendor V-101 to on-hold status, the lead time impact on PO-2024-001 is estimated at +14 days. Confidence: High.");
    }, 1500);
  };

  const getComplianceItems = () => {
      switch(complianceMode) {
          case ComplianceMode.PHARMA_US:
              return [
                  { label: '21 CFR Part 11 Audit', status: 'Secure', time: '09:00' },
                  { label: 'Batch Record Review', status: 'Pending', time: '11:15' },
                  { label: 'Instrument Calibration', status: 'Valid', time: 'Now' },
              ];
          case ComplianceMode.PHARMA_EU:
              return [
                  { label: 'Annex 11 Review', status: 'Secure', time: '08:30' },
                  { label: 'Cleanroom Env Log', status: 'Valid', time: '10:00' },
                  { label: 'QP Release Status', status: 'Pending', time: 'Now' },
              ];
          case ComplianceMode.GCAP:
               return [
                  { label: 'Global Audit Protocol', status: 'Secure', time: '07:00' },
                  { label: 'Export Control Status', status: 'Valid', time: '12:00' },
                  { label: 'Sustainability Metric', status: 'Valid', time: 'Now' },
              ];
          case ComplianceMode.DEFENCE:
          default:
              return [
                { label: 'ITAR Control', status: 'Secure', time: '08:00' },
                { label: 'CMMC Audit', status: 'Pending', time: '14:30' },
                { label: 'Material Certs', status: 'Valid', time: 'Now' },
              ];
      }
  };

  const complianceItems = getComplianceItems();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-8 h-full overflow-y-auto">
      
      {/* KPI Row */}
      <div className="col-span-1 h-40 md:h-48">
        <StatWidget 
          title="Readiness" 
          value="98.4" 
          unit="%" 
          icon={CheckCircle2} 
          color="default"
        />
      </div>
      <div className="col-span-1 h-40 md:h-48">
        <StatWidget 
          title="Active NCRs" 
          value="3" 
          trend="+1" 
          icon={AlertCircle} 
          color="orange"
        />
      </div>
      <div className="col-span-1 h-40 md:h-48">
        <StatWidget 
          title="Inventory" 
          value="$4.2M" 
          icon={Package} 
          color="blue"
        />
      </div>
      
      {/* Mini Chart Widget */}
      <TacticalCard className="col-span-1 h-40 md:h-48 bg-gray-900 text-white border-none" title="Velocity">
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
      <TacticalCard title="Production Throughput" className="col-span-1 md:col-span-2 lg:col-span-3 h-80 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
                barSize={30} 
                activeBar={{fill: '#007AFF'}}
            />
          </BarChart>
        </ResponsiveContainer>
      </TacticalCard>

      {/* Side Feed */}
      <TacticalCard title={`Compliance`} className="col-span-1 md:col-span-2 lg:col-span-1 h-auto md:h-96">
        <p className="text-xs text-gray-500 -mt-4 mb-4">Mode: {complianceMode}</p>
        <div className="space-y-4 md:space-y-6">
            {complianceItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div>
                        <p className="font-medium text-sm text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Pending' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                </div>
            ))}
            
            <div className="mt-auto pt-4 border-t border-gray-100 hidden md:block">
                <p className="text-xs text-gray-400 text-center">System Version 2.4.0</p>
            </div>
        </div>
      </TacticalCard>

      {/* Shop Floor Health (OEE) */}
      <TacticalCard title="Shop Floor Health (OEE)" className="col-span-1 md:col-span-2 lg:col-span-2">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {INITIAL_OEE_DATA.map((machine, i) => {
                const overallOEE = Math.round((machine.availability * machine.performance * machine.quality) / 10000);
                const isDown = machine.status === 'Down';
                return (
                    <div key={i} className={`p-4 rounded-2xl border ${isDown ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between h-32`}>
                        <div className="flex justify-between items-start">
                             <div>
                                <h4 className={`text-sm font-bold ${isDown ? 'text-red-700' : 'text-gray-900'}`}>{machine.machineId}</h4>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mt-1 ${isDown ? 'text-red-500' : 'text-green-600'}`}>
                                    {isDown ? <AlertTriangle size={10} /> : <Activity size={10} />}
                                    {machine.status}
                                </span>
                             </div>
                             {isDown && <div className="px-2 py-0.5 bg-red-200 text-red-700 rounded text-[10px] font-bold">{machine.alerts} Alerts</div>}
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">OEE Score</p>
                                <p className="text-2xl font-display font-bold text-gray-900">{overallOEE}%</p>
                            </div>
                            <div className="h-10 w-10 relative">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className={isDown ? 'text-red-500' : overallOEE > 85 ? 'text-green-500' : 'text-orange-500'} strokeDasharray={`${overallOEE}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                );
            })}
         </div>
      </TacticalCard>

      {/* AI Sandbox */}
      <TacticalCard title="Simulate Impact // AI Sandbox" className="col-span-1 md:col-span-2">
         <div className="flex flex-col gap-4 mt-2">
            <div className="relative">
                <Bot className="absolute left-4 top-3 text-gray-400" size={20} />
                <input 
                    type="text" 
                    value={simulationInput}
                    onChange={(e) => setSimulationInput(e.target.value)}
                    placeholder="Enter scenario (e.g., 'What if Vendor X is late?')"
                    className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-16 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
                <button 
                    onClick={runSimulation}
                    disabled={!simulationInput || isSimulating}
                    className="absolute right-2 top-1.5 px-4 py-1.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {isSimulating ? '...' : 'Run'}
                </button>
            </div>
            {simulationResult && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-blue-600" />
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Prediction</span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">{simulationResult}</p>
                </div>
            )}
         </div>
      </TacticalCard>

    </div>
  );
};