import React, { useState } from 'react';
import { TacticalCard, StatusBadge, Toast } from './Shared.tsx';
import { Search, Package, Factory, CheckCircle2, Truck, AlertTriangle, Target, ArrowRight, History, X, AlertOctagon, Download, Filter } from 'lucide-react';
import { INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_ORDERS } from '../services/mockData.ts';
import { auditService } from '../services/auditService.ts';
import { BackendAPI } from '../services/backend/api.ts';
import { UserRole, AuditLogEntry } from '../types.ts';

interface TraceViewProps {
    currentUserRole: UserRole; // Prop for RBAC
}

export const TraceView: React.FC<TraceViewProps> = ({ currentUserRole }) => {
    const [searchTerm, setSearchTerm] = useState('SN-2024-9901');
    const [searchType, setSearchType] = useState<'serial' | 'batch'>('serial');
    const [traceResult, setTraceResult] = useState<any | null>(null);
    const [isRecalling, setIsRecalling] = useState(false);
    const [showRecallModal, setShowRecallModal] = useState(false);
    const [recallHistory, setRecallHistory] = useState<AuditLogEntry[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // Subscribe to Audit Logs for Recall History
    React.useEffect(() => {
        const unsubscribe = auditService.subscribe((logs) => {
            const recalls = logs.filter(log => log.action === 'RECALL_INITIATED');
            setRecallHistory(recalls);
        });
        return () => unsubscribe();
    }, []);

    // Authorization check for Recall (Traceability: B)
    const isRecallAuthorized = currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.QUALITY_INSPECTOR;

    const handleTrace = () => {
        if (!searchTerm.trim()) {
            showToast("Please enter a search term", 'error');
            return;
        }

        // Mock trace logic based on search type
        if (searchType === 'serial') {
            // Search by Serial Number
            const item = INITIAL_INVENTORY.find(inv =>
                inv.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (item) {
                setTraceResult({
                    type: 'serial',
                    serialNumber: item.serialNumber,
                    partNumber: item.partNumber,
                    batchLot: item.batchLot,
                    status: item.status,
                    found: true
                });
                showToast(`Serial Number ${item.serialNumber} found`, 'success');
            } else {
                setTraceResult({ found: false, type: 'serial' });
                showToast("Serial Number not found", 'error');
            }
        } else {
            // Search by Batch Lot
            const items = INITIAL_INVENTORY.filter(inv =>
                inv.batchLot?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (items.length > 0) {
                setTraceResult({
                    type: 'batch',
                    batchLot: items[0].batchLot,
                    items: items,
                    count: items.length,
                    found: true
                });
                showToast(`Batch Lot ${items[0].batchLot}: ${items.length} items found`, 'success');
            } else {
                setTraceResult({ found: false, type: 'batch' });
                showToast("Batch Lot not found", 'error');
            }
        }
    };

    const handleExportReport = () => {
        if (!traceResult || !traceResult.found) {
            showToast("No trace data to export", 'error');
            return;
        }

        // Generate report content
        let reportContent = `TRACEABILITY REPORT\n`;
        reportContent += `Generated: ${new Date().toLocaleString()}\n`;
        reportContent += `Search Type: ${searchType === 'serial' ? 'Serial Number' : 'Batch Lot'}\n`;
        reportContent += `Search Term: ${searchTerm}\n\n`;
        reportContent += `===========================================\n\n`;

        if (searchType === 'serial') {
            reportContent += `SERIAL NUMBER TRACE\n\n`;
            reportContent += `Serial Number: ${traceResult.serialNumber}\n`;
            reportContent += `Part Number: ${traceResult.partNumber}\n`;
            reportContent += `Batch Lot: ${traceResult.batchLot}\n`;
            reportContent += `Status: ${traceResult.status}\n\n`;
            reportContent += `GENEALOGY CHAIN:\n`;
            reportContent += `1. Raw Material: Titanium Alloy 6Al-4V (LOT-99812A)\n`;
            reportContent += `2. Production Run: RUN-2024-A (Operator: M. Smith)\n`;
            reportContent += `3. Finished Good: ${traceResult.partNumber} (${traceResult.serialNumber})\n`;
            reportContent += `4. Fulfillment: SO-8821 (Customer: SpaceX)\n`;
        } else {
            reportContent += `BATCH LOT TRACE\n\n`;
            reportContent += `Batch Lot: ${traceResult.batchLot}\n`;
            reportContent += `Total Items: ${traceResult.count}\n\n`;
            reportContent += `AFFECTED ITEMS:\n`;
            traceResult.items.forEach((item: any, idx: number) => {
                reportContent += `${idx + 1}. ${item.partNumber} - S/N: ${item.serialNumber} - Status: ${item.status}\n`;
            });
        }

        reportContent += `\n===========================================\n`;
        reportContent += `This is an official traceability document.\n`;
        reportContent += `Hash: 0x${Math.random().toString(16).substring(2, 18)}\n`;

        // Create blob and download
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Trace_Report_${searchTerm}_${Date.now()}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Trace report exported successfully", 'success');
    };

    const handleRecallClick = () => {
        if (!isRecallAuthorized) {
            showToast("Authorization Denied: Only Admin or Quality Inspector can initiate a Recall.", 'error');
            return;
        }
        setShowRecallModal(true);
    };

    const confirmRecall = async () => {
        setIsRecalling(true);
        setShowRecallModal(false);

        try {
            // In a real app, we'd derive the batch from the trace result. 
            const targetBatch = 'LOT-99812A';

            const result = await BackendAPI.initiateRecall(targetBatch);

            // Log the recall action with actual user role
            auditService.logAction(
                `${currentUserRole} (Term-800)`, // Uses the correct role prop
                'RECALL_INITIATED',
                `Batch ${result.batchLot} (${result.affectedCount} Units) set to QUARANTINE status. Action ID: ${result.actionId}`
            );

            showToast(`Recall Initiated: ${result.affectedCount} units flagged.`, 'success');
        } catch (e) {
            console.error("Recall failed", e);
            showToast("Recall failed. Please try again.", 'error');
        } finally {
            setIsRecalling(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-6 overflow-y-auto">

            {/* Search Bar */}
            <div className="w-full max-w-2xl mx-auto space-y-4">
                {/* Search Type Selector */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => {
                            setSearchType('serial');
                            setSearchTerm('SN-2024-9901');
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${searchType === 'serial'
                                ? 'bg-black text-white shadow-key'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Filter size={14} className="inline mr-2" />
                        Serial Number
                    </button>
                    <button
                        onClick={() => {
                            setSearchType('batch');
                            setSearchTerm('LOT-99812A');
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${searchType === 'batch'
                                ? 'bg-black text-white shadow-key'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Filter size={14} className="inline mr-2" />
                        Batch Lot
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative group">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTrace()}
                        placeholder={searchType === 'serial' ? 'Enter Serial Number...' : 'Enter Batch Lot...'}
                        className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-200 rounded-2xl py-3.5 pl-12 pr-32 text-sm font-medium text-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
                    />
                    <button
                        onClick={handleTrace}
                        className="absolute right-2 top-2 px-4 py-1.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors shadow-key"
                    >
                        Trace Asset
                    </button>
                </div>
            </div>

            {/* Trace Visualization Area */}
            {traceResult && traceResult.found && (
                <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-display font-bold text-gray-900">Asset Genealogy Tree</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {searchType === 'serial' ? (
                                    <>Full lifecycle traceability for <span className="font-mono font-bold text-gray-800">{traceResult.serialNumber}</span></>
                                ) : (
                                    <>Batch traceability for <span className="font-mono font-bold text-gray-800">{traceResult.batchLot}</span> ({traceResult.count} items)</>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportReport}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <Download size={16} />
                                Export Report
                            </button>
                            <button
                                onClick={handleRecallClick}
                                disabled={isRecalling || !isRecallAuthorized}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors
                                    ${isRecallAuthorized
                                        ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                                title={!isRecallAuthorized ? 'Requires Admin or Quality Inspector role' : 'Initiate product recall'}
                            >
                                {isRecalling ? 'Processing...' : (
                                    <>
                                        <AlertTriangle size={16} />
                                        Initiate Recall
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Genealogy Flow */}
                    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">

                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gray-100 -z-10 translate-y-8"></div>

                        {/* Node 1: Origin */}
                        <div className="flex flex-col gap-4 group">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-soft flex items-center justify-center text-blue-600 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300">
                                <Package size={28} strokeWidth={1.5} />
                                <div className="absolute -bottom-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full border border-blue-100">Origin</div>
                            </div>
                            <TacticalCard className="flex-1 text-center items-center">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">Raw Material</h4>
                                <p className="text-xs text-gray-500 mb-3">Titanium Alloy 6Al-4V</p>

                                <div className="w-full space-y-2 bg-gray-50 p-3 rounded-xl text-left">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Batch Lot</span>
                                        <span className="font-mono font-bold text-gray-800">LOT-99812A</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Vendor</span>
                                        <span className="font-bold text-gray-800">Titanium Dyn.</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">CAGE</span>
                                        <span className="font-mono text-gray-600">1A2B3</span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                                        <span className="text-gray-400">Cert</span>
                                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Valid</span>
                                    </div>
                                </div>
                            </TacticalCard>
                        </div>

                        {/* Node 2: Process */}
                        <div className="flex flex-col gap-4 group">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-soft flex items-center justify-center text-orange-600 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300">
                                <Factory size={28} strokeWidth={1.5} />
                                <div className="absolute -bottom-2 px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded-full border border-orange-100">Process</div>
                            </div>
                            <TacticalCard className="flex-1 text-center items-center">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">Production Run</h4>
                                <p className="text-xs text-gray-500 mb-3">CNC Machining & NDT</p>

                                <div className="w-full space-y-2 bg-gray-50 p-3 rounded-xl text-left">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Run ID</span>
                                        <span className="font-mono font-bold text-gray-800">RUN-2024-A</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Operator</span>
                                        <span className="font-bold text-gray-800">M. Smith</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Steps</span>
                                        <span className="font-mono text-gray-600">3/3 Complete</span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                                        <span className="text-gray-400">Quality</span>
                                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Passed</span>
                                    </div>
                                </div>
                            </TacticalCard>
                        </div>

                        {/* Node 3: Product */}
                        <div className="flex flex-col gap-4 group">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-soft flex items-center justify-center text-purple-600 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300">
                                <Target size={28} strokeWidth={1.5} />
                                <div className="absolute -bottom-2 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded-full border border-purple-100">Product</div>
                            </div>
                            <TacticalCard className="flex-1 text-center items-center">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">Finished Good</h4>
                                <p className="text-xs text-gray-500 mb-3">Thruster Nozzle Assembly</p>

                                <div className="w-full space-y-2 bg-gray-50 p-3 rounded-xl text-left">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Part No.</span>
                                        <span className="font-mono font-bold text-gray-800">XB-70-TI</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Serial</span>
                                        <span className="font-mono font-bold text-gray-800">{searchTerm}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">DOM</span>
                                        <span className="font-mono text-gray-600">2024-10-15</span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                                        <span className="text-gray-400">Status</span>
                                        <StatusBadge status="AVAILABLE" />
                                    </div>
                                </div>
                            </TacticalCard>
                        </div>

                        {/* Node 4: Distribution */}
                        <div className="flex flex-col gap-4 group">
                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-soft flex items-center justify-center text-green-600 mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300">
                                <Truck size={28} strokeWidth={1.5} />
                                <div className="absolute -bottom-2 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-100">Dest</div>
                            </div>
                            <TacticalCard className="flex-1 text-center items-center">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">Fulfillment</h4>
                                <p className="text-xs text-gray-500 mb-3">Shipped to Customer</p>

                                <div className="w-full space-y-2 bg-gray-50 p-3 rounded-xl text-left">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Order</span>
                                        <span className="font-mono font-bold text-gray-800">SO-8821</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Customer</span>
                                        <span className="font-bold text-gray-800">SpaceX</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">CoC ID</span>
                                        <span className="font-mono text-gray-600">COC-9921</span>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                                        <span className="text-gray-400">Tracking</span>
                                        <span className="text-blue-600 font-bold text-[10px] cursor-pointer hover:underline flex items-center gap-1">UPS-1Z99... <ArrowRight size={8} /></span>
                                    </div>
                                </div>
                            </TacticalCard>
                        </div>

                    </div>

                </div>
            )}

            {/* Recall History */}
            {recallHistory.length > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h3 className="text-lg font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <History size={20} className="text-gray-400" />
                        Recall History
                    </h3>
                    <div className="space-y-3">
                        {recallHistory.map((log, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                                <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                                    <AlertOctagon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{log.action}</p>
                                    <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">{log.timestamp} • {log.actor}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recall Confirmation Modal */}
            {showRecallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-red-100">
                        <div className="flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-2xl mb-6 mx-auto">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-center text-gray-900 mb-2">Confirm Recall?</h3>
                        <p className="text-center text-gray-500 mb-8">
                            You are about to initiate a <span className="font-bold text-gray-900">Global Recall</span> for Batch <span className="font-mono bg-gray-100 px-1 rounded">LOT-99812A</span>.
                            <br /><br />
                            This will immediately flag <span className="font-bold text-red-600">450 Units</span> as QUARANTINED and notify all logistics partners.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRecallModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRecall}
                                className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                            >
                                Confirm Recall
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};