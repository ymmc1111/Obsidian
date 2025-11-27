'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from './index';

interface SlideToExecuteProps {
    onExecute: () => Promise<void>;
    label?: string;
    disabled?: boolean;
}

export const SlideToExecute = ({ onExecute, label = 'SLIDE TO EXECUTE', disabled = false }: SlideToExecuteProps) => {
    const [status, setStatus] = useState<'IDLE' | 'EXECUTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [0, 250], [0.5, 1]);
    const handleOpacity = useTransform(x, [0, 250], [1, 0]);

    // Constraints
    const MAX_DRAG = 250;

    const handleDragEnd = async () => {
        if (x.get() > MAX_DRAG - 10 && !disabled) {
            // Trigger execution
            setStatus('EXECUTING');
            try {
                await onExecute();
                setStatus('SUCCESS');
                // Reset after delay
                setTimeout(() => {
                    setStatus('IDLE');
                    x.set(0);
                }, 2000);
            } catch (e) {
                setStatus('ERROR');
                setTimeout(() => {
                    setStatus('IDLE');
                    x.set(0);
                }, 2000);
            }
        } else {
            // Snap back
            animate(x, 0, { type: 'spring', stiffness: 400, damping: 40 });
        }
    };

    const MotionDiv = motion.div as any;
    const MotionSpan = motion.span as any;

    return (
        <div className={cn(
            "relative h-14 w-full max-w-[300px] rounded-full bg-zinc-800 overflow-hidden select-none",
            disabled && "opacity-50 cursor-not-allowed"
        )}>
            {/* Success/Error Overlay */}
            {status === 'SUCCESS' && (
                <MotionDiv
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-green-500 flex items-center justify-center z-20"
                >
                    <span className="font-bold text-white tracking-widest">EXECUTED</span>
                </MotionDiv>
            )}

            {status === 'ERROR' && (
                <MotionDiv
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-red-600 flex items-center justify-center z-20"
                >
                    <span className="font-bold text-white tracking-widest">FAILED</span>
                </MotionDiv>
            )}

            {/* Background Fill */}
            <MotionDiv
                style={{ width: x, opacity: backgroundOpacity }}
                className="absolute left-0 top-0 bottom-0 bg-white/20 z-0"
            />

            {/* Label */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <MotionSpan
                    style={{ opacity: handleOpacity }}
                    className="text-xs font-mono font-bold text-zinc-400 tracking-[0.2em]"
                >
                    {status === 'EXECUTING' ? 'PROCESSING...' : label}
                </MotionSpan>
            </div>

            {/* Slider Handle */}
            <MotionDiv
                style={{ x }}
                drag={disabled || status !== 'IDLE' ? false : "x"}
                dragConstraints={{ left: 0, right: MAX_DRAG }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="absolute left-1 top-1 bottom-1 w-12 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing z-20 flex items-center justify-center"
            >
                <div className="w-6 h-6 text-black">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </MotionDiv>
        </div>
    );
};
