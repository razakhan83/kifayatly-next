'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, isVisible, onClose, type = 'success' }) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const isSuccess = type === 'success';

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed md:bottom-10 md:right-10 md:top-auto md:left-auto top-4 left-1/2 -translate-x-1/2 md:translate-x-0 z-[100] w-[90%] md:w-80 pointer-events-none transition-all duration-500">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20, transition: { duration: 0.2 } }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 25 
                        }}
                        className={`
                            pointer-events-auto
                            flex items-center gap-4 p-4 rounded-2xl border
                            backdrop-blur-xl shadow-2xl
                            ${isSuccess 
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-950 shadow-emerald-500/10' 
                                : 'bg-red-500/15 border-red-500/30 text-red-950 shadow-red-500/10'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                            ${isSuccess ? 'bg-emerald-500/20' : 'bg-red-500/20'}
                        `}>
                            <i className={`fa-solid ${isSuccess ? 'fa-check' : 'fa-trash-can'} ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold tracking-tight">
                                {isSuccess ? 'Success' : 'Notification'}
                            </h4>
                            <p className="text-xs opacity-90 font-medium mt-0.5">
                                {message?.title || message}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-sm opacity-50"></i>
                        </button>

                        <motion.div 
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 3, ease: "linear" }}
                            style={{ originX: 0 }}
                            className={`
                                absolute bottom-0 left-0 right-0 h-1 rounded-full
                                ${isSuccess ? 'bg-emerald-500/40' : 'bg-red-500/40'}
                            `}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
