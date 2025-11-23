import React, { useState, useEffect } from 'react';
import { InventoryItem, ItemStatus, SensitivityLevel } from '../types.ts';
import { StatusBadge, TacticalCard } from './Shared.tsx';
import { Search, SlidersHorizontal, Sparkles, Plus, Edit3, X, MapPin, Zap } from 'lucide-react';
import { askTacticalAssistant } from '../services/geminiService.ts';
import { telemetryService } from '../services/telemetryService.ts';
import { BackendAPI } from '../services/backend/api.ts';


// --- Inventory Item Form Component ---
interface InventoryFormProps {
    onClose: () => void;
    itemToEdit: InventoryItem | null;
    onRefresh: () => void; // New prop for refreshing parent state
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onClose, itemToEdit, onRefresh }) => {
    const isEdit = !!itemToEdit;
    const [partNumber, setPartNumber] = useState(itemToEdit?.partNumber || '');
    const [nomenclature, setNomenclature] = useState(itemToEdit?.nomenclature || '');
    const [serialNumber, setSerialNumber] = useState(itemToEdit?.serialNumber || '');
    const [location, setLocation] = useState(itemToEdit?.location || 'WH-A-01-01');
    const [quantity, setQuantity] = useState(itemToEdit?.quantity.toString() || '1');
    const [status, setStatus] = useState(itemToEdit?.status || ItemStatus.AVAILABLE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const locations = ['WH-A-01-01', 'WH-B-RACK-2', 'SECURE-LOCKER-B', 'WH-C-RACK-02', 'QUARANTINE-BAY'];
    const statusOptions = Object.values(ItemStatus);

    const handleSubmit = async () => {
        if (!partNumber || !nomenclature || !location || !quantity) {
            setError("Part Number, Nomenclature, Location, and Quantity are required.");
            return;
        }

        setLoading(true);
        setError(null);

        const itemData = {
            partNumber,
            nomenclature,
            serialNumber,
            location,
            quantity: parseInt(quantity, 10),
            status: status as ItemStatus,
            unitCost: itemToEdit?.unitCost || 0.0,
            batchLot: itemToEdit?.batchLot || 'LOT-NEW-' + Date.now(),
            cageCode: itemToEdit?.cageCode || 'N/A',
            sensitivity: itemToEdit?.sensitivity || SensitivityLevel.UNCLASSIFIED
        };

        try {
            if (isEdit) {
                // D. Change Location / Update Status
                await BackendAPI.updateInventoryItem(itemToEdit.id, itemData);
            } else {
                // C. Add New Asset
                await BackendAPI.addInventoryItem(itemData);
            }
            // Trigger refresh in parent (App.tsx)
            onRefresh();
            onClose();
        } catch (e) {
            console.error("Inventory action failed", e);
            setError("Failed to save inventory item. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-gray-100 max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-display font-bold text-gray-900">{isEdit ? `Edit Item: ${itemToEdit?.partNumber}` : 'Add New Inventory Item'}</h3>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Part Number */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Part Number</label>
                        <input type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} />
                    </div>
                    {/* Nomenclature */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nomenclature</label>
                        <input type="text" value={nomenclature} onChange={(e) => setNomenclature(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} />
                    </div>
                    {/* Serial Number */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Serial Number</label>
                        <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} />
                    </div>
                    {/* Location and Quantity - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location (D. Change Location)</label>
                            <select value={location} onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} >
                                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantity</label>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" min="1" disabled={loading} />
                        </div>
                    </div>
                    {/* Status (Only in Edit mode) */}
                    {isEdit && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status (D. Update Status)</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value as ItemStatus)}
                                className="w-full bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none" disabled={loading} >
                                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Zap size={20} className="animate-spin" /> : (isEdit ? 'Save Changes' : 'Add Item to Inventory')}
                </button>
            </div>
        </div>
    );
};
// --- End Inventory Item Form Component ---


interface InventoryViewProps {
    items: InventoryItem[];
    onRefresh: () => void; // New prop for refreshing data
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [displayedItems, setDisplayedItems] = useState<InventoryItem[]>(items);
    const [isSearching, setIsSearching] = useState(false);

    // New CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

    // Sync props to state if items change (e.g. initial load OR refresh)
    useEffect(() => {
        // Only reset displayed items if there's no active search term
        if (!searchTerm) {
            setDisplayedItems(items);
        }
    }, [items, searchTerm]);
    // The 'items' dependency ensures that when the parent re-fetches data (via onRefresh), 
    // the displayed list is updated, provided no search is active.

    // Combine modal control functions
    const handleOpenEdit = (item: InventoryItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setItemToEdit(null);
        // Removed hacky refresh logic. The flow is now cleaner:
        // InventoryForm -> onRefresh prop called -> App.tsx updates 'items' state -> useEffect above triggers a list update.
    };


    // Server-side Search & Monitoring (A. Server-Side Search)
    useEffect(() => {
        const performSearch = async () => {
            setIsSearching(true);
            const queryName = searchTerm ? `SELECT * FROM inventory WHERE filter LIKE '${searchTerm}%'` : 'SELECT * FROM inventory LIMIT 50';

            try {
                // Call Backend API (Simulating Network Request)
                const { results, latency_ms } = await BackendAPI.searchInventory(searchTerm);

                setDisplayedItems(results);

                // Record Telemetry
                telemetryService.recordDBQuery(queryName, latency_ms);

            } catch (error) {
                console.error("Inventory search failed:", error);
                // On search fail, revert to current main items list
                setDisplayedItems(items);
            } finally {
                setIsSearching(false);
            }
        };

        // Skip search if items are empty (initial loading state usually)
        if (!items.length && !searchTerm) {
            setDisplayedItems([]);
            setIsSearching(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, items]); // Added items dependency to ensure search reruns if list changes while searching

    const handleAIAnalyze = async () => {
        // B. AI Audit Simulation
        setIsAnalyzing(true);
        setAiAnalysis(null);

        // Start distributed trace span
        const span = telemetryService.startSpan('ai_decision_support', { context: 'inventory_audit' });

        try {
            // Use displayed items as context for relevance
            const context = JSON.stringify(displayedItems.slice(0, 5));
            const prompt = "Analyze the top 5 inventory levels. Identify any Dead Stock candidates (items with old batch lots) or potential shortages based on typical defense usage rates.";
            const result = await askTacticalAssistant(context, prompt);
            setAiAnalysis(result);
            telemetryService.endSpan(span, 'ok');
        } catch (error) {
            telemetryService.endSpan(span, 'error', error);
            setAiAnalysis("Analysis failed due to system error: AI service offline.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">

            {/* Inventory Form Modal */}
            {isModalOpen && <InventoryForm onClose={handleCloseModal} itemToEdit={itemToEdit} onRefresh={onRefresh} />}

            {/* Toolbar */}
            <div className="px-4 py-4 md:px-8 md:py-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shrink-0 border-b border-gray-50">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-gray-800 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-black/5 transition-all outline-none placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)} // Add new item
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm transition-all"
                    >
                        <Plus size={18} />
                        <span>Add Asset (C)</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-all">
                        <SlidersHorizontal size={18} />
                        <span>Filter</span>
                    </button>
                    <button
                        onClick={handleAIAnalyze}
                        disabled={isAnalyzing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-black text-white hover:bg-gray-800 font-semibold text-sm transition-all shadow-key disabled:opacity-50">
                        <Sparkles size={18} className={isAnalyzing ? "animate-spin" : ""} />
                        {isAnalyzing ? 'Processing' : 'AI Audit (B)'}
                    </button>
                </div>
            </div>

            {/* AI Output Area */}
            {aiAnalysis && (
                <div className="mx-4 md:mx-8 mt-4 p-4 md:p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-1.5 bg-black rounded-lg">
                            <Sparkles size={14} className="text-white" />
                        </div>
                        <h4 className="font-display font-bold text-sm uppercase tracking-wide text-gray-900">Analysis Result</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {aiAnalysis}
                    </p>
                </div>
            )}

            {/* Data Grid */}
            <div className="flex-1 overflow-auto p-4 md:p-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr>
                                <th className="pb-4 pl-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Part Details</th>
                                <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Traceability</th>
                                <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Quantity</th>
                                <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="pb-4 pr-4 text-right font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isSearching ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400 animate-pulse">
                                        Searching Secure Database...
                                    </td>
                                </tr>
                            ) : displayedItems.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors rounded-xl">
                                    <td className="py-5 pl-4">
                                        <div className="font-bold text-gray-900 text-sm">{item.partNumber}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{item.nomenclature}</div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded w-fit">S/N: {item.serialNumber}</span>
                                            <span className="text-[10px] text-gray-400">CAGE: {item.cageCode}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 font-display font-medium text-gray-900">{item.quantity}</td>
                                    <td className="py-5 text-sm text-gray-500 flex items-center gap-1">
                                        <MapPin size={12} className={item.location.includes('SECURE') ? 'text-red-500' : 'text-gray-400'} />
                                        {item.location}
                                    </td>
                                    <td className="py-5"><StatusBadge status={item.status} /></td>
                                    <td className="py-5 pr-4 text-right">
                                        <button
                                            onClick={() => handleOpenEdit(item)}
                                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                            title="Edit Location/Status (D)"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};