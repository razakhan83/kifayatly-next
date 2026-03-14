'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '@/components/ProductCard';
import { getCategoryColor } from '@/lib/categoryColors';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll }) {
    // Filter products for this category
    const categoryProducts = products.filter(p => {
        const cats = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
        return cats.some(cat => {
            const pCat = (cat || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
            return pCat === categoryId;
        });
    });

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps',
        dragFree: false,
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        onSelect();
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (categoryProducts.length === 0) return null;

    const colors = getCategoryColor(categoryLabel);

    return (
        <div className="w-full mb-4">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className={`text-2xl md:text-3xl font-bold ${colors.text} tracking-tight`}>
                    {categoryLabel}
                </h2>
                {onViewAll && (
                    <Button
                        variant="ghost"
                        onClick={() => onViewAll(categoryId)}
                        className={`${colors.text} font-semibold hover:opacity-80 text-sm cursor-pointer`}
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            <div className="relative group/slider">
                {/* Left Arrow */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover/slider:translate-x-0 focus:outline-none will-change-transform"
                    aria-label="Previous products"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={scrollNext}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/slider:translate-x-0 focus:outline-none will-change-transform"
                    aria-label="Next products"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Embla Slider */}
                <div ref={emblaRef} className="overflow-hidden px-2">
                    <div className="flex gap-4 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        {categoryProducts.map((p, idx) => (
                            <div
                                key={`${p.slug || p._id || p.id || 'item'}-${idx}`}
                                className="flex-[0_0_42vw] md:flex-[0_0_22vw] max-w-[280px] min-w-0"
                            >
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
