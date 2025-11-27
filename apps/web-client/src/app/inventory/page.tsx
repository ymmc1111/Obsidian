'use client';

import { useQuery } from '@tanstack/react-query';
import { StatusBeacon, SlideToExecute } from '@pocket-ops/ui';
import { useBlurSecurity } from '../../hooks/useBlurSecurity';
import { cn } from '@pocket-ops/ui';

const API_URL = 'http://localhost:3001';

export default function InventoryView() {
    const isBlurred = useBlurSecurity(30000); // 30s timeout for demo

    const { data: items, isLoading, refetch } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/inventory`);
            return res.json();
        }
    });

    const handleRestock = async () => {
        // For demo: Restock the first item
        if (items && items.length > 0) {
            await fetch(`${API_URL}/inventory/${items[0].id}/adjust`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta: 50 })
            });
            await refetch();
        }
    };

    return (
        <div className="relative min-h-screen p-8">
            {/* Security Blur Overlay */}
            <div
                className={cn(
                    "fixed inset-0 backdrop-blur-xl z-50 transition-opacity duration-500 flex items-center justify-center pointer-events-none",
                    isBlurred ? "opacity-100" : "opacity-0"
                )}
            >
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 tracking-tighter">SECURE TERMINAL LOCKED</h1>
                    <p className="font-mono text-zinc-400">USER INACTIVITY DETECTED</p>
                </div>
            </div>

            <div className={cn("transition-all duration-500", isBlurred && "opacity-20 blur-sm")}>
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">INVENTORY CONTROL</h1>
                        <p className="text-zinc-500 font-mono text-sm">SECTOR 7-G // AUTHORIZED EYES ONLY</p>
                    </div>
                    <StatusBeacon status="nominal" />
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-4">
                        {isLoading ? (
                            <div className="text-zinc-500 font-mono animate-pulse">SCANNING DATABASE...</div>
                        ) : (
                            items?.map((item: any) => (
                                <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex justify-between items-center group hover:border-zinc-700 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-lg">{item.nomenclature}</h3>
                                        <p className="text-zinc-500 font-mono text-xs mt-1">PN: {item.part_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold">{item.quantity}</div>
                                        <div className={cn(
                                            "text-xs font-bold tracking-wider",
                                            item.status === 'NOMINAL' ? "text-green-500" :
                                                item.status === 'LOW' ? "text-yellow-500" : "text-red-500"
                                        )}>
                                            {item.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Action Panel */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg h-fit">
                        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 mb-2">EMERGENCY RESTOCK</label>
                                <SlideToExecute onExecute={handleRestock} label="SLIDE TO ORDER" />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-zinc-500 mb-2">LOCKDOWN SECTOR</label>
                                <SlideToExecute
                                    onExecute={async () => { await new Promise(r => setTimeout(r, 1000)) }}
                                    label="SLIDE TO LOCK"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
