import React, { useState } from 'react';
import { INITIAL_USERS } from '../services/mockData';
import { StatusBadge, TacticalCard, Toast } from './Shared';
import { Users, Shield, Plus, Lock, CheckCircle2, X, Globe, Microscope, Building2, FileCheck, Ban, Unlock, Activity, Server, Database, Download, Upload, RefreshCw, CheckSquare, Key } from 'lucide-react';
import { SystemUser, UserRole, ComplianceMode } from '../types';
import { INITIAL_VALIDATIONS } from '../services/mockData';
import { auditService } from '../services/auditService';

interface AdminViewProps {
  activeMode: ComplianceMode;
  setMode: (mode: ComplianceMode) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ activeMode, setMode }) => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // CAPA State
  const [showCAPAModal, setShowCAPAModal] = useState(false);
  const [capas, setCapas] = useState([
    { id: 'CAPA-102', description: 'Deviation in Traveler T-2024-A', status: 'OPEN', createdDate: '2024-11-15' },
    { id: 'CAPA-SF-245', description: 'Material variance detected', status: 'OPEN', createdDate: '2024-11-18' },
    { id: 'CAPA-101', description: 'Equipment calibration overdue', status: 'CLOSED', createdDate: '2024-11-10' }
  ]);

  // Physical Access State
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessZones] = useState([
    { zone: 'Clean Room A', level: 'Level 4 - Restricted', roles: ['Quality Inspector', 'Admin'] },
    { zone: 'Warehouse Secure', level: 'Level 3 - Controlled', roles: ['Logistics Specialist', 'Admin'] },
    { zone: 'Server Room', level: 'Level 5 - Maximum Security', roles: ['Admin'] },
    { zone: 'Production Floor', level: 'Level 2 - General Access', roles: ['Production Operator', 'Quality Inspector', 'Admin'] }
  ]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Mock handling for role change
  const handleRoleChange = (role: string) => {
    if (editingUser) {
      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, role: role as UserRole } : u
      ));

      auditService.logAction(
        'J. Doe (U-001)',
        'USER_ROLE_MODIFIED',
        `Changed role for user ${editingUser.id} (${editingUser.name}) to ${role}.`
      );

      setEditingUser({ ...editingUser, role: role as UserRole });
      showToast(`Role updated to ${role}`, 'success');
    }
  };

  const handleLockUnlock = () => {
    if (editingUser) {
      const newStatus = editingUser.status === 'Active' ? 'Locked' : 'Active';

      setUsers(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, status: newStatus } : u
      ));

      auditService.logAction(
        'J. Doe (U-001)',
        newStatus === 'Locked' ? 'USER_LOCKED' : 'USER_UNLOCKED',
        `User ${editingUser.email} was ${newStatus.toLowerCase()} by Admin.`
      );

      setEditingUser({ ...editingUser, status: newStatus });
      showToast(`User account ${newStatus}`, newStatus === 'Active' ? 'success' : 'error');
    }
  };

  const handleBackup = () => {
    showToast("System Backup Initiated...", 'success');
    setTimeout(() => {
      showToast("Backup Completed Successfully. Saved to Secure Storage.", 'success');
    }, 2000);
  };

  const handleRestore = () => {
    if (window.confirm("WARNING: This will overwrite current data with the last backup. Continue?")) {
      showToast("System Restore Initiated...", 'success');
      setTimeout(() => {
        showToast("System Restored to Checkpoint 2024-11-22.", 'success');
      }, 2500);
    }
  };

  // Close CAPA
  const handleCloseCAPAClick = (capaId: string) => {
    if (window.confirm(`Are you sure you want to close CAPA ${capaId}? This action requires QA approval.`)) {
      setCapas(prev => prev.map(c =>
        c.id === capaId ? { ...c, status: 'CLOSED' } : c
      ));

      auditService.logAction(
        'J. Doe (U-001)',
        'CAPA_CLOSED',
        `CAPA ${capaId} was closed and verified by Admin.`
      );

      showToast(`CAPA ${capaId} closed successfully`, 'success');
    }
  };

  const getRestrictionText = (role: UserRole) => {
    switch (role) {
      case UserRole.PRODUCTION_OPERATOR:
        return "Restricted to Manufacturing View and Read-Only Inventory. No access to financials.";
      case UserRole.FINANCIAL_OFFICER:
        return "Restricted to Finance and Procurement Views. Can approve invoices up to $50k.";
      case UserRole.QUALITY_INSPECTOR:
        return "Access to Inventory and Manufacturing QC steps. Can flag items as Quarantine.";
      case UserRole.LOGISTICS_SPECIALIST:
        return "Access to Orders and Inventory. Can reroute shipments but cannot view pricing.";
      case UserRole.ADMIN:
        return "Full System Access. Root privileges enabled.";
      default:
        return "Standard User Access.";
    }
  };

  const renderComplianceButton = (mode: ComplianceMode, icon: any, label: string, desc: string) => {
    const isActive = activeMode === mode;
    return (
      <button
        onClick={() => setMode(mode)}
        className={`
                relative p-4 rounded-2xl border text-left transition-all duration-300
                ${isActive
            ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
            : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300 hover:shadow-md'
          }
            `}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-gray-50 text-gray-600'}`}>
            {React.createElement(icon, { size: 20 })}
          </div>
          {isActive && <CheckCircle2 size={20} className="text-green-400" />}
        </div>
        <h4 className="font-bold text-sm mb-1">{label}</h4>
        <p className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-6 md:gap-8 overflow-y-auto relative">

      {/* Compliance Governance Panel */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Adaptive Compliance Governance</h2>
          <p className="text-sm text-gray-500 mt-1">Select the active regulatory framework for the entire ERP system.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderComplianceButton(ComplianceMode.DEFENCE, Shield, 'Defense (ITAR)', 'CMMC Level 3 & AS9100D')}
          {renderComplianceButton(ComplianceMode.PHARMA_US, Microscope, 'Pharma US', 'FDA 21 CFR Part 11 & GxP')}
          {renderComplianceButton(ComplianceMode.PHARMA_EU, Building2, 'Pharma EU', 'EU GMP Annex 11')}
          {renderComplianceButton(ComplianceMode.GCAP, Globe, 'Global (GCAP)', 'Standard Audit Protocol')}
        </div>
      </section>

      {/* Pharma GxP Validation Section (Conditional) */}
      {(activeMode === ComplianceMode.PHARMA_US || activeMode === ComplianceMode.PHARMA_EU) && (
        <section>
          <TacticalCard title="Validation Documentation (GxP)">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Document</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Type</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase">Review Date</th>
                    <th className="pb-3 text-xs font-bold text-gray-400 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {INITIAL_VALIDATIONS.map(doc => (
                    <tr key={doc.id} className="group hover:bg-gray-50">
                      <td className="py-3 text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FileCheck size={14} className="text-blue-500" />
                        {doc.name}
                      </td>
                      <td className="py-3 text-xs font-mono text-gray-500">{doc.type}</td>
                      <td className="py-3 text-xs text-gray-500">{doc.nextReviewDate}</td>
                      <td className="py-3 text-right">
                        <StatusBadge status={doc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TacticalCard>
        </section>
      )}

      {/* System Health & Maintenance Section */}
      <section>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Health Monitor */}
          <TacticalCard title="System Health Monitor" className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                <Activity size={24} className="text-green-600 mb-2" />
                <p className="text-xs font-bold text-gray-500 uppercase">API Latency</p>
                <p className="text-xl font-display font-bold text-gray-900">42ms</p>
                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full mt-1">Optimal</span>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                <Database size={24} className="text-green-600 mb-2" />
                <p className="text-xs font-bold text-gray-500 uppercase">DB Status</p>
                <p className="text-xl font-display font-bold text-gray-900">Connected</p>
                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full mt-1">99.9% Uptime</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                <Server size={24} className="text-blue-600 mb-2" />
                <p className="text-xs font-bold text-gray-500 uppercase">Services</p>
                <p className="text-xl font-display font-bold text-gray-900">All Active</p>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full mt-1">v2.4.0</span>
              </div>
            </div>
          </TacticalCard>

          {/* Maintenance Actions */}
          <TacticalCard title="Data Maintenance" className="flex-1">
            <div className="flex flex-col justify-center h-full gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-gray-600">
                    <Download size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">System Backup</p>
                    <p className="text-xs text-gray-500">Last backup: 2 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={handleBackup}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-key"
                >
                  Run Backup
                </button>
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-red-600">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Disaster Recovery</p>
                    <p className="text-xs text-red-400">Restore from checkpoint</p>
                  </div>
                </div>
                <button
                  onClick={handleRestore}
                  className="px-4 py-2 bg-white text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                  Restore Data
                </button>
              </div>
            </div>
          </TacticalCard>
        </div>
      </section>

      <div className="w-full h-px bg-gray-100" />

      {/* User Management Section */}
      <section className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">User Management Directory</h2>
            <p className="text-sm text-gray-500 mt-1">Manage RBAC policies and user access levels.</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-2xl hover:bg-gray-800 transition-all font-bold text-sm shadow-key w-full sm:w-auto">
            <Plus size={18} />
            Create New User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-4 md:p-6 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="pb-4 pl-2 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Active</th>
                  <th className="pb-4 pr-2 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium whitespace-nowrap">
                        <Shield size={12} className="text-gray-400" /> {user.role}
                      </span>
                    </td>
                    <td className="py-4"><StatusBadge status={user.status} /></td>
                    <td className="py-4 text-sm text-gray-500 font-mono">{user.lastActive}</td>
                    <td className="py-4 pr-2 text-right">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        Edit Roles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Role Editor Modal/Overlay */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-100 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Edit Permissions</h3>
                <p className="text-sm text-gray-500 mt-1">Configuring access for <span className="font-bold text-gray-800">{editingUser.name}</span></p>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(UserRole).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${editingUser.role === role
                        ? 'bg-black text-white border-black shadow-key'
                        : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                      <span>{role}</span>
                      {editingUser.role === role && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 mb-2 text-orange-600">
                  <Lock size={16} />
                  <span className="text-xs font-bold uppercase tracking-wide">Security Constraint</span>
                </div>
                <p className="text-sm font-medium text-gray-800 leading-snug">
                  {getRestrictionText(editingUser.role)}
                </p>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button onClick={() => setEditingUser(null)} className="flex-1 py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors">
                    Save Changes
                  </button>
                  <button onClick={() => setEditingUser(null)} className="flex-1 py-3.5 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                </div>

                <button
                  onClick={handleLockUnlock}
                  className={`w-full py-3 rounded-2xl font-bold border-2 flex items-center justify-center gap-2 transition-colors
                            ${editingUser.status === 'Active'
                      ? 'border-red-100 text-red-600 hover:bg-red-50'
                      : 'border-green-100 text-green-600 hover:bg-green-50'
                    }
                        `}
                >
                  {editingUser.status === 'Active' ? <Ban size={18} /> : <Unlock size={18} />}
                  {editingUser.status === 'Active' ? 'Lock Account Access' : 'Unlock Account Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAPA Management Section */}
      <section>
        <TacticalCard title="CAPA Management">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Corrective and Preventive Actions</p>
            <button
              onClick={() => setShowCAPAModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
            >
              <CheckSquare size={16} />
              Manage CAPAs
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Open CAPAs</p>
              <p className="text-3xl font-display font-bold text-red-600 mt-2">
                {capas.filter(c => c.status === 'OPEN').length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Closed CAPAs</p>
              <p className="text-3xl font-display font-bold text-green-600 mt-2">
                {capas.filter(c => c.status === 'CLOSED').length}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">Total CAPAs</p>
              <p className="text-3xl font-display font-bold text-blue-600 mt-2">
                {capas.length}
              </p>
            </div>
          </div>
        </TacticalCard>
      </section>

      {/* Physical Access Management Section */}
      <section>
        <TacticalCard title="Physical Access Control">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">Role-based access to physical zones</p>
            <button
              onClick={() => setShowAccessModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
            >
              <Key size={16} />
              Manage Access
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {accessZones.slice(0, 2).map((zone, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{zone.zone}</p>
                    <p className="text-xs text-gray-500 mt-1">{zone.level}</p>
                  </div>
                  <Shield size={20} className="text-gray-400" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {zone.roles.map((role, ridx) => (
                    <span key={ridx} className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TacticalCard>
      </section>

      {/* CAPA Modal */}
      {showCAPAModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 max-w-3xl w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900">CAPA Management</h3>
                <p className="text-sm text-gray-500 mt-1">Close and verify corrective actions</p>
              </div>
              <button onClick={() => setShowCAPAModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              {capas.map((capa) => (
                <div key={capa.id} className={`p-4 rounded-xl border ${capa.status === 'OPEN' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono font-bold text-gray-900">{capa.id}</p>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${capa.status === 'OPEN' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'
                          }`}>
                          {capa.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{capa.description}</p>
                      <p className="text-xs text-gray-500">Created: {capa.createdDate}</p>
                    </div>
                    {capa.status === 'OPEN' && (
                      <button
                        onClick={() => handleCloseCAPAClick(capa.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold ml-4"
                      >
                        <CheckSquare size={16} />
                        Close CAPA
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCAPAModal(false)}
              className="w-full mt-6 py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Physical Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100 max-w-3xl w-full animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900">Physical Access Control</h3>
                <p className="text-sm text-gray-500 mt-1">Manage role-based access to physical zones</p>
              </div>
              <button onClick={() => setShowAccessModal(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {accessZones.map((zone, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={18} className="text-blue-600" />
                        <p className="font-bold text-gray-900">{zone.zone}</p>
                      </div>
                      <p className="text-sm text-gray-600">{zone.level}</p>
                    </div>
                    <Key size={20} className="text-gray-400" />
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Authorized Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {zone.roles.map((role, ridx) => (
                        <span key={ridx} className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Physical access changes require Security Officer approval and are logged for compliance audits.
              </p>
            </div>

            <button
              onClick={() => setShowAccessModal(false)}
              className="w-full mt-6 py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};