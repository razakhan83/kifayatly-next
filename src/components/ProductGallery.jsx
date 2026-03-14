'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

export default function ProductGallery({ images }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaMainRef, emblaMainApi] = useEmblaCarousel({ loop: true });
    // Make thumbnails easy to interact with
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
        align: 'start'
    });

    const onThumbClick = useCallback(
        (index) => {
            if (!emblaMainApi || !emblaThumbsApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi, emblaThumbsApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return;
        setSelectedIndex(emblaMainApi.selectedScrollSnap());
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaMainApi) return;
        onSelect();
        emblaMainApi.on('select', onSelect);
        emblaMainApi.on('reInit', onSelect);
    }, [emblaMainApi, onSelect]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center text-gray-300">
                <i className="fa-solid fa-image text-8xl"></i>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Main Carousel */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" ref={emblaMainRef}>
                <div className="flex h-full touch-pan-y">
                    {images.map((img, index) => (
                        <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                            <Image
                                src={img}
                                alt={`Product Image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105"
                                unoptimized
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="overflow-hidden" ref={emblaThumbsRef}>
                    <div className="flex gap-2">
                        {images.map((img, index) => (
                            <div
                                key={index}
                                onClick={() => onThumbClick(index)}
                                className={`relative aspect-square flex-[0_0_23.5%] min-w-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ease-out ${
                                    index === selectedIndex ? 'border-emerald-600 shadow-sm opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.02]'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gray-100"></div>
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
