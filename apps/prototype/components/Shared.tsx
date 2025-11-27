import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

// The "Surface" is the Jony Ive-esque card. Clean, white, rounded, soft shadow.
export const TacticalCard = ({ children, className = '', title, action }: { children?: React.ReactNode, className?: string, title?: string, action?: React.ReactNode }) => (
  <div className={`bg-white rounded-3xl shadow-soft p-4 md:p-6 flex flex-col border border-white/50 ${className}`}>
    {(title || action) && (
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 md:mb-6 gap-2 sm:gap-0">
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

  // Success / Good / Safe
  if (['AVAILABLE', 'COMPLETED', 'PASSED', 'SAFE', 'Active', 'FILLED', 'PAID', 'APPROVED', 'SHIPPED', 'DELIVERED', 'Complete', 'Valid', 'Calibrated', 'Scheduled', 'Nominal', 'Closed'].includes(status)) {
    colorClass = 'bg-[#34C759]/10 text-[#34C759]';
  }

  // Warning / Pending / Processing
  if (['ALLOCATED', 'IN_PROGRESS', 'CUI', 'SENT', 'PARTIAL', 'PENDING', 'PROCESSING', 'NEW', 'Pending', 'Scheduled', 'Warning', 'Investigation'].includes(status)) {
    colorClass = 'bg-orange-100 text-orange-600';
  }

  // Danger / Error / Stop
  if (['QUARANTINE', 'SCRAP', 'FAILED', 'HALTED', 'SECRET', 'OVERDUE', 'BACKORDERED', 'Mismatched', 'On Hold', 'CLOSED', 'Expired', 'Overdue', 'Restricted', 'Delayed', 'Open'].includes(status)) {
    colorClass = 'bg-red-100 text-red-600';
  }

  return (
    <span className={`px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] font-semibold tracking-wide ${colorClass} uppercase whitespace-nowrap`}>
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
  </button>
);

// Reusable Stat Widget for Dashboard and Finance views
export const StatWidget = ({ title, value, unit, trend, icon: Icon, color }: any) => (
  <TacticalCard className="h-full justify-between group hover:shadow-md transition-shadow duration-500">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-900'}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} /> {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-1 flex-wrap">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">{value}</h2>
        {unit && <span className="text-sm font-medium text-gray-400">{unit}</span>}
      </div>
    </div>
  </TacticalCard>
);

export const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
      <div className={`w-2 h-2 rounded-full ${type === 'error' ? 'bg-white' : 'bg-green-400'}`}></div>
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};