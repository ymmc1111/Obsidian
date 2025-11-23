
import React, { useState } from 'react';
import { ProductionRun, TravelerStep, ComplianceMode } from '../types';
import { TacticalCard, StatusBadge } from './Shared';
import { Check, Circle, AlertTriangle, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface TravelerViewProps {
  traveler: ProductionRun;
  complianceMode: ComplianceMode;
}

export const TravelerView: React.FC<TravelerViewProps> = ({ traveler, complianceMode }) => {
  const [steps, setSteps] = useState<TravelerStep[]>(traveler.steps);
  
  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(step => {
        if (step.id === id) {
            return { 
                ...step, 
                completed: !step.completed, 
                completedBy: !step.completed ? 'J. Doe' : undefined,
                timestamp: !step.completed ? new Date().toISOString() : undefined
            };
        }
        return step;
    }));
  };

  // Calculate progress
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="h-full flex flex-col bg-white">
        
        {/* Header / Progress */}
        <div className="px-8 py-8 border-b border-gray-50">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">{traveler.id}</h1>
                        <StatusBadge status={traveler.status} />
                    </div>
                    <p className="text-gray-500 font-medium">{traveler.partNumber} &bull; Qty: {traveler.quantity}</p>
                </div>
                <div className="text-right">
                     <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Trace ID</span>
                     <p className="font-mono text-sm text-gray-800 mt-1">8F-99-2A-11</p>
                     
                     <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                        <ShieldCheck size={12} />
                        Enforcing: {complianceMode}
                     </div>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-black transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Steps Column */}
                <div className="lg:col-span-2 space-y-6">
                    {steps.map((step, index) => {
                        const isActive = !step.completed && (!steps[index - 1] || steps[index - 1].completed);
                        const isFuture = !step.completed && !isActive;
                        
                        return (
                            <div 
                                key={step.id} 
                                className={`
                                    relative p-6 rounded-3xl border transition-all duration-300
                                    ${isActive 
                                        ? 'bg-white border-black/10 shadow-soft ring-1 ring-black/5' 
                                        : step.completed ? 'bg-gray-50 border-transparent opacity-75' : 'bg-white border-gray-100 opacity-50'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-5">
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                                            ${step.completed ? 'bg-green-100 text-green-600' : isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}
                                        `}>
                                            {step.completed ? <Check size={20} strokeWidth={3} /> : step.order}
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold tracking-tight ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                {step.instruction}
                                            </h3>
                                            <div className="flex gap-4 mt-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                <span>Role: {step.requiredRole}</span>
                                                {step.completedBy && <span className="text-green-600">Signed: {step.completedBy}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Step Inputs */}
                                {isActive && (
                                    <div className="mt-6 pl-15 ml-[3.75rem]">
                                        {step.inputs?.map((input, idx) => (
                                            <div key={idx} className="mb-4">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{input.label}</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                                    placeholder="Enter data..."
                                                />
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => toggleStep(step.id)}
                                            className="mt-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-key transition-transform active:scale-95 flex items-center gap-2"
                                        >
                                            <span>Verify & Sign</span>
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel */}
                <div className="space-y-6">
                    <TacticalCard title="Attached Docs">
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Blueprint A-10</p>
                                    <p className="text-xs text-gray-400">PDF &bull; 2.4MB</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">Spec Sheet</p>
                                    <p className="text-xs text-gray-400">PDF &bull; 800KB</p>
                                </div>
                            </li>
                        </ul>
                    </TacticalCard>

                    <button className="w-full p-4 rounded-3xl bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center gap-3 group transition-all">
                        <AlertTriangle className="text-red-500" />
                        <span className="font-bold text-red-600">Report Issue</span>
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};
