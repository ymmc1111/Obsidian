import React, { useState } from 'react';
import { X, User, Lock, Shield, Clock, CheckCircle2, Key, Smartphone } from 'lucide-react';
import { SystemUser } from '../types';
import { Toast } from './Shared';

interface UserProfileModalProps {
    user: SystemUser;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // MFA State
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [showMFASetup, setShowMFASetup] = useState(false);
    const [mfaCode, setMfaCode] = useState('');

    // Mock Session History
    const [sessions] = useState([
        { id: 1, device: 'Chrome on MacOS', location: 'San Francisco, CA', time: '2 minutes ago', active: true },
        { id: 2, device: 'Safari on iPhone', location: 'San Francisco, CA', time: '1 hour ago', active: false },
        { id: 3, device: 'Chrome on Windows', location: 'New York, NY', time: '2 days ago', active: false }
    ]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Please fill in all password fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        // Mock password change
        showToast('Password changed successfully', 'success');
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleEnableMFA = () => {
        if (!mfaCode || mfaCode.length !== 6) {
            showToast('Please enter a valid 6-digit code', 'error');
            return;
        }

        setMfaEnabled(true);
        setShowMFASetup(false);
        setMfaCode('');
        showToast('MFA enabled successfully', 'success');
    };

    const handleDisableMFA = () => {
        if (window.confirm('Are you sure you want to disable Multi-Factor Authentication?')) {
            setMfaEnabled(false);
            showToast('MFA disabled', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gray-100 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-gray-900">{user.name}</h2>
                                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">
                                        {user.role}
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 md:px-8 shrink-0">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'profile'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <User size={16} className="inline mr-2" />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'security'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Shield size={16} className="inline mr-2" />
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'sessions'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Clock size={16} className="inline mr-2" />
                        Sessions
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    User ID
                                </label>
                                <p className="font-mono text-gray-900">{user.id}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Last Active
                                </label>
                                <p className="text-gray-900">{user.lastActive}</p>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> To update your name or email, please contact your system administrator.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            {/* Password Section */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Lock size={20} className="text-gray-600" />
                                        <h3 className="font-bold text-gray-900">Password</h3>
                                    </div>
                                    {!showPasswordForm && (
                                        <button
                                            onClick={() => setShowPasswordForm(true)}
                                            className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            Change Password
                                        </button>
                                    )}
                                </div>

                                {showPasswordForm ? (
                                    <div className="space-y-3 mt-4">
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePasswordChange}
                                                className="flex-1 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                                            >
                                                Update Password
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowPasswordForm(false);
                                                    setCurrentPassword('');
                                                    setNewPassword('');
                                                    setConfirmPassword('');
                                                }}
                                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Last changed: 30 days ago</p>
                                )}
                            </div>

                            {/* MFA Section */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Smartphone size={20} className="text-gray-600" />
                                        <h3 className="font-bold text-gray-900">Multi-Factor Authentication</h3>
                                    </div>
                                    {mfaEnabled ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-green-600" />
                                            <span className="text-xs font-bold text-green-600">Enabled</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400">Disabled</span>
                                    )}
                                </div>

                                {!mfaEnabled && !showMFASetup && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                                        <button
                                            onClick={() => setShowMFASetup(true)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                        >
                                            Enable MFA
                                        </button>
                                    </div>
                                )}

                                {showMFASetup && (
                                    <div className="space-y-3 mt-4">
                                        <div className="p-3 bg-white rounded-lg border border-gray-300">
                                            <p className="text-xs font-bold text-gray-500 mb-2">1. Scan this QR code with your authenticator app</p>
                                            <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                                                <Key size={32} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2">2. Enter the 6-digit code</p>
                                            <input
                                                type="text"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={mfaCode}
                                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-center font-mono text-lg"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleEnableMFA}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                                            >
                                                Verify & Enable
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowMFASetup(false);
                                                    setMfaCode('');
                                                }}
                                                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {mfaEnabled && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-3">Your account is protected with MFA</p>
                                        <button
                                            onClick={handleDisableMFA}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                                        >
                                            Disable MFA
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">Active sessions and login history</p>
                            {sessions.map((session) => (
                                <div key={session.id} className={`p-4 rounded-xl border ${session.active ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-gray-900">{session.device}</p>
                                                {session.active && (
                                                    <span className="text-[10px] font-bold bg-green-200 text-green-700 px-2 py-1 rounded-full">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{session.location}</p>
                                            <p className="text-xs text-gray-500 mt-1">{session.time}</p>
                                        </div>
                                        {!session.active && (
                                            <button className="text-xs font-bold text-red-600 hover:text-red-700">
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-black text-white rounded-2xl font-bold shadow-key hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};
