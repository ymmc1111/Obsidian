import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, Fingerprint } from 'lucide-react';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState(0); // 0: Check, 1: Ready
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate quick environment check
    setTimeout(() => {
      setLoading(false);
      setStep(1);
    }, 2000);
  }, []);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F2F2F7]">
      
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center relative overflow-hidden">
          
          {/* Top Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>

          <div className="mb-8 p-6 bg-gray-50 rounded-full shadow-inner">
            {loading ? (
                <Loader2 className="animate-spin text-gray-400" size={40} />
            ) : (
                <ShieldCheck className="text-black drop-shadow-md" size={40} />
            )}
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 tracking-tight">PocketOps</h1>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Secure Access Point</p>
          </div>

          {step === 1 && (
            <button 
                onClick={onLogin}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
            >
                <Fingerprint size={24} className="text-gray-400" />
                <span>Authenticate</span>
            </button>
          )}

          {loading && (
             <div className="w-full flex flex-col gap-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-black animate-[pulse_1s_ease-in-out_infinite] w-2/3"></div>
                </div>
                <p className="text-center text-xs font-mono text-gray-400 mt-2">Verifying environment integrity...</p>
             </div>
          )}
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