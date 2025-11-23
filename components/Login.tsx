import React, { useState, useEffect } from 'react';
import { Shield, Lock, MapPin } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState(0); // 0: Check, 1: Ready, 2: Auth
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate environment checks
    const checks = [
      "Verifying IP Origin... [US-EAST-VA-1]",
      "Checking Device Compliance... [MANAGED-DEVICE-OK]",
      "Browser Policy Enforced... [CHROME-ENT-OK]",
      "Establishing Secure Tunnel... [TLS-1.3]"
    ];

    let delay = 500;
    checks.forEach((check, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, check]);
        if (index === checks.length - 1) setStep(1);
      }, delay);
      delay += 800;
    });
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-defense-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

      <div className="z-10 w-full max-w-md p-8 bg-slate-900/80 border border-slate-700 backdrop-blur rounded-lg shadow-2xl relative">
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-800 rounded-full border border-slate-600">
                <Shield size={48} className="text-defense-accent" />
            </div>
        </div>
        
        <h1 className="text-center text-2xl font-bold tracking-widest text-white mb-1 uppercase">PocketOps Defense</h1>
        <p className="text-center text-xs text-slate-500 mb-8 font-mono">AUTHORIZED PERSONNEL ONLY // US PERSONS</p>

        <div className="bg-black/40 rounded p-4 font-mono text-xs text-emerald-500/80 mb-6 h-32 overflow-y-auto border border-slate-800">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">> {log}</div>
          ))}
          {step === 0 && <span className="animate-pulse">_</span>}
        </div>

        {step >= 1 && (
            <button 
                onClick={onLogin}
                className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 rounded flex items-center justify-center gap-2 transition group"
            >
                <Lock size={16} className="text-slate-600" />
                <span>Authenticate with YubiKey</span>
            </button>
        )}
        
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <MapPin size={12} />
            <span>Secure Node: AWS-GOV-CLOUD-US-WEST</span>
        </div>
      </div>
    </div>
  );
};