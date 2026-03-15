'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

export default function HeroSlider({ slides = [] }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Auto-advance every 5 seconds
    useEffect(() => {
        if (!slides || slides.length <= 1) return;
        const interval = setInterval(() => {
            setSelectedIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides]);

    const scrollTo = useCallback((index) => {
        setSelectedIndex(index);
    }, []);

    if (!slides || slides.length === 0) return null;

    return (
        <section
            data-testid="hero-main-slider"
            className="relative mb-4 w-full overflow-hidden border-b border-border bg-card md:mb-0"
        >
            <div className="relative h-[54vh] min-h-[320px] w-full overflow-hidden bg-card md:h-[460px] lg:h-[560px]">
                {/* All slides stacked, only active one is visible via AnimatePresence */}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                        className="absolute inset-0"
                    >
                        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-primary/18 via-transparent to-transparent"></div>

                        {slides[selectedIndex]?.mobileSrc && (
                            <div className="relative w-full h-full md:hidden">
                                <Image
                                    src={slides[selectedIndex].mobileSrc}
                                    alt={slides[selectedIndex].alt || `Slide ${selectedIndex + 1}`}
                                    fill
                                    sizes="100vw"
                                    priority={selectedIndex === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        {slides[selectedIndex]?.pcSrc && (
                            <div className="relative w-full h-full hidden md:block">
                                <Image
                                    src={slides[selectedIndex].pcSrc}
                                    alt={slides[selectedIndex].alt || `Slide ${selectedIndex + 1}`}
                                    fill
                                    sizes="100vw"
                                    priority={selectedIndex === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2.5 w-7 rounded-md transition-all duration-300 ${
                            selectedIndex === index
                                ? 'bg-white shadow-[0_0_14px_rgba(255,255,255,0.75)]'
                                : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
