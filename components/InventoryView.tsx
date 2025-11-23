import React, { useState } from 'react';
import { InventoryItem, ItemStatus } from '../types';
import { StatusBadge, TacticalCard } from './Shared';
import { Search, Filter, Cpu } from 'lucide-react';
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
    const prompt = "Analyze the current inventory levels. Identify any Dead Stock candidates (items with old batch lots) or potential shortages based on typical defense usage rates. Flag any CUI items located in unsecure locations.";
    const result = await askTacticalAssistant(context, prompt);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search Part #, Nomenclature, CAGE..."
                    className="bg-defense-900 border border-slate-700 text-sm rounded w-full pl-10 pr-4 py-2 focus:outline-none focus:border-defense-accent text-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 rounded hover:bg-slate-800 transition text-sm text-slate-300">
                <Filter size={14} /> Filter
            </button>
        </div>
        <button 
            onClick={handleAIAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-defense-accent/10 border border-defense-accent text-defense-accent rounded hover:bg-defense-accent/20 transition text-sm font-medium disabled:opacity-50">
            <Cpu size={16} />
            {isAnalyzing ? 'Analyzing Grid...' : 'AI Inventory Audit'}
        </button>
      </div>

      {aiAnalysis && (
        <div className="bg-defense-900/80 border border-defense-accent/30 p-4 rounded animate-in fade-in slide-in-from-top-2">
            <h4 className="text-defense-accent font-mono text-sm font-bold mb-2 flex items-center gap-2">
                <Cpu size={14}/> TACTICAL ANALYSIS
            </h4>
            <p className="text-sm font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                {aiAnalysis}
            </p>
        </div>
      )}

      {/* Table Primitive */}
      <div className="flex-1 overflow-auto border border-slate-800 rounded bg-defense-900 shadow-inner">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 sticky top-0 z-10 text-xs uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                    <th className="p-4 border-b border-slate-800">Part Number</th>
                    <th className="p-4 border-b border-slate-800">Nomenclature</th>
                    <th className="p-4 border-b border-slate-800">CAGE</th>
                    <th className="p-4 border-b border-slate-800">S/N</th>
                    <th className="p-4 border-b border-slate-800">Qty</th>
                    <th className="p-4 border-b border-slate-800">Location</th>
                    <th className="p-4 border-b border-slate-800">Status</th>
                    <th className="p-4 border-b border-slate-800 text-right">Unit Cost</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition cursor-pointer group">
                        <td className="p-4 font-mono font-medium text-slate-200 group-hover:text-defense-accent">
                            {item.partNumber}
                            {item.batchLot && <span className="block text-[10px] text-slate-500">{item.batchLot}</span>}
                        </td>
                        <td className="p-4 text-slate-300">{item.nomenclature}</td>
                        <td className="p-4 font-mono text-slate-400">{item.cageCode}</td>
                        <td className="p-4 font-mono text-slate-400">{item.serialNumber}</td>
                        <td className="p-4 font-mono">{item.quantity}</td>
                        <td className="p-4 font-mono text-xs">{item.location}</td>
                        <td className="p-4"><StatusBadge status={item.status} /></td>
                        <td className="p-4 font-mono text-right text-slate-400">${item.unitCost.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};