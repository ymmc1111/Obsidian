import React, { useState } from 'react';
import { ProductionRun, UserRole, TravelerStep } from '../types';
import { Check, AlertTriangle, Search, ArrowRight, ShieldCheck, Fingerprint, Box } from 'lucide-react';
import { TacticalCard } from './Shared';
import { auditService } from '../services/auditService';
import { telemetryService } from '../services/telemetryService';
import { db } from '../services/backend/db'; // Import mock DB to mutate state

interface ShopFloorViewProps {
    userRole: UserRole;
    traveler: ProductionRun;
}

export const ShopFloorView: React.FC<ShopFloorViewProps> = ({ userRole, traveler }) => {
    // Use local state for the traveler and step index to manage flow
    const [currentTraveler, setCurrentTraveler] = useState(traveler);
    const [activeStepIndex, setActiveStepIndex] = useState(currentTraveler.currentStepIndex);

    const currentStep = currentTraveler.steps.find(s => s.order === activeStepIndex + 1);
    const [isSigning, setIsSigning] = useState(false);

    // Check if current user role matches required role
    const isRoleAuthorized = currentStep && currentStep.requiredRole.toLowerCase().includes(userRole.split(' ')[0].toLowerCase());
    const isJobComplete = activeStepIndex >= currentTraveler.steps.length;

    const handleVerifySign = () => {
        if (!currentStep || isJobComplete) return;

        if (!isRoleAuthorized && userRole !== UserRole.ADMIN) {
            alert(`Security Alert: Role conflict. Required: ${currentStep.requiredRole}. Current: ${userRole}.`);
            return;
        }

        setIsSigning(true);
        const span = telemetryService.startSpan('shop_floor_step_completion', { role: userRole });

        // A. Step Sign-Off (Muting the alert here as we use UI changes instead)
        auditService.logAction(
            `${userRole} (Term-800)`,
            'TRAVELER_STEP_COMPLETE',
            `Step ${currentStep.id} verified from Shop Floor Terminal by ${userRole}.`
        );

        setTimeout(() => {
            setIsSigning(false);

            // 1. Mutate mock traveler data in DB (for persistence across views)
            const travelerInDb = db.tbl_traveler.find(t => t.id === currentTraveler.id);
            if (travelerInDb) {
                const nextStepIndex = activeStepIndex + 1;
                travelerInDb.currentStepId = `STEP-${nextStepIndex + 1}`; // Update DB's current step ID

                // Log completed step data (mocking the step data insertion)
                db.tbl_traveler_steps_data.push({
                    id: `STEP-DATA-${currentStep.id}-${Date.now()}`,
                    travelerId: travelerInDb.id,
                    stepId: currentStep.id,
                    timestamp: new Date().toISOString(),
                    completedBy_userId: userRole,
                    input_value: '{"visual_inspection":"PASS"}'
                });

                // Mark step as completed in local state
                currentStep.completed = true;
                currentStep.completedBy = userRole;
                currentStep.timestamp = new Date().toISOString();
            }

            // 2. Advance step in UI state
            const nextStepIndex = activeStepIndex + 1;
            if (nextStepIndex < currentTraveler.steps.length) {
                setActiveStepIndex(nextStepIndex);
            } else {
                // Update traveler status to COMPLETED in mock DB
                if (travelerInDb) travelerInDb.status = 'COMPLETED';
                alert("Job Complete. Traveler closed and final data logged.");
            }

            telemetryService.endSpan(span);
        }, 1500);
    };

    const handleReportDeviation = () => {
        // B. Report Deviation (CAPA)
        const capaId = `CAPA-SF-${Math.floor(Math.random() * 900) + 100}`;
        auditService.logAction(
            `${userRole} (Term-800)`,
            'CAPA_INITIATED',
            `Deviation reported from Shop Floor. ID: ${capaId} on step ${currentStep?.id}.`
        );
        alert(`CAPA Workflow Initiated (${capaId}). QA Protocol Active. Check Traceability View.`);
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
                        {isJobComplete ? <Check size={32} /> : (currentStep?.order || 'END')}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
                        {isJobComplete ? "JOB COMPLETE. READY FOR SHIPMENT." : (currentStep?.instruction || "Waiting for next step.")}
                    </h2>
                    {!isJobComplete && (
                        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
                            Verify all tolerances match Spec Sheet A-10 before proceeding.
                        </p>
                    )}
                    {currentStep && (
                        <p className="text-sm font-bold uppercase tracking-wide text-gray-600">
                            Required Role: <span className={isRoleAuthorized ? 'text-green-600' : 'text-red-500'}>{currentStep.requiredRole}</span>
                        </p>
                    )}
                </div>

                {/* Action Area - Role Based */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    {/* Primary Action (A. Step Sign-Off) */}
                    <button
                        onClick={handleVerifySign}
                        disabled={isSigning || isJobComplete || !isRoleAuthorized}
                        className={`
                        col-span-1 md:col-span-2
                        h-32 rounded-[2.5rem] text-white 
                        flex items-center justify-center gap-4 
                        shadow-2xl transition-all
                        ${isJobComplete || !isRoleAuthorized ? 'bg-gray-400 opacity-80 cursor-not-allowed' : 'bg-black hover:scale-[1.02] active:scale-95'}
                    `}
                    >
                        {isSigning ? (
                            <span className="text-2xl font-bold animate-pulse">Authenticating...</span>
                        ) : (
                            <>
                                <Check size={40} strokeWidth={3} />
                                <span className="text-3xl font-display font-bold tracking-tight">VERIFY & SIGN (A)</span>
                            </>
                        )}
                    </button>

                    {/* QA Action (B. Report Deviation) */}
                    {(userRole === UserRole.QUALITY_INSPECTOR || userRole === UserRole.PRODUCTION_OPERATOR) && !isJobComplete && (
                        <button
                            onClick={handleReportDeviation}
                            className="h-24 rounded-[2rem] bg-red-50 text-red-600 border-2 border-red-100 flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
                        >
                            <AlertTriangle size={28} />
                            <span className="text-xl font-bold uppercase tracking-wide">Report Deviation (B)</span>
                        </button>
                    )}

                    {/* Trace Action (C. View Traceability Log - Mocked as a button to prompt user to move to Trace View) */}
                    {(userRole === UserRole.LOGISTICS_SPECIALIST || userRole === UserRole.QUALITY_INSPECTOR) && (
                        <button
                            onClick={() => alert("Navigate to the Traceability View for full Genealogy Tree (C).")}
                            className={`h-24 rounded-[2rem] bg-blue-50 text-blue-600 border-2 border-blue-100 flex items-center justify-center gap-3 hover:bg-blue-100 transition-colors 
                           ${userRole === UserRole.LOGISTICS_SPECIALIST && (userRole !== UserRole.QUALITY_INSPECTOR && userRole !== UserRole.PRODUCTION_OPERATOR) ? 'col-span-1 md:col-span-2' : ''}
                        `}
                        >
                            <Search size={28} />
                            <span className="text-xl font-bold uppercase tracking-wide">Trace Batch Genealogy (C)</span>
                        </button>
                    )}

                    {/* Info Card (Generic fallback for non-QA/Logistics users) */}
                    {!(userRole === UserRole.QUALITY_INSPECTOR || userRole === UserRole.PRODUCTION_OPERATOR || userRole === UserRole.LOGISTICS_SPECIALIST) && (
                        <div className="h-24 rounded-[2rem] bg-gray-50 border-2 border-gray-100 flex items-center justify-center gap-3 text-gray-400 col-span-1 md:col-span-2">
                            <ShieldCheck size={24} />
                            <span className="font-medium">Secure Session Active</span>
                        </div>
                    )}
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
