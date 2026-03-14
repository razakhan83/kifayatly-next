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
            className="relative mb-4 w-full overflow-hidden border-b border-border bg-card md:mb-0"
        >
            <div
                ref={emblaRef}
                className="h-[54vh] min-h-[320px] w-full overflow-hidden bg-card md:h-[460px] lg:h-[560px]"
            >
                <div className="flex h-full">
                    {slides.map((slide, index) => (
                        <div key={index} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden bg-card transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
                            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-primary/18 via-transparent to-transparent"></div>

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
