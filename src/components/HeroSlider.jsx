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

    if (totalOriginalSlides === 0) return null;

    return (
        <section className="slider-container relative w-full h-[60vh] min-h-[300px] max-h-[600px] overflow-hidden bg-gray-100 mb-6">
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
                    <div key={`${slide.src}-${index}`} className="slide relative flex-[0_0_100%] w-full h-full block">
                        {slide.src && (
                            <Image
                                src={slide.src}
                                alt={slide.alt || `Slide ${index}`}
                                fill
                                priority={index === 0}
                                className="object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Slider Navigation Dots */}
            <div className="slider-nav absolute bottom-[20px] left-1/2 -translate-x-1/2 flex gap-[10px] z-10">
                {slides.map((_, index) => {
                    // If we are showing the clone (index === totalOriginal), active dot should be the first one (0)
                    const isActive = currentSlide === totalOriginalSlides ? index === 0 : currentSlide === index;
                    return (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-[12px] h-[12px] rounded-full cursor-pointer p-0 transition-all duration-300 border-2 ${isActive ? 'bg-white border-[#0A3D2E] scale-125' : 'bg-white/50 border-transparent hover:bg-white/80'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    );
                })}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="slider-arrow prev absolute top-1/2 -translate-y-1/2 left-[10px] bg-white/70 border-none w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#0A3D2E] text-xl cursor-pointer z-10 transition-all duration-300 shadow-md hover:bg-white hover:scale-110"
                aria-label="Previous Slide"
            >
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
                onClick={handleNext}
                className="slider-arrow next absolute top-1/2 -translate-y-1/2 right-[10px] bg-white/70 border-none w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#0A3D2E] text-xl cursor-pointer z-10 transition-all duration-300 shadow-md hover:bg-white hover:scale-110"
                aria-label="Next Slide"
            >
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </section>
    );
}
