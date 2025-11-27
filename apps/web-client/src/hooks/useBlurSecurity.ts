'use client';

import { useState, useEffect } from 'react';

export const useBlurSecurity = (timeoutMs: number = 60000) => {
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const resetTimer = () => {
            setIsBlurred(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsBlurred(true), timeoutMs);
        };

        // Events to track activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        // Initial start
        resetTimer();

        return () => {
            clearTimeout(timeout);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [timeoutMs]);

    return isBlurred;
};
