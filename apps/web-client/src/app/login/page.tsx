'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:3001';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            login(data.access_token, data.user);
            router.push('/');
        } catch (err) {
            setError('Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tighter mb-2">POCKET OPS</h1>
                    <p className="text-zinc-500 font-mono text-sm">SECURE ACCESS TERMINAL</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 bg-zinc-900 p-8 rounded-lg border border-zinc-800">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm font-mono text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-400">OPERATOR ID</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-white focus:outline-none transition-colors font-mono"
                            placeholder="username"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-400">ACCESS CODE</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-white focus:outline-none transition-colors font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 rounded hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'AUTHENTICATING...' : 'ESTABLISH LINK'}
                    </button>
                </form>

                <div className="text-center text-xs text-zinc-600 font-mono">
                    UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE
                </div>
            </div>
        </div>
    );
}
