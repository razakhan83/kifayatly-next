'use client';

import { useCallback, useEffect, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { getCategoryColor } from '@/lib/categoryColors';
import { useRouter } from 'next/navigation';

// Icons for categories (FontAwesome)
const CATEGORY_ICONS = {
    'kitchen accessories': 'fa-spoon',
    'kitchen': 'fa-fire-burner',
    'knives': 'fa-utensils', // Fallback if fa-knife is pro only
    'pots': 'fa-bowl-food',
    'home decor': 'fa-couch',
    'health & beauty': 'fa-heart',
    'stationery': 'fa-pen',
    'toys & games': 'fa-gamepad',
    'electronics': 'fa-bolt',
    'fashion': 'fa-shirt',
    'sports & fitness': 'fa-dumbbell',
    'pet supplies': 'fa-paw',
    'automotive': 'fa-car',
};

function getCategoryIcon(name) {
    const key = (name || '').toLowerCase().trim();
    return CATEGORY_ICONS[key] || 'fa-tag';
}

export default function CategoryIconCarousel({ categories }) {
    const router = useRouter();

    // Duplicate categories for seamless infinite loop
    const displayCategories = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        // Triple the list for smooth infinite illusion
        return [...categories, ...categories, ...categories];
    }, [categories]);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            dragFree: true,
            containScroll: false,
            slidesToScroll: 1,
        },
        [AutoScroll({ speed: 0.8, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    if (!categories || categories.length === 0) return null;

    return (
        <div className="w-full bg-white py-4 md:py-6 border-b border-gray-100">
            <div className="container mx-auto max-w-7xl px-4">
                <div ref={emblaRef} className="overflow-hidden">
                    <div className="flex gap-4 md:gap-6">
                        {displayCategories.map((cat, idx) => {
                            const colors = getCategoryColor(cat.label);
                            const icon = getCategoryIcon(cat.label);
                            return (
                                <button
                                    key={`${cat.id}-${idx}`}
                                    onClick={() => router.push(`/products?category=${cat.id}`)}
                                    className="flex flex-col items-center gap-2 flex-[0_0_auto] min-w-[80px] md:min-w-[100px] group cursor-pointer"
                                >
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md will-change-transform`}>
                                        <i className={`fa-solid ${icon} ${colors.text} text-2xl md:text-3xl`}></i>
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-gray-600 text-center leading-tight line-clamp-2 max-w-[80px] md:max-w-[100px] group-hover:text-gray-900 transition-colors">
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
