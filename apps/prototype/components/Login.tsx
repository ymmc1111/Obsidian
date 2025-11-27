import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, Fingerprint, Mail, Key } from 'lucide-react';
import { BackendAPI } from '../services/backend/api';
import { SystemUser } from '../types';

// Update prop type to accept the SystemUser object on successful login
export const Login = ({ onLogin }: { onLogin: (user: SystemUser) => void }) => {
  const [step, setStep] = useState(0); // 0: Check, 1: Ready, 2: Login Form
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('j.doe@pocketops.mil');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Simulate quick environment check
    setTimeout(() => {
      setLoading(false);
      setStep(2); // Start at login form step
    }, 1000);
  }, []);

  const handleLogin = async () => {
    if (isAuthenticating || !email || !password) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      const user = await BackendAPI.login(email, password);
      // Successful login, pass the full user object back to App.tsx
      onLogin(user);
    } catch (e) {
      setError((e as Error).message || "Authentication failed.");
      setIsAuthenticating(false);
    }
  };

  const currentStatusText = loading ? "Verifying environment integrity..." : (isAuthenticating ? "Transmitting credentials..." : error ? "Authentication Failed" : "Awaiting Credentials");

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F2F2F7]">

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center relative overflow-hidden">

          {/* Top Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>

          <div className="mb-8 p-6 bg-gray-50 rounded-full shadow-inner">
            {loading || isAuthenticating ? (
              <Loader2 className="animate-spin text-gray-400" size={40} />
            ) : (
              <ShieldCheck className="text-black drop-shadow-md" size={40} />
            )}
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 tracking-tight">PocketOps</h1>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Secure Access Point</p>
          </div>

          {step === 2 && (
            <div className="w-full space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="ITAR-Compliant Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-gray-50 rounded-xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>
              {/* Password Input */}
              <div className="relative">
                <Key size={18} className="absolute left-4 top-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="Secure Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full h-12 bg-gray-50 rounded-xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={isAuthenticating}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-80 disabled:scale-100"
              >
                <Fingerprint size={24} className="text-gray-400" />
                <span>{isAuthenticating ? 'Authenticating...' : 'Authenticate'}</span>
              </button>

              {error && (
                <p className="text-xs font-medium text-center text-red-500">{error}</p>
              )}
            </div>
          )}

          {/* Status Message */}
          <div className="w-full flex flex-col gap-2 mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full bg-black ${loading || isAuthenticating ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''} w-full`}></div>
            </div>
            <p className="text-center text-xs font-mono text-gray-400 mt-2">{currentStatusText}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full backdrop-blur text-xs font-medium text-gray-500">
            <Lock size={10} />
            <span>Encrypted Connection &bull; US-EAST-1</span>
          </div>
        </div>

      </div>
    </div>
  );
};