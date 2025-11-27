'use client';

import { StatusBeacon } from '@pocket-ops/ui';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:3001';

export default function Home() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [eventsRes, pendingRes] = await Promise.all([
          fetch(`${API_URL}/ledger/events`, { headers }),
          fetch(`${API_URL}/ledger/pending`, { headers })
        ]);

        if (eventsRes.status === 401 || pendingRes.status === 401) {
          logout();
          return;
        }

        setEvents(await eventsRes.json());
        setPendingActions(await pendingRes.json());
      } catch (e) {
        console.error('Failed to fetch data', e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [token, router, logout]);

  const handleRequestApproval = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/ledger/request-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action_type: 'BATCH_CREATE',
          payload: { batch_id: `B-${Math.floor(Math.random() * 1000)}`, quantity: 500 },
        }),
      });
      // Data will refresh on next interval
    } catch (e) {
      console.error('Failed to request approval', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`${API_URL}/ledger/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });
      // Data will refresh on next interval
    } catch (e) {
      console.error('Failed to approve', e);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-zinc-50 dark:bg-black font-sans">
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight">Operation Obsidian</h1>
            <p className="text-sm text-zinc-500 font-mono mt-1">
              LOGGED IN AS: <span className="text-white">{user.username.toUpperCase()}</span> // ROLE: <span className="text-blue-400">{user.role}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="px-3 py-1 text-xs font-mono border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-500 border-red-900/30"
            >
              DISCONNECT
            </button>
            <StatusBeacon status="nominal" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Command Console */}
          <div className="p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Command Console
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                <p className="text-sm font-mono mb-2 text-zinc-500">ACTION: BATCH_CREATE</p>
                <p className="text-sm font-mono mb-4 text-zinc-500">PAYLOAD: {'{ "quantity": 500 }'}</p>

                <button
                  onClick={handleRequestApproval}
                  disabled={loading}
                  className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-3 rounded font-mono text-sm hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? 'TRANSMITTING...' : 'REQUEST AUTHORIZATION'}
                </button>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Pending Approvals
            </h2>
            <div className="space-y-3">
              {pendingActions.length === 0 && (
                <p className="text-zinc-400 text-sm italic">No pending actions.</p>
              )}
              {pendingActions.map((action) => (
                <div key={action.id} className="p-4 border border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/10 rounded flex justify-between items-center">
                  <div>
                    <p className="font-mono text-sm font-bold">{action.action_type}</p>
                    <p className="text-xs text-zinc-500 mt-1">ID: {action.id.slice(0, 8)}...</p>
                  </div>
                  {user.role === 'SUPERVISOR' ? (
                    <button
                      onClick={() => handleApprove(action.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-yellow-600 transition-colors"
                    >
                      APPROVE
                    </button>
                  ) : (
                    <span className="text-xs text-yellow-600 dark:text-yellow-500 font-mono">
                      AWAITING SIG
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The Ledger */}
        <div className="p-6 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            The Ledger (Immutable)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">2nd Actor</th>
                  <th className="px-4 py-3">Prev Hash (Chain)</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b dark:border-zinc-800 font-mono hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {new Date(parseInt(event.timestamp)).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{event.action_type}</td>
                    <td className="px-4 py-3 text-zinc-500">{event.actor_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {event.secondary_actor_id ? event.secondary_actor_id.slice(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 font-mono">
                      {event.prev_hash.slice(0, 12)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
