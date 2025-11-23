import React, { useState } from 'react';
import { TacticalCard, StatusBadge } from './Shared';
import { Search, Package, Factory, CheckCircle2, Truck, AlertTriangle, Target, ArrowRight } from 'lucide-react';
import { INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_ORDERS } from '../services/mockData';
import { auditService } from '../services/auditService';

export const TraceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('SN-2024-9901');
  const [traceResult, setTraceResult] = useState<boolean>(true);
  const [isRecalling, setIsRecalling] = useState(false);

  const handleTrace = () => {
    // Mock trace logic - always finds the "demo" item
    setTraceResult(true);
  };

  const handleRecall = () => {
    setIsRecalling(true);
    
    // Log the recall action
    auditService.logAction(
        'J. Doe (U-001)', 
        'RECALL_INITIATED', 
        'Batch LOT-99812A (450 Units) set to QUARANTINE status.'
    );

    setTimeout(() => {
        setIsRecalling(false);
        alert("Recall Initiated: 450 units of lot LOT-99812A have been flagged and placed on quarantine status across all warehouses.");
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-6 overflow-y-auto">
      
      {/* Search Bar */}
      <div className="w-full max-w-2xl mx-auto relative">
         <div className="relative group">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Serial Number, Batch Lot, or CoC ID..."
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
      {traceResult && (
        <div className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-gray-900">Asset Genealogy Tree</h2>
                    <p className="text-sm text-gray-500 mt-1">Full lifecycle traceability for <span className="font-mono font-bold text-gray-800">{searchTerm}</span></p>
                </div>
                <button 
                    onClick={handleRecall}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors shadow-sm"
                >
                    {isRecalling ? 'Processing...' : (
                        <>
                            <AlertTriangle size={16} />
                            Initiate Precision Recall
                        </>
                    )}
                </button>
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
    </div>
  );
};