'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll, skipFilter = false }) {
    const categoryProducts = skipFilter ? products : products.filter(p => {
        const cats = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
        return cats.some(cat => {
            const pCat = (cat || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
            return pCat === categoryId;
        });
    });

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
            containScroll: 'trimSnaps',
            dragFree: false,
        },
        [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
    );

    // Bounce key increments each time Embla settles after a slide,
    // triggering a spring overshoot animation on visible cards.
    const [bounceKey, setBounceKey] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        const onSettle = () => setBounceKey(k => k + 1);
        emblaApi.on('settle', onSettle);
        return () => {
            emblaApi.off('settle', onSettle);
        };
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (categoryProducts.length === 0) return null;

    return (
        <div className="mx-auto mb-4 w-full">
            <div className="mb-6 flex items-center justify-between px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                    {categoryLabel}
                </h2>
                {onViewAll && (
                    <Button
                        variant="ghost"
                        onClick={() => onViewAll(categoryId)}
                        className="bg-primary/10 text-primary font-semibold hover:bg-primary/18 hover:text-primary text-sm cursor-pointer"
                    >
                        View All
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            <div className="group/slider relative mx-auto w-full px-4">
                <button
                    onClick={scrollPrev}
                    className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground opacity-0 transition-all duration-300 group-hover/slider:translate-x-0 group-hover/slider:opacity-100 will-change-transform"
                    aria-label="Previous products"
                >
                    <ChevronLeft className="size-5" />
                </button>

                <button
                    onClick={scrollNext}
                    className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-card/95 text-foreground opacity-0 transition-all duration-300 group-hover/slider:translate-x-0 group-hover/slider:opacity-100 will-change-transform"
                    aria-label="Next products"
                >
                    <ChevronRight className="size-5" />
                </button>

                <div ref={emblaRef} className="overflow-hidden -my-4">
                    <div className="flex gap-4 py-4">
                        {categoryProducts.map((p, idx) => (
                            <motion.div
                                key={`${p.slug || p._id || p.id || 'item'}-${idx}`}
                                initial={false}
                                animate={{ x: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 20,
                                    mass: 1,
                                }}
                                style={{ x: bounceKey > 0 ? -5 : 0 }}
                                className="min-w-0 flex-[0_0_100%] md:flex-[0_0_22vw] md:max-w-[280px] will-change-transform"
                            >
                                <ProductCard product={p} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
