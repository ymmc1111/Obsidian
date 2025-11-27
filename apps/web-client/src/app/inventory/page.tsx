'use client';

import { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useBlurSecurity } from '../../hooks/useBlurSecurity';
import { getDatabase } from '../../lib/db';
import QRScanner from '../../components/QRScanner';
import { SlideToExecute } from '@pocket-ops/ui';

const API_URL = 'http://localhost:3001';

export default function InventoryView() {
    const isOnline = useNetworkStatus();
    const { isLocked, unlock } = useBlurSecurity(30000);

    const [items, setItems] = useState<any[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedData, setScannedData] = useState('');
    const [db, setDb] = useState<any>(null);

    // Initialize RxDB
    useEffect(() => {
        getDatabase().then(setDb);
    }, []);

    // Sync with server when online
    useEffect(() => {
        if (!db || !isOnline) return;

        const syncFromServer = async () => {
            try {
                const res = await fetch(`${API_URL}/inventory`);
                const serverItems = await res.json();

                // Update local DB
                for (const item of serverItems) {
                    await db.inventory.upsert({
                        ...item,
                        _synced: true,
                    });
                }
            } catch (e) {
                console.error('Sync failed', e);
            }
        };

        syncFromServer();
        const interval = setInterval(syncFromServer, 10000);
        return () => clearInterval(interval);
    }, [db, isOnline]);

    // Load from local DB
    useEffect(() => {
        if (!db) return;

        const subscription = db.inventory.find().$.subscribe((docs: any[]) => {
            setItems(docs.map((doc: any) => doc.toJSON()));
        });

        return () => subscription.unsubscribe();
    }, [db]);

    const handleScan = (data: string) => {
        setScannedData(data);
        setShowScanner(false);
        // Find item by scanned code
        const item = items.find(i => i.part_number === data || i.id === data);
        if (item) {
            alert(`Found: ${item.nomenclature} (Qty: ${item.quantity})`);
        } else {
            alert(`Item not found: ${data}`);
        }
    };

    const handleAdjustQuantity = async (itemId: string, delta: number) => {
        if (!db) return;

        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;

        // Update local DB immediately
        await db.inventory.upsert({
            ...item,
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
            _synced: false,
        });

        // Sync to server if online
        if (isOnline) {
            try {
                await fetch(`${API_URL}/inventory/${itemId}/adjust`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ delta }),
                });

                // Mark as synced
                await db.inventory.upsert({
                    ...item,
                    quantity: newQuantity,
                    _synced: true,
                });
            } catch (e) {
                console.error('Server update failed, will retry when online', e);
            }
        }
    };

    if (isLocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-white mb-4">TERMINAL LOCKED</h1>
                    <button
                        onClick={unlock}
                        className="px-6 py-3 bg-white text-black font-bold rounded"
                    >
                        UNLOCK
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">INVENTORY // SHOP FLOOR</h1>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-1 rounded text-xs font-mono ${isOnline ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {isOnline ? '● ONLINE' : '● OFFLINE'}
                        </div>
                        <button
                            onClick={() => setShowScanner(!showScanner)}
                            className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200"
                        >
                            {showScanner ? 'CLOSE SCANNER' : 'SCAN QR/BARCODE'}
                        </button>
                    </div>
                </div>

                {/* Scanner */}
                {showScanner && (
                    <QRScanner
                        onScan={handleScan}
                        onError={(err) => console.error('Scanner error:', err)}
                    />
                )}

                {scannedData && (
                    <div className="p-4 bg-blue-500/20 border border-blue-500 rounded">
                        <p className="font-mono">Last Scanned: {scannedData}</p>
                    </div>
                )}

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="p-6 border border-zinc-800 rounded-lg bg-zinc-900 space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{item.nomenclature}</h3>
                                    <p className="text-sm text-zinc-500 font-mono">{item.part_number}</p>
                                </div>
                                {!item._synced && (
                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">
                                        PENDING SYNC
                                    </span>
                                )}
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold">{item.quantity}</span>
                                <span className="text-zinc-500">units</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAdjustQuantity(item.id, -1)}
                                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                                >
                                    -1
                                </button>
                                <button
                                    onClick={() => handleAdjustQuantity(item.id, 1)}
                                    className="flex-1 px-3 py-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30"
                                >
                                    +1
                                </button>
                            </div>

                            <SlideToExecute
                                onExecute={() => handleAdjustQuantity(item.id, 10)}
                                label="SLIDE TO ORDER +10"
                            />
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        <p>No inventory data. {isOnline ? 'Syncing from server...' : 'Connect to network to sync.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
