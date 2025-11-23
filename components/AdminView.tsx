
import React, { useState } from 'react';
import { INITIAL_USERS } from '../services/mockData';
import { StatusBadge, TacticalCard } from './Shared';
import { Users, Shield, Plus, Lock, CheckCircle2, X } from 'lucide-react';
import { SystemUser, UserRole } from '../types';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Mock handling for role change
  const handleRoleChange = (role: string) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, role: role as UserRole } : u
      ));
      setEditingUser({ ...editingUser, role: role as UserRole });
    }
  };

  const getRestrictionText = (role: UserRole) => {
    switch(role) {
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

  return (
    <div className="h-full flex flex-col bg-white p-8 gap-6 overflow-y-auto relative">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900">User Management Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage RBAC policies and user access levels.</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl hover:bg-gray-800 transition-all font-bold text-sm shadow-key">
          <Plus size={18} />
          Create New User
        </button>
      </div>

      {/* Users Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-soft border border-gray-100 p-6 overflow-hidden flex flex-col">
         <div className="overflow-auto">
            <table className="w-full text-left border-collapse">
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
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                              <Shield size={12} className="text-gray-400" /> {user.role}
                           </span>
                        </td>
                        <td className="py-4"><StatusBadge status={user.status} /></td>
                        <td className="py-4 text-sm text-gray-500 font-mono">{user.lastActive}</td>
                        <td className="py-4 pr-2 text-right">
                           <button 
                              onClick={() => setEditingUser(user)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
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

      {/* Role Editor Modal/Overlay */}
      {editingUser && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">Edit Permissions</h3>
                    <p className="text-sm text-gray-500 mt-1">Configuring access for <span className="font-bold text-gray-800">{editingUser.name}</span></p>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={20} className="text-gray-500" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned Role</label>
                    <div className="grid grid-cols-1 gap-2">
                       {Object.values(UserRole).map(role => (
                          <button 
                             key={role}
                             onClick={() => handleRoleChange(role)}
                             className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                                editingUser.role === role 
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

                 <div className="pt-4 flex gap-3">
                    <button onClick={() => setEditingUser(null)} className="flex-1 py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors">
                       Save Changes
                    </button>
                    <button onClick={() => setEditingUser(null)} className="flex-1 py-3.5 bg-gray-50 text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-colors">
                       Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
