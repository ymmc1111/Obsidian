import React, { useState } from 'react';
import { ProductionRun, TravelerStep } from '../types';
import { TacticalCard, StatusBadge } from './Shared';
import { CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';

interface TravelerViewProps {
  traveler: ProductionRun;
}

export const TravelerView: React.FC<TravelerViewProps> = ({ traveler }) => {
  // Simulate local state for step completion
  const [steps, setSteps] = useState<TravelerStep[]>(traveler.steps);
  const currentStep = steps.find(s => !s.completed);

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(step => {
        if (step.id === id) {
            return { 
                ...step, 
                completed: !step.completed, 
                completedBy: !step.completed ? 'Current User' : undefined,
                timestamp: !step.completed ? new Date().toISOString() : undefined
            };
        }
        return step;
    }));
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto">
        {/* Traveler Header */}
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold font-mono text-white">{traveler.id}</h1>
                    <StatusBadge status={traveler.status} />
                </div>
                <p className="text-slate-400 text-sm">Target: <span className="text-slate-200">{traveler.partNumber}</span> (Qty: {traveler.quantity})</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-mono">Traceability ID</p>
                <p className="font-mono text-defense-accent">UUID-{Math.random().toString(16).slice(2, 8).toUpperCase()}</p>
            </div>
        </div>

        {/* Genealogy / Tree Mockup */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 uppercase">Genealogy Path:</span>
            <span className="bg-slate-800 px-2 py-1 rounded">Project Alpha</span>
            <span className="text-slate-600">→</span>
            <span className="bg-slate-800 px-2 py-1 rounded">Propulsion Sub-Assy</span>
            <span className="text-slate-600">→</span>
            <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-900 px-2 py-1 rounded">Current Item</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps List */}
            <div className="lg:col-span-2 space-y-4">
                {steps.map((step, index) => {
                    const isActive = !step.completed && (!steps[index - 1] || steps[index - 1].completed);
                    return (
                        <div 
                            key={step.id} 
                            className={`relative border rounded-lg p-4 transition-all ${
                                isActive 
                                    ? 'bg-defense-800 border-defense-accent shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                                    : 'bg-defense-900 border-slate-800 opacity-80'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="text-xs font-mono font-bold text-slate-500">OP {step.order * 10}</div>
                                    <h3 className={`font-medium ${step.completed ? 'text-emerald-500' : 'text-slate-200'}`}>
                                        {step.instruction}
                                    </h3>
                                </div>
                                {step.completed ? (
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                ) : (
                                    <Circle className="text-slate-600" size={20} />
                                )}
                            </div>

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <FileText size={12}/> Role: {step.requiredRole}
                                </span>
                                {step.timestamp && (
                                    <span>Time: {new Date(step.timestamp).toLocaleTimeString()}</span>
                                )}
                                {step.completedBy && (
                                    <span>Auth: {step.completedBy}</span>
                                )}
                            </div>

                            {/* Inputs */}
                            {isActive && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    {step.inputs?.map((input, idx) => (
                                        <div key={idx} className="mb-3">
                                            <label className="block text-xs uppercase text-slate-400 mb-1">{input.label}</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-black/30 border border-slate-600 rounded p-2 text-sm focus:border-defense-accent focus:outline-none text-white font-mono"
                                                placeholder={input.type === 'passfail' ? "Enter PASS / FAIL" : "Data Input..."} 
                                            />
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => toggleStep(step.id)}
                                        className="mt-2 w-full bg-defense-accent hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded text-sm uppercase tracking-wide transition"
                                    >
                                        Digitally Sign & Complete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Side Panel (Docs & NCRs) */}
            <div className="space-y-4">
                <TacticalCard title="Documents" className="min-h-[200px]">
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-center gap-2 hover:text-defense-accent cursor-pointer">
                            <FileText size={14}/> DWG-1024-RevC.pdf
                        </li>
                        <li className="flex items-center gap-2 hover:text-defense-accent cursor-pointer">
                            <FileText size={14}/> SPEC-MIL-STD-810.pdf
                        </li>
                    </ul>
                </TacticalCard>
                
                <TacticalCard title="Stop Work / NCR">
                    <button className="w-full border border-rose-600 text-rose-500 hover:bg-rose-900/20 py-3 rounded uppercase font-bold text-sm flex items-center justify-center gap-2 transition">
                        <AlertCircle size={18} />
                        Raise Non-Conformance
                    </button>
                    <p className="text-xs text-slate-500 mt-2 text-center">
                        Initiating an NCR will freeze this workflow immediately.
                    </p>
                </TacticalCard>
            </div>
        </div>
    </div>
  );
};