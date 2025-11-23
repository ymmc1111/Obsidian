import React, { useState } from 'react';
import { ProductionRun, UserRole, TravelerStep } from '../types';
import { Check, AlertTriangle, Search, ArrowRight, ShieldCheck, Fingerprint, Box } from 'lucide-react';
import { TacticalCard } from './Shared';

interface ShopFloorViewProps {
  userRole: UserRole;
  traveler: ProductionRun;
}

export const ShopFloorView: React.FC<ShopFloorViewProps> = ({ userRole, traveler }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(traveler.currentStepIndex);
  const currentStep = traveler.steps.find(s => s.order === activeStepIndex + 1) || traveler.steps[0];
  const [isSigning, setIsSigning] = useState(false);

  const handleVerifySign = () => {
    setIsSigning(true);
    setTimeout(() => {
        setIsSigning(false);
        // Advance step mock
        if (activeStepIndex < traveler.steps.length - 1) {
            setActiveStepIndex(prev => prev + 1);
        } else {
            alert("Job Complete. Traveler closed.");
        }
    }, 1500);
  };

  const handleReportDeviation = () => {
      alert("CAPA Workflow Initiated. QA Protocol Active.");
  };

  return (
    <div className="h-full flex flex-col bg-white p-4 md:p-8">
        
        {/* Header - Minimalist */}
        <div className="flex justify-between items-center mb-12">
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Job</p>
                <h1 className="text-4xl font-display font-bold text-gray-900">{traveler.partNumber}</h1>
            </div>
            <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Fingerprint size={16} className="text-gray-500" />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{userRole}</span>
                </div>
            </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-12">
            
            {/* Step Display */}
            <div className="w-full text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-2xl text-2xl font-bold shadow-xl mb-4">
                    {currentStep.order}
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
                    {currentStep.instruction}
                </h2>
                <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                    Verify all tolerances match Spec Sheet A-10 before proceeding.
                </p>
            </div>

            {/* Action Area - Role Based */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                
                {/* Primary Action (Always visible for execution) */}
                <button 
                    onClick={handleVerifySign}
                    disabled={isSigning}
                    className={`
                        col-span-1 md:col-span-2
                        h-32 rounded-[2.5rem] bg-black text-white 
                        flex items-center justify-center gap-4 
                        shadow-2xl hover:scale-[1.02] active:scale-95 transition-all
                        disabled:opacity-80 disabled:scale-100
                    `}
                >
                    {isSigning ? (
                        <span className="text-2xl font-bold animate-pulse">Authenticating...</span>
                    ) : (
                        <>
                            <Check size={40} strokeWidth={3} />
                            <span className="text-3xl font-display font-bold tracking-tight">VERIFY & SIGN</span>
                        </>
                    )}
                </button>

                {/* QA Action (Only for Inspectors) */}
                {userRole === UserRole.QUALITY_INSPECTOR && (
                    <button 
                        onClick={handleReportDeviation}
                        className="h-24 rounded-[2rem] bg-red-50 text-red-600 border-2 border-red-100 flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
                    >
                        <AlertTriangle size={28} />
                        <span className="text-xl font-bold uppercase tracking-wide">Report Deviation (CAPA)</span>
                    </button>
                )}

                {/* Logistics Action (Only for Logistics) */}
                {userRole === UserRole.LOGISTICS_SPECIALIST && (
                    <button 
                        className="h-24 rounded-[2rem] bg-blue-50 text-blue-600 border-2 border-blue-100 flex items-center justify-center gap-3 hover:bg-blue-100 transition-colors"
                    >
                        <Search size={28} />
                        <span className="text-xl font-bold uppercase tracking-wide">Trace Batch Genealogy</span>
                    </button>
                )}
                
                {/* Info Card (Generic) */}
                <div className={`
                    h-24 rounded-[2rem] bg-gray-50 border-2 border-gray-100 flex items-center justify-center gap-3 text-gray-400
                    ${(userRole !== UserRole.QUALITY_INSPECTOR && userRole !== UserRole.LOGISTICS_SPECIALIST) ? 'col-span-1 md:col-span-2' : ''}
                `}>
                    <ShieldCheck size={24} />
                    <span className="font-medium">Secure Session Active</span>
                </div>

            </div>

        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm font-medium">
            <span>Terminal ID: T-800</span>
            <span>Uptime: 4d 12h</span>
        </div>

    </div>
  );
};