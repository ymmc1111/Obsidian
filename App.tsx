import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
  Menu,
  X,
  Map,
  Target
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
import { LogisticsView } from './components/LogisticsView';
import { TraceView } from './components/TraceView';
import { Login } from './components/Login';
import { INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_LOGS } from './services/mockData';
import { ComplianceMode } from './types';

enum View {
  DASHBOARD,
  INVENTORY,
  TRACEABILITY,
  MANUFACTURING,
  PROCUREMENT,
  FINANCE,
  ORDERS,
  PLANNING,
  LOGISTICS,
  ADMIN
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeComplianceMode, setActiveComplianceMode] = useState<ComplianceMode>(ComplianceMode.DEFENCE);

  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentView]);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-ios-bg text-ios-text overflow-hidden font-sans">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ios-bg z-40 flex items-center justify-between px-4 border-b border-gray-200">
         <div className="flex items-center gap-3">
            <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-gray-700 hover:bg-white/50"
            >
                <Menu size={24} />
            </button>
            <span className="font-display font-bold text-lg">PocketOps</span>
         </div>
         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
            JD
         </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Drawer on Mobile, Sticky on Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
        flex flex-col py-6 px-3 bg-ios-bg lg:bg-transparent
        transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}
        ${sidebarCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'}
      `}>
        {/* Logo Area (Hidden on Mobile as we have header) */}
        <div className="h-12 mb-8 items-center px-2 hidden lg:flex">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-3 group outline-none"
          >
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-key group-hover:scale-105 transition-transform">
              <span className="font-display font-bold text-lg">P</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col text-left">
                <span className="font-display font-bold text-lg tracking-tight leading-none">PocketOps</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1">Defense OS</span>
              </div>
            )}
          </button>
        </div>

        {/* Mobile Sidebar Header */}
        <div className="lg:hidden h-12 mb-6 flex items-center justify-between px-2">
            <span className="font-display font-bold text-xl">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl bg-gray-100 text-gray-600">
                <X size={20} />
            </button>
        </div>

        {/* Navigation "Keys" */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar pb-6 lg:pb-0">
          <NavButton 
            icon={LayoutGrid} 
            label="Overview" 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={Box} 
            label="Inventory" 
            active={currentView === View.INVENTORY} 
            onClick={() => setCurrentView(View.INVENTORY)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={Target} 
            label="Traceability" 
            active={currentView === View.TRACEABILITY} 
            onClick={() => setCurrentView(View.TRACEABILITY)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={Factory} 
            label="Production" 
            active={currentView === View.MANUFACTURING} 
            onClick={() => setCurrentView(View.MANUFACTURING)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <div className="h-px bg-gray-200 mx-4 my-2" />
          <NavButton 
            icon={ClipboardList} 
            label="Procurement" 
            active={currentView === View.PROCUREMENT} 
            onClick={() => setCurrentView(View.PROCUREMENT)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={Truck} 
            label="Orders" 
            active={currentView === View.ORDERS} 
            onClick={() => setCurrentView(View.ORDERS)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={DollarSign} 
            label="Finance" 
            active={currentView === View.FINANCE} 
            onClick={() => setCurrentView(View.FINANCE)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <NavButton 
            icon={CalendarCheck} 
            label="Production Planning" 
            active={currentView === View.PLANNING} 
            onClick={() => setCurrentView(View.PLANNING)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
           <NavButton 
            icon={Map} 
            label="Logistics & Facilities" 
            active={currentView === View.LOGISTICS} 
            onClick={() => setCurrentView(View.LOGISTICS)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
          <div className="h-px bg-gray-200 mx-4 my-2" />
          <NavButton 
            icon={Users} 
            label="Admin" 
            active={currentView === View.ADMIN} 
            onClick={() => setCurrentView(View.ADMIN)} 
            collapsed={sidebarCollapsed && !mobileMenuOpen}
          />
        </nav>

        {/* User Profile "Key" */}
        <div className="mt-auto pt-4 lg:block hidden">
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
        
        {/* Mobile Logout Button */}
        <div className="mt-auto pt-4 lg:hidden">
             <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold">
                <LogOut size={20} />
                <span>Log Out</span>
             </button>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 h-full pt-16 lg:pt-4 lg:p-4 lg:pl-0 relative overflow-hidden">
        <div className="h-full w-full bg-white lg:rounded-[2.5rem] lg:shadow-soft overflow-hidden relative flex flex-col border-t lg:border border-white/60">
          
          {/* Header inside the main surface (Desktop only mostly, or simplified on mobile) */}
          <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-gray-100 shrink-0 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg md:text-2xl font-display font-bold tracking-tight text-gray-900 truncate max-w-[200px] md:max-w-none">
                {currentView === View.DASHBOARD && 'Mission Control'}
                {currentView === View.INVENTORY && 'Materials & Assets'}
                {currentView === View.TRACEABILITY && 'Visual Genealogy'}
                {currentView === View.MANUFACTURING && 'Assembly Line'}
                {currentView === View.PROCUREMENT && 'P2P Control Grid'}
                {currentView === View.FINANCE && 'Financial Command'}
                {currentView === View.ORDERS && 'Global Order Dispatch'}
                {currentView === View.PLANNING && 'Production Planning'}
                {currentView === View.LOGISTICS && 'Logistics & Facilities'}
                {currentView === View.ADMIN && 'System Admin'}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="px-3 py-1.5 md:px-4 rounded-full bg-gray-50 border border-gray-200 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${activeComplianceMode === ComplianceMode.DEFENCE ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
                <span className="text-[10px] md:text-xs font-medium text-gray-600 whitespace-nowrap">Mode: {activeComplianceMode.split('_')[0]}</span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-white relative">
             {currentView === View.DASHBOARD && <Dashboard complianceMode={activeComplianceMode} />}
             {currentView === View.INVENTORY && <InventoryView items={INITIAL_INVENTORY} />}
             {currentView === View.TRACEABILITY && <TraceView />}
             {currentView === View.MANUFACTURING && <TravelerView traveler={MOCK_TRAVELER} complianceMode={activeComplianceMode} />}
             {currentView === View.PROCUREMENT && <ProcurementView />}
             {currentView === View.FINANCE && <FinanceView complianceMode={activeComplianceMode} />}
             {currentView === View.ORDERS && <OrdersView complianceMode={activeComplianceMode} />}
             {currentView === View.PLANNING && <PlanningView complianceMode={activeComplianceMode} />}
             {currentView === View.LOGISTICS && <LogisticsView complianceMode={activeComplianceMode} />}
             {currentView === View.ADMIN && <AdminView activeMode={activeComplianceMode} setMode={setActiveComplianceMode} />}
          </div>

          {/* Live Audit Ticker (Bottom) */}
          <div className="h-8 md:h-10 bg-gray-50 border-t border-gray-100 flex items-center px-4 md:px-6 gap-4 overflow-hidden shrink-0">
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 shrink-0">
              <Activity size={12} /> <span className="hidden sm:inline">System Logs</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8 overflow-hidden marquee-mask">
              {INITIAL_LOGS.map((log, i) => (
                 <div key={i} className="flex items-center gap-2 text-[10px] md:text-xs font-mono text-gray-500 whitespace-nowrap opacity-60">
                    <span className="text-gray-300">|</span>
                    <span>{log.timestamp.split('T')[1].substring(0,5)}</span>
                    <span className="font-medium text-gray-700 truncate max-w-[150px]">{log.action}</span>
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