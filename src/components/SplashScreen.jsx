'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
    useEffect(() => {
        // Automatically dismiss the splash screen exactly after 2 seconds
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            <motion.div
                key="splash-screen"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A3D2E]"
            >
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        duration: 1.5
                    }}
                    className="flex flex-col items-center gap-4"
                >
                    <i className="fa-solid fa-store text-6xl text-[#10b981] mb-2 drop-shadow-xl"></i>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest text-center">
                        CHINA <span className="text-[#10b981]">UNIQUE</span>
                        <span className="block text-2xl md:text-3xl tracking-normal font-medium text-gray-300 mt-2">
                            ITEMS
                        </span>
                    </h1>
                </motion.div>

                {/* Optional pulse loading ring around bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-20 flex items-center gap-3 text-white/70 text-sm font-semibold tracking-widest uppercase"
                >
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
