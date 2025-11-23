import React, { useState } from 'react';
import { ProductionRun, UserRole, TravelerStep } from '../types';
import { Check, AlertTriangle, Search, ArrowRight, ShieldCheck, Fingerprint, Box, Pause, Play, Paperclip, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TacticalCard, Toast } from './Shared';
import { auditService } from '../services/auditService';
import { telemetryService } from '../services/telemetryService';
import { db } from '../services/backend/db'; // Import mock DB to mutate state
import { TravelerHistoryModal } from './TravelerHistoryModal';
import { BackendAPI } from '../services/backend/api';

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
    const [attachments, setAttachments] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Historical Traveler State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedHistoricalTraveler, setSelectedHistoricalTraveler] = useState<ProductionRun | null>(null);
    const [historicalAuditData, setHistoricalAuditData] = useState<Array<{
        stepId: string;
        completedBy: string;
        timestamp: string;
        inputData: any;
    }>>([]);

    // Sidebar visibility state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

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
            `Step ${currentStep.id} verified from Shop Floor Terminal by ${userRole}. Attachments: ${attachments.length}`
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
                currentStep.attachments = [...attachments]; // Save attachments
            }

            // 2. Advance step in UI state
            const nextStepIndex = activeStepIndex + 1;
            if (nextStepIndex < currentTraveler.steps.length) {
                setActiveStepIndex(nextStepIndex);
                showToast("Step verified successfully.", 'success');
            } else {
                // Update traveler status to COMPLETED in mock DB
                if (travelerInDb) travelerInDb.status = 'COMPLETED';
                showToast("Job Complete. Traveler closed and final data logged.", 'success');
            }

            // Reset attachments for next step
            setAttachments([]);

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
        showToast(`CAPA Workflow Initiated (${capaId}). QA Protocol Active.`, 'error');
    };

    const handlePauseResume = () => {
        const newStatus = currentTraveler.status === 'HALTED' ? 'IN_PROGRESS' : 'HALTED';
        setCurrentTraveler({ ...currentTraveler, status: newStatus });

        // Log action
        auditService.logAction(
            `${userRole} (Term-800)`,
            newStatus === 'HALTED' ? 'PRODUCTION_PAUSED' : 'PRODUCTION_RESUMED',
            `Production run ${currentTraveler.id} ${newStatus === 'HALTED' ? 'paused' : 'resumed'} by ${userRole}.`
        );

        showToast(`Production ${newStatus === 'HALTED' ? 'Paused' : 'Resumed'}`, 'success');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Mock upload - just storing name
            setAttachments([...attachments, file.name]);
            showToast(`Attached: ${file.name}`, 'success');
        }
    };

    const removeAttachment = (index: number) => {
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        setAttachments(newAttachments);
    };

    const handleViewHistory = async (travelerId: string) => {
        try {
            showToast("Loading historical record...", 'success');
            const { traveler, auditHistory } = await BackendAPI.getTravelerAuditHistory(travelerId);
            setSelectedHistoricalTraveler(traveler);
            setHistoricalAuditData(auditHistory);
            setShowHistoryModal(true);
        } catch (error) {
            console.error("Failed to load traveler history:", error);
            showToast("Failed to load historical record.", 'error');
        }
    };

    // Get completed travelers from DB for the sidebar
    const completedTravelers = db.tbl_traveler.filter(t => t.status === 'COMPLETED');

    return (
        <div className="h-full flex relative">
            {/* Jobs Sidebar - Collapsible */}
            <div className={`bg-gray-50 border-r border-gray-100 p-4 overflow-y-auto shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 p-0'}`}>
                {isSidebarOpen && (
                    <>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Jobs
                        </h3>
                        <div className="space-y-2">
                            {completedTravelers.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center py-8">
                                    No completed jobs yet
                                </p>
                            ) : (
                                completedTravelers.map((traveler) => (
                                    <button
                                        key={traveler.id}
                                        onClick={() => handleViewHistory(traveler.id)}
                                        className="w-full p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {traveler.partNumber}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {traveler.id}
                                                </p>
                                            </div>
                                            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                                                <Check size={14} />
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                {traveler.quantity} units • Click to view history
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Sidebar Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-gray-200 rounded-r-xl shadow-md hover:bg-gray-50 transition-all"
                style={{ left: isSidebarOpen ? '20rem' : '0' }}
                title={isSidebarOpen ? 'Hide Jobs' : 'Show Jobs'}
            >
                {isSidebarOpen ? <ChevronLeft size={20} className="text-gray-600" /> : <ChevronRight size={20} className="text-gray-600" />}
            </button>

            {/* Main Shop Floor Area */}
            <div className="flex-1 flex flex-col bg-white p-4 md:p-8">

                {/* Header - Minimalist */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Job</p>
                        <h1 className="text-4xl font-display font-bold text-gray-900">{traveler.partNumber}</h1>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        <button
                            onClick={handlePauseResume}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${currentTraveler.status === 'HALTED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                            {currentTraveler.status === 'HALTED' ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                            {currentTraveler.status === 'HALTED' ? 'RESUME JOB' : 'PAUSE JOB'}
                        </button>
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
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm font-bold uppercase tracking-wide text-gray-600">
                                    Required Role: <span className={isRoleAuthorized ? 'text-green-600' : 'text-red-500'}>{currentStep.requiredRole}</span>
                                </p>

                                {/* Attachment Area */}
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                            <Paperclip size={12} />
                                            {file}
                                            <button onClick={() => removeAttachment(idx)} className="hover:text-red-500"><X size={12} /></button>
                                        </div>
                                    ))}
                                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                                        <Paperclip size={12} />
                                        Attach Evidence
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Area - Role Based */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                        {/* Primary Action (A. Step Sign-Off) */}
                        <button
                            onClick={handleVerifySign}
                            disabled={isSigning || isJobComplete || !isRoleAuthorized || currentTraveler.status === 'HALTED'}
                            className={`
                        col-span-1 md:col-span-2
                        h-32 rounded-[2.5rem] text-white 
                        flex items-center justify-center gap-4 
                        shadow-2xl transition-all
                        ${isJobComplete || !isRoleAuthorized || currentTraveler.status === 'HALTED' ? 'bg-gray-400 opacity-80 cursor-not-allowed' : 'bg-black hover:scale-[1.02] active:scale-95'}
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

                {/* Toast Notification */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                {/* Historical Traveler Modal */}
                {showHistoryModal && selectedHistoricalTraveler && (
                    <TravelerHistoryModal
                        traveler={selectedHistoricalTraveler}
                        auditHistory={historicalAuditData}
                        onClose={() => {
                            setShowHistoryModal(false);
                            setSelectedHistoricalTraveler(null);
                            setHistoricalAuditData([]);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
