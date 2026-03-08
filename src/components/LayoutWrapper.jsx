'use client';

import { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';

export default function LayoutWrapper({ children }) {
    const [showSplash, setShowSplash] = useState(true);

    // After mount, wait 2 seconds, then remove Splash.
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

            {/* 
               We maintain a CSS opacity transition. 
               When showSplash is true, the entire DOM stays strictly hidden (opacity-0).
               Once showSplash finishes, it cascades opacity-1 over the children seamlessly. 
            */}
            <div className={`transition-opacity duration-1000 ease-in-out flex flex-col min-h-screen ${showSplash ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
                {children}
            </div>
        </>
    );
}
