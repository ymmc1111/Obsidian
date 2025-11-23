import React from 'react';
import { LucideIcon } from 'lucide-react';

export const TacticalCard = ({ children, className = '', title, action }: { children?: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`bg-defense-900 border border-slate-700/50 shadow-lg relative overflow-hidden flex flex-col ${className}`}>
    {/* Decorative corner markers */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-defense-accent opacity-50"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-defense-accent opacity-50"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-defense-accent opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-defense-accent opacity-50"></div>
    
    {(title || action) && (
      <div className="flex justify-between items-center bg-slate-800/40 px-4 py-2 border-b border-slate-700/50 shrink-0">
        <h3 className="font-mono text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
          {title}
        </h3>
        {action}
      </div>
    )}
    <div className="p-4 flex-1 min-h-0">
      {children}
    </div>
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = 'bg-slate-700 text-slate-300';
  if (['AVAILABLE', 'COMPLETED', 'PASSED'].includes(status)) colorClass = 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
  if (['ALLOCATED', 'IN_PROGRESS', 'CUI'].includes(status)) colorClass = 'bg-amber-900/50 text-amber-400 border-amber-800';
  if (['QUARANTINE', 'SCRAP', 'FAILED', 'HALTED', 'SECRET'].includes(status)) colorClass = 'bg-rose-900/50 text-rose-400 border-rose-800';

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${colorClass} uppercase tracking-tight`}>
      {status}
    </span>
  );
};

export const NavButton = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  collapsed 
}: { 
  icon: LucideIcon, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  collapsed: boolean
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 transition-all duration-200 group
      ${active 
        ? 'bg-defense-800 text-defense-accent border-r-2 border-defense-accent' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
  >
    <Icon size={20} className={active ? "text-defense-accent" : "text-slate-500 group-hover:text-slate-300"} />
    {!collapsed && <span className="font-medium text-sm tracking-wide">{label}</span>}
  </button>
);