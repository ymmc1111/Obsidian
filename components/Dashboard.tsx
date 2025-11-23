import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TacticalCard, StatWidget } from './Shared';
import { AlertCircle, CheckCircle2, Package, Zap, Sparkles, Bot, Plus } from 'lucide-react';
import { ComplianceMode } from '../types';

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

      {/* Workflow Builder */}
      <TacticalCard title="Adaptive Workflow Builder" className="col-span-1 md:col-span-2 bg-gray-50 border-dashed border-gray-200">
         <div className="flex flex-col items-center justify-center h-full py-6 text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-key flex items-center justify-center mb-3 text-gray-400">
                <Zap size={24} />
            </div>
            <h4 className="text-gray-900 font-bold">No-Code Logic</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1 mb-4">Create event-driven triggers without engineering support.</p>
            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                <Plus size={16} />
                <span>Create Custom Logic</span>
            </button>
         </div>
      </TacticalCard>

    </div>
  );
};