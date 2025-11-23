import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { StatusBadge } from './Shared';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { askTacticalAssistant } from '../services/geminiService';

interface InventoryViewProps {
  items: InventoryItem[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const filteredItems = items.filter(i => 
    i.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.nomenclature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const context = JSON.stringify(items);
    const prompt = "Analyze the current inventory levels. Identify any Dead Stock candidates (items with old batch lots) or potential shortages based on typical defense usage rates.";
    const result = await askTacticalAssistant(context, prompt);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="px-8 py-6 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 border-b border-gray-50">
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
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-all">
                <SlidersHorizontal size={18} />
                <span>Filter</span>
            </button>
            <button 
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-black text-white hover:bg-gray-800 font-semibold text-sm transition-all shadow-key disabled:opacity-50">
                <Sparkles size={18} className={isAnalyzing ? "animate-spin" : ""} />
                {isAnalyzing ? 'Processing' : 'AI Audit'}
            </button>
        </div>
      </div>

      {/* AI Output Area */}
      {aiAnalysis && (
        <div className="mx-8 mt-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
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
      <div className="flex-1 overflow-auto p-8">
        <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
                <tr>
                    <th className="pb-4 pl-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Part Details</th>
                    <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Traceability</th>
                    <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="pb-4 font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="pb-4 pr-4 text-right font-display font-semibold text-xs text-gray-400 uppercase tracking-wider">Cost</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => (
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
                        <td className="py-5 text-sm text-gray-500">{item.location}</td>
                        <td className="py-5"><StatusBadge status={item.status} /></td>
                        <td className="py-5 pr-4 text-right font-mono text-sm text-gray-600">${item.unitCost.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};