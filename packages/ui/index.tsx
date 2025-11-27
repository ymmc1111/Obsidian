import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Design System "Ordnance" Colors
export const ORDNANCE_COLORS = {
    void: '#000000',
    surface: '#1a1a1a',
    critical: '#FF3B30',
    nominal: '#34C759',
};

export * from './SlideToExecute';

export const StatusBeacon = ({ status }: { status: 'nominal' | 'critical' | 'warning' }) => {
    const colorMap = {
        nominal: 'bg-[#34C759]',
        critical: 'bg-[#FF3B30]',
        warning: 'bg-yellow-500',
    };

    return (
        <div className="relative flex h-3 w-3">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", colorMap[status])}></span>
            <span className={cn("relative inline-flex rounded-full h-3 w-3", colorMap[status])}></span>
        </div>
    );
};
