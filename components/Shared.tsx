import React from 'react';
import { LucideIcon } from 'lucide-react';

// The "Surface" is the Jony Ive-esque card. Clean, white, rounded, soft shadow.
export const TacticalCard = ({ children, className = '', title, action }: { children?: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`bg-white rounded-3xl shadow-soft p-6 flex flex-col border border-white/50 ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-end mb-6">
        {title && (
          <h3 className="font-display text-lg font-semibold tracking-tight text-ios-text">
            {title}
          </h3>
        )}
        {action}
      </div>
    )}
    <div className="flex-1 min-h-0 relative">
      {children}
    </div>
  </div>
);

export const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = 'bg-gray-100 text-gray-600';
  if (['AVAILABLE', 'COMPLETED', 'PASSED', 'SAFE'].includes(status)) colorClass = 'bg-[#34C759]/10 text-[#34C759]';
  if (['ALLOCATED', 'IN_PROGRESS', 'CUI'].includes(status)) colorClass = 'bg-orange-100 text-orange-600';
  if (['QUARANTINE', 'SCRAP', 'FAILED', 'HALTED', 'SECRET'].includes(status)) colorClass = 'bg-red-100 text-red-600';

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide ${colorClass} uppercase`}>
      {status}
    </span>
  );
};

// The NavButton now mimics the physical keys from the image.
// Squircle shape, centered or spacious, tactile feel.
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
    className={`
      relative group flex items-center transition-all duration-300 ease-out
      ${collapsed ? 'justify-center w-12 h-12 rounded-2xl' : 'w-full px-4 py-3.5 rounded-2xl gap-4'}
      ${active 
        ? 'bg-white shadow-key text-ios-text scale-[1.02]' 
        : 'text-gray-400 hover:bg-white/50 hover:text-gray-600'
      }
    `}
  >
    <Icon 
      size={collapsed ? 22 : 20} 
      className={`transition-colors duration-300 ${active ? "text-ios-text" : "text-gray-400 group-hover:text-gray-600"}`}
      strokeWidth={2} 
    />
    
    {!collapsed && (
      <span className={`font-display font-medium text-[15px] tracking-tight ${active ? 'text-ios-text' : 'text-gray-500 group-hover:text-gray-700'}`}>
        {label}
      </span>
    )}
    
    {/* Active Indicator Dot (Subtle) */}
    {active && !collapsed && (
      <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black" />
    )}
  </button>
);