'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroSlider({ slides = [] }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const trackRef = useRef(null);
    const totalOriginalSlides = slides.length;

    // Clone logic: we display the original array, plus a clone of the first slide at the end.
    const displaySlides = [...slides, slides[0]];

    useEffect(() => {
        if (totalOriginalSlides === 0) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentSlide, totalOriginalSlides]);

    const handleNext = () => {
        if (currentSlide === totalOriginalSlides) return; // Prevent clicking while waiting for transition end
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (currentSlide === 0) {
            // Instantly jump to the clone at the end, then animate back one step
            setIsTransitioning(false);
            setCurrentSlide(totalOriginalSlides);

            // Force reflow
            if (trackRef.current) {
                trackRef.current.getBoundingClientRect();
            }

            // Then animate normally to the previous slide
            setTimeout(() => {
                setIsTransitioning(true);
                setCurrentSlide(totalOriginalSlides - 1);
            }, 50); // slight delay to ensure reflow applies
        } else {
            setIsTransitioning(true);
            setCurrentSlide((prev) => prev - 1);
        }
    };

    const goToSlide = (index) => {
        setIsTransitioning(true);
        setCurrentSlide(index);
    };

    const handleTransitionEnd = () => {
        // If we've reached the duplicated first slide at the very end
        if (currentSlide === totalOriginalSlides) {
            // Instantly snap back to the REAL first slide
            setIsTransitioning(false);
            setCurrentSlide(0);
        }
    };

    // if (totalOriginalSlides === 0) return null; // Removed for debug

    return (
        <section 
            data-testid="hero-main-slider"
            className="hero-main-slider relative w-full h-[60vh] min-h-[300px] md:h-[400px] lg:h-[550px] mb-6 md:mb-0 overflow-hidden bg-white shadow-lg rounded-2xl md:rounded-3xl"
        >
            <div
                ref={trackRef}
                className="slider-track flex w-full h-full"
                style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                    transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {displaySlides.map((slide, index) => (
                    <div key={index} className="slide relative flex-[0_0_100%] w-full h-full block overflow-hidden bg-white">
                        {/* Shadow Overlay for Premium Look */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1] pointer-events-none"></div>
                        {slide?.mobileSrc && (
                            <div className="relative w-full h-full md:hidden">
                                <Image
                                    src={slide.mobileSrc}
                                    alt={slide.alt || `Mobile Slide ${index}`}
                                    fill
                                    sizes="100vw"
                                    priority={index === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                        {slide?.pcSrc && (
                            <div className="relative w-full h-full hidden md:block">
                                <Image
                                    src={slide.pcSrc}
                                    alt={slide.alt || `PC Slide ${index}`}
                                    fill
                                    sizes="100vw"
                                    priority={index === 0}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Slider Navigation Dots - Glassmorphism */}
            <div className="slider-nav absolute bottom-[30px] left-1/2 -translate-x-1/2 flex gap-[12px] z-10 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                {slides.map((_, index) => {
                    const isActive = currentSlide === totalOriginalSlides ? index === 0 : currentSlide === index;
                    return (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-[10px] h-[10px] rounded-full cursor-pointer p-0 transition-all duration-300 ${isActive ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/40 hover:bg-white/60'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    );
                })}
            </div>

            {/* Navigation Arrows - Glassmorphism */}
            <button
                onClick={handlePrev}
                className="slider-arrow prev absolute top-1/2 -translate-y-1/2 left-[20px] bg-white/20 backdrop-blur-lg border border-white/30 w-[45px] h-[45px] rounded-full flex items-center justify-center text-white text-xl cursor-pointer z-10 transition-all duration-300 shadow-xl hover:bg-white/40 hover:scale-110 active:scale-95"
                aria-label="Previous Slide"
            >
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
                onClick={handleNext}
                className="slider-arrow next absolute top-1/2 -translate-y-1/2 right-[20px] bg-white/20 backdrop-blur-lg border border-white/30 w-[45px] h-[45px] rounded-full flex items-center justify-center text-white text-xl cursor-pointer z-10 transition-all duration-300 shadow-xl hover:bg-white/40 hover:scale-110 active:scale-95"
                aria-label="Next Slide"
            >
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </section>
    );
}
