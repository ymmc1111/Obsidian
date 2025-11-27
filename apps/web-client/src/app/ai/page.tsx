'use client';

import { useState, useEffect } from 'react';

interface Prediction {
    machine_id: string;
    timestamp: string;
    is_anomaly: boolean;
    anomaly_score: number;
    risk_level: string;
    current_metrics: Record<string, number>;
    recommendation: string;
}

export default function AIPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/analyze');
            const data = await res.json();
            setPredictions(data);
        } catch (err) {
            console.error('Failed to fetch predictions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
        const interval = setInterval(fetchPredictions, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'CRITICAL': return 'bg-red-500/20 text-red-500 border-red-500';
            case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500';
            case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
            case 'LOW': return 'bg-green-500/20 text-green-500 border-green-500';
            default: return 'bg-zinc-500/20 text-zinc-500 border-zinc-500';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">AI PREDICTIVE MAINTENANCE</h1>
                        <p className="text-sm text-zinc-500 font-mono mt-1">
                            Machine learning-powered failure prediction
                        </p>
                    </div>
                    <button
                        onClick={fetchPredictions}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading ? 'ANALYZING...' : 'REFRESH ANALYSIS'}
                    </button>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                    <p className="text-sm text-blue-400">
                        <strong>Isolation Forest Algorithm:</strong> Detects anomalies by identifying data points that are isolated from the normal pattern.
                        Models are trained on 1 week of historical data and analyze rolling statistics, rate of change, and threshold violations.
                    </p>
                </div>

                {/* Predictions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {predictions.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-zinc-500">
                            <p>No predictions available. Ensure telemetry data is being collected.</p>
                            <p className="text-sm mt-2">Run: <code className="bg-zinc-800 px-2 py-1 rounded">node simulator.js</code></p>
                        </div>
                    )}

                    {predictions.map((pred) => (
                        <div
                            key={pred.machine_id}
                            className={`p-6 border-2 rounded-lg ${getRiskColor(pred.risk_level)}`}
                        >
                            {/* Machine Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl font-mono">{pred.machine_id}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {new Date(pred.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded font-bold text-sm ${getRiskColor(pred.risk_level)}`}>
                                        {pred.risk_level}
                                    </div>
                                    {pred.is_anomaly && (
                                        <div className="mt-2 text-xs text-red-400">
                                            ⚠️ ANOMALY DETECTED
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Anomaly Score */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-zinc-400">Anomaly Score</span>
                                    <span className="font-mono">{pred.anomaly_score.toFixed(3)}</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                                    <div
                                        className={`h-full ${pred.is_anomaly ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${Math.abs(pred.anomaly_score) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current Metrics */}
                            <div className="mb-4 p-3 bg-black/30 rounded">
                                <h4 className="text-xs text-zinc-400 mb-2">CURRENT METRICS</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(pred.current_metrics).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-zinc-500">{key}:</span>
                                            <span className="font-mono">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendation */}
                            <div className={`p-3 rounded border ${getRiskColor(pred.risk_level)}`}>
                                <h4 className="text-xs font-bold mb-1">RECOMMENDATION</h4>
                                <p className="text-sm">{pred.recommendation}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
                    <h3 className="text-sm font-bold mb-3">RISK LEVELS</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500"></div>
                            <span>LOW - Normal operation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-yellow-500"></div>
                            <span>MEDIUM - Monitor closely</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-orange-500"></div>
                            <span>HIGH - Urgent attention</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500"></div>
                            <span>CRITICAL - Immediate action</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
