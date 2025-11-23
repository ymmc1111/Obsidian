import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Factory, 
  Settings, 
  Menu, 
  LogOut, 
  TerminalSquare 
} from 'lucide-react';
import { NavButton } from './components/Shared';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { TravelerView } from './components/TravelerView';
import { Login } from './components/Login';
import { INITIAL_INVENTORY, MOCK_TRAVELER, INITIAL_LOGS } from './services/mockData';

enum View {
  DASHBOARD,
  INVENTORY,
  MANUFACTURING,
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
    <div className="flex h-screen w-screen bg-defense-950 text-slate-200 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`bg-defense-900 border-r border-slate-800 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!sidebarCollapsed && <span className="font-bold tracking-widest text-defense-accent">POCKET//OPS</span>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-500 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          <NavButton 
            icon={LayoutDashboard} 
            label="Command Center" 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            collapsed={sidebarCollapsed}
          />
          <NavButton 
            icon={PackageSearch} 
            label="Inventory (ARP)" 
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
        </nav>

        {/* Audit Stream Teaser */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500 uppercase font-bold">
                <TerminalSquare size={12} /> Live Audit Log
            </div>
            <div className="text-[10px] font-mono text-slate-400 space-y-2 opacity-70">
                {INITIAL_LOGS.map(log => (
                    <div key={log.id} className="truncate">
                        <span className="text-defense-accent">{log.timestamp.split('T')[1].substring(0,8)}</span> {log.action}
                    </div>
                ))}
            </div>
          </div>
        )}

        <div className="p-2 border-t border-slate-800">
          <NavButton 
            icon={LogOut} 
            label="Secure Logout" 
            active={false} 
            onClick={() => setIsAuthenticated(false)} 
            collapsed={sidebarCollapsed}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-defense-900/50 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-medium text-white tracking-wide">
            {currentView === View.DASHBOARD && 'Operational Awareness'}
            {currentView === View.INVENTORY && 'Inventory Control Grid'}
            {currentView === View.MANUFACTURING && 'Active Traveler Control'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">CPT. J. DOE</span>
                <span className="text-[10px] text-emerald-500 font-mono">CLEARANCE: SECRET//NOFORN</span>
             </div>
             <div className="h-8 w-8 rounded bg-slate-700 flex items-center justify-center border border-slate-600">
                <span className="text-xs font-bold">JD</span>
             </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-hidden bg-defense-950 relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 pointer-events-none"></div>
          
          <div className="relative h-full z-0">
             {currentView === View.DASHBOARD && <Dashboard />}
             {currentView === View.INVENTORY && <InventoryView items={INITIAL_INVENTORY} />}
             {currentView === View.MANUFACTURING && <TravelerView traveler={MOCK_TRAVELER} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;