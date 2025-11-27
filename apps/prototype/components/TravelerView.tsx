
import React, { useState } from 'react';
import { ProductionRun, TravelerStep, ComplianceMode } from '../types';
import { TacticalCard, StatusBadge } from './Shared';
import { Check, Circle, AlertTriangle, FileText, ArrowRight, ShieldCheck, ClipboardCheck } from 'lucide-react';
import { auditService } from '../services/auditService';
import { telemetryService } from '../services/telemetryService';

interface TravelerViewProps {
  traveler: ProductionRun;
  complianceMode: ComplianceMode;
}

export const TravelerView: React.FC<TravelerViewProps> = ({ traveler, complianceMode }) => {
  const [steps, setSteps] = useState<TravelerStep[]>(traveler.steps);
  const [activeCapa, setActiveCapa] = useState<string | null>(null);
  
  const toggleStep = (id: string) => {
    const span = telemetryService.startSpan('traveler_step_completion', { traveler_id: traveler.id, step_id: id });
    
    setSteps(prev => prev.map(step => {
        if (step.id === id && !step.completed) {
            // Log the action immediately when completing a step
            auditService.logAction(
                'J. Doe (U-001)', 
                'TRAVELER_STEP_COMPLETE', 
                `Verified step ${id} on traveler ${traveler.id}. Role: ${step.requiredRole}`
            );
            
            // Record business process velocity (Mock: simulate time spent on step)
            // In reality, this would be computed from a persisted 'start_time'
            const mockTimeSpent = Math.floor(Math.random() * 30) + 10; // 10-40 mins
            telemetryService.recordMetric('traveler_step_velocity_mins', mockTimeSpent, { role: step.requiredRole });

            return { 
                ...step, 
                completed: true, 
                completedBy: 'J. Doe',
                timestamp: new Date().toISOString()
            };
        }
        return step;
    }));

    telemetryService.endSpan(span);
  };

  const handleReportIssue = () => {
      // Simulate creating a CAPA
      const capaId = "CAPA-102";
      setActiveCapa(capaId);
      
      auditService.logAction(
        'J. Doe (U-001)', 
        'CAPA_INITIATED', 
        `Deviation logged for traveler ${traveler.id}. CAPA ID: ${capaId}`
      );

      alert(`Deviation logged (${capaId}). Workflow frozen for investigation.`);
  };

  // Calculate progress
  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="h-full flex flex-col bg-white">
        
        {/* Header / Progress */}
        <div className="px-4 py-6 md:px-8 md:py-8 border-b border-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 tracking-tight">{traveler.id}</h1>
                        <StatusBadge status={traveler.status} />
                    </div>
                    <p className="text-gray-500 font-medium text-sm md:text-base">{traveler.partNumber} &bull; Qty: {traveler.quantity}</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                     <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Trace ID</span>
                     <p className="font-mono text-sm text-gray-800 mt-1 mb-3 md:mb-0">8F-99-2A-11</p>
                     
                     <div className="md:mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* Steps Column */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {steps.map((step, index) => {
                        const isActive = !step.completed && (!steps[index - 1] || steps[index - 1].completed);
                        const isFuture = !step.completed && !isActive;
                        
                        return (
                            <div 
                                key={step.id} 
                                className={`
                                    relative p-4 md:p-6 rounded-3xl border transition-all duration-300
                                    ${isActive 
                                        ? 'bg-white border-black/10 shadow-soft ring-1 ring-black/5' 
                                        : step.completed ? 'bg-gray-50 border-transparent opacity-75' : 'bg-white border-gray-100 opacity-50'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 md:gap-5">
                                        <div className={`
                                            w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                                            ${step.completed ? 'bg-green-100 text-green-600' : isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}
                                        `}>
                                            {step.completed ? <Check size={18} strokeWidth={3} /> : step.order}
                                        </div>
                                        <div>
                                            <h3 className={`text-base md:text-lg font-bold tracking-tight ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                {step.instruction}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                                <span>Role: {step.requiredRole}</span>
                                                {step.completedBy && <span className="text-green-600">Signed: {step.completedBy}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Step Inputs */}
                                {isActive && (
                                    <div className="mt-6 md:pl-15 md:ml-[3.75rem]">
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
                                            className="mt-2 w-full md:w-auto px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-key transition-transform active:scale-95 flex items-center justify-center gap-2"
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
                    {/* Active CAPA Card (Conditional) */}
                    {activeCapa && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in slide-in-from-right-4">
                             <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="text-red-500" size={20} />
                                <h4 className="font-bold text-red-700">Active Deviation</h4>
                             </div>
                             <p className="text-sm text-gray-700 font-medium mb-3">Workflow halted for investigation {activeCapa}. QA approval required to proceed.</p>
                             <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-red-500"></div>
                             </div>
                             <p className="text-xs text-red-400 mt-2 font-bold uppercase tracking-wider">Status: Investigation</p>
                        </div>
                    )}

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

                    <button 
                        onClick={handleReportIssue}
                        className="w-full p-4 rounded-3xl bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center gap-3 group transition-all"
                    >
                        <AlertTriangle className="text-red-500" />
                        <span className="font-bold text-red-600">Report Issue / CAPA</span>
                    </button>
                </div>

            </div>
        </div>
    </div>
  );
};
