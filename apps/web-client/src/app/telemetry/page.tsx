'use client';

import { useState, useEffect } from 'react';

interface TelemetryData {
    machineId: string;
    timestamp: string;
    data: {
        metrics: {
            temperature?: number;
            vibration?: number;
            spindle_speed?: number;
            power_consumption?: number;
        };
    };
}

export default function TelemetryPage() {
    const [telemetry, setTelemetry] = useState<Map<string, TelemetryData>>(new Map());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setIsConnected(true);
            console.log('Connected to telemetry stream');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'telemetry') {
                setTelemetry((prev) => {
                    const next = new Map(prev);
                    next.set(data.machineId, data);
                    return next;
                });
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from telemetry stream');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close();
        };
    }, []);

    const machines = Array.from(telemetry.values());

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">SHOP FLOOR TELEMETRY</h1>
                        <p className="text-sm text-zinc-500 font-mono mt-1">Real-time machine monitoring</p>
                    </div>
                    <div className={`px-3 py-1 rounded text-xs font-mono ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {isConnected ? '● STREAMING' : '● DISCONNECTED'}
                    </div>
                </div>

                {/* Machine Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {machines.length === 0 && (
                        <div className="col-span-full text-center py-12 text-zinc-500">
                            <p>No telemetry data. Start the simulator: <code className="bg-zinc-800 px-2 py-1 rounded">node simulator.js</code></p>
                        </div>
                    )}

                    {machines.map((machine) => {
                        const metrics = machine.data.metrics;
                        const temp = metrics.temperature || 0;
                        const tempStatus = temp > 210 ? 'CRITICAL' : temp > 200 ? 'WARNING' : 'NOMINAL';
                        const tempColor = temp > 210 ? 'text-red-500' : temp > 200 ? 'text-yellow-500' : 'text-green-500';

                        return (
                            <div key={machine.machineId} className="p-6 border border-zinc-800 rounded-lg bg-zinc-900 space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg font-mono">{machine.machineId}</h3>
                                    <span className={`px-2 py-1 text-xs rounded ${tempColor} bg-current/10`}>
                                        {tempStatus}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-500">Temperature</span>
                                            <span className={`font-mono ${tempColor}`}>{temp.toFixed(1)}°C</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                                            <div
                                                className={`h-full ${temp > 210 ? 'bg-red-500' : temp > 200 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min((temp / 220) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-500">Vibration</span>
                                            <span className="font-mono">{(metrics.vibration || 0).toFixed(2)} mm/s</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${Math.min(((metrics.vibration || 0) / 3) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-500">Spindle Speed</span>
                                            <span className="font-mono">{(metrics.spindle_speed || 0).toFixed(0)} RPM</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-zinc-500">Power</span>
                                            <span className="font-mono">{(metrics.power_consumption || 0).toFixed(1)} kW</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-zinc-600 font-mono">
                                    Last update: {new Date(machine.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
