'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

export default function LayoutWrapper({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Show loader on every hard refresh, dismiss after window loads or 2s
        const handleLoad = () => setLoading(false);

        if (document.readyState === 'complete') {
            // If already loaded, still show the splash for the full 2s
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        } else {
            window.addEventListener('load', handleLoad);
            // Fallback: dismiss after 2s regardless
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => {
                window.removeEventListener('load', handleLoad);
                clearTimeout(timer);
            };
        }
    }, []);

    return (
        <>
            {loading && <SplashScreen onComplete={() => setLoading(false)} />}
            <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
                {children}
            </div>
            <FloatingWhatsApp />
        </>
    );
}
