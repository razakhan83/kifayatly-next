'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function HeroSlider({ slides = [] }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, skipSnaps: false },
        [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        onSelect();
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = useCallback((index) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    if (!slides || slides.length === 0) return null;

    return (
        <section
            data-testid="hero-main-slider"
            className="hero-main-slider relative w-full h-[60vh] min-h-[300px] md:h-[400px] lg:h-[550px] mb-6 md:mb-0 overflow-hidden bg-white shadow-lg"
        >
            <div ref={emblaRef} className="w-full h-full overflow-hidden">
                <div className="flex h-full">
                    {slides.map((slide, index) => (
                        <div key={index} className="relative flex-[0_0_100%] min-w-0 h-full bg-white overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                            {/* No Shadow Overlay for brighter look */}
                            <div className="absolute inset-0 bg-transparent z-[1] pointer-events-none"></div>

                            {/* Mobile Image */}
                            {slide?.mobileSrc && (
                                <div className="relative w-full h-full md:hidden">
                                    <Image
                                        src={slide.mobileSrc}
                                        alt={slide.alt || `Slide ${index + 1}`}
                                        fill
                                        sizes="100vw"
                                        priority={index === 0}
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            {/* Desktop Image */}
                            {slide?.pcSrc && (
                                <div className="relative w-full h-full hidden md:block">
                                    <Image
                                        src={slide.pcSrc}
                                        alt={slide.alt || `Slide ${index + 1}`}
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
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            selectedIndex === index
                                ? 'bg-white scale-130 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                                : 'bg-white/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
