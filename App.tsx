
import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Box, 
  Factory, 
  LogOut, 
  Activity,
  DollarSign,
  ClipboardList,
  Truck,
  Users,
  CalendarCheck
} from 'lucide-react';
import { NavButton } from './components/Shared';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { TravelerView } from './components/TravelerView';
import { ProcurementView } from './components/ProcurementView';
import { FinanceView } from './components/FinanceView';
import { OrdersView } from './components/OrdersView';
import { AdminView } from './components/AdminView';
import { PlanningView } from './components/PlanningView';
import { Login } from './components/Login';
import { INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_LOGS } from './services/mockData';

enum View {
  DASHBOARD,
  INVENTORY,
  MANUFACTURING,
  PROCUREMENT,
  FINANCE,
  ORDERS,
  PLANNING,
  ADMIN
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-ios-bg text-ios-text overflow-hidden font-sans">
      
      {/* Control Pad (Sidebar) */}
      <aside className={`
        relative z-20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        flex flex-col py-6 px-3
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Logo Area */}
        <div className="h-12 mb-8 flex items-center px-2">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 group outline-none"
          >
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-key group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-lg">P</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight leading-none">PocketOps</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1">Defense OS</span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation "Keys" */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <NavButton 
            icon={LayoutGrid} 
            label="Overview" 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={Box} 
            label="Inventory" 
            active={currentView === View.INVENTORY} 
            onClick={() => setCurrentView(View.INVENTORY)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={Factory} 
            label="Production" 
            active={currentView === View.MANUFACTURING} 
            onClick={() => setCurrentView(View.MANUFACTURING)} 
            collapsed={sidebarCollapsed}
          />
          <div className="h-px bg-gray-200 mx-4 my-2" />
          <NavButton 
            icon={ClipboardList} 
            label="Procurement" 
            active={currentView === View.PROCUREMENT} 
            onClick={() => setCurrentView(View.PROCUREMENT)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={Truck} 
            label="Orders" 
            active={currentView === View.ORDERS} 
            onClick={() => setCurrentView(View.ORDERS)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={DollarSign} 
            label="Finance" 
            active={currentView === View.FINANCE} 
            onClick={() => setCurrentView(View.FINANCE)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={CalendarCheck} 
            label="Planning & Logistics" 
            active={currentView === View.PLANNING} 
            onClick={() => setCurrentView(View.PLANNING)} 
            collapsed={sidebarCollapsed}
          />
          <div className="h-px bg-gray-200 mx-4 my-2" />
          <NavButton 
            icon={Users} 
            label="Admin" 
            active={currentView === View.ADMIN} 
            onClick={() => setCurrentView(View.ADMIN)} 
            collapsed={sidebarCollapsed}
          />
        </nav>

        {/* User Profile "Key" */}
        <div className="mt-auto pt-4">
           {!sidebarCollapsed ? (
            <div className="bg-white rounded-2xl p-4 shadow-key border border-white/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-800">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">J. Doe</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Clearance Lvl 4</p>
              </div>
              <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
           ) : (
             <button onClick={() => setIsAuthenticated(false)} className="w-12 h-12 rounded-2xl bg-white shadow-key flex items-center justify-center text-gray-400 hover:text-red-500">
                <LogOut size={20} />
             </button>
           )}
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 h-full p-4 pl-0 relative overflow-hidden">
        <div className="h-full w-full rounded-[2.5rem] bg-white shadow-soft overflow-hidden relative flex flex-col border border-white/60">
          
          {/* Header inside the main surface */}
          <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 shrink-0">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-gray-900">
                {currentView === View.DASHBOARD && 'Mission Control'}
                {currentView === View.INVENTORY && 'Materials & Assets'}
                {currentView === View.MANUFACTURING && 'Assembly Line'}
                {currentView === View.PROCUREMENT && 'P2P Control Grid'}
                {currentView === View.FINANCE && 'Financial Command'}
                {currentView === View.ORDERS && 'Global Order Dispatch'}
                {currentView === View.PLANNING && 'Production Planning & Logistics'}
                {currentView === View.ADMIN && 'System Administration'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">System Optimal</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-white relative">
             {currentView === View.DASHBOARD && <Dashboard />}
             {currentView === View.INVENTORY && <InventoryView items={INITIAL_INVENTORY} />}
             {currentView === View.MANUFACTURING && <TravelerView traveler={MOCK_TRAVELER} />}
             {currentView === View.PROCUREMENT && <ProcurementView />}
             {currentView === View.FINANCE && <FinanceView />}
             {currentView === View.ORDERS && <OrdersView />}
             {currentView === View.PLANNING && <PlanningView />}
             {currentView === View.ADMIN && <AdminView />}
          </div>

          {/* Live Audit Ticker (Bottom) */}
          <div className="h-10 bg-gray-50 border-t border-gray-100 flex items-center px-6 gap-4 overflow-hidden shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
              <Activity size={12} /> System Logs
            </div>
            <div className="flex items-center gap-8 overflow-hidden">
              {INITIAL_LOGS.map((log, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-500 whitespace-nowrap opacity-60">
                    <span className="text-gray-300">|</span>
                    <span>{log.timestamp.split('T')[1].substring(0,5)}</span>
                    <span className="font-medium text-gray-700">{log.action}</span>
                 </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
