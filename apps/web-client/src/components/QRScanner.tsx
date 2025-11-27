'use client';

import { useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: Error) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [reader, setReader] = useState<BrowserMultiFormatReader | null>(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        setReader(codeReader);

        return () => {
            codeReader.reset();
        };
    }, []);

    const startScan = async () => {
        if (!reader) return;

        setIsScanning(true);
        try {
            const videoInputDevices = await reader.listVideoInputDevices();
            const selectedDeviceId = videoInputDevices[0]?.deviceId;

            if (!selectedDeviceId) {
                throw new Error('No camera found');
            }

            reader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, error) => {
                if (result) {
                    onScan(result.getText());
                    stopScan();
                }
                if (error && onError) {
                    onError(error);
                }
            });
        } catch (err) {
            if (onError && err instanceof Error) {
                onError(err);
            }
            setIsScanning(false);
        }
    };

    const stopScan = () => {
        if (reader) {
            reader.reset();
        }
        setIsScanning(false);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-zinc-900">
            <video
                id="video"
                className="w-full max-w-md rounded"
                style={{ display: isScanning ? 'block' : 'none' }}
            />

            {!isScanning ? (
                <button
                    onClick={startScan}
                    className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors"
                >
                    START SCANNER
                </button>
            ) : (
                <button
                    onClick={stopScan}
                    className="px-6 py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition-colors"
                >
                    STOP SCANNER
                </button>
            )}
        </div>
    );
}
