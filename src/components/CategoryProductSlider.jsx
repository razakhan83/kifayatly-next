'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll }) {
    const { addToCart } = useCart();
    const scrollContainerRef = useRef(null);
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [itemWidth, setItemWidth] = useState(0);

    // Filter products for this category — supports both string and array Category
    const categoryProducts = products.filter(p => {
        const cats = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
        return cats.some(cat => {
            const pCat = (cat || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
            return pCat === categoryId;
        });
    });

    // Display products with duplication for a seamless loop effect
    const displayProducts = [...categoryProducts, ...categoryProducts, ...categoryProducts];
    const totalOriginal = categoryProducts.length;

    useEffect(() => {
        if (cardRef.current) {
            setItemWidth(cardRef.current.clientWidth + 16); // Include gap
        }
    }, [categoryProducts.length]);

    // Auto-scroll every 5 seconds with native scroll smooth
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || isHovered || totalOriginal === 0 || itemWidth === 0) return;

        const intervalId = setInterval(() => {
            const maxScroll = totalOriginal * itemWidth;
            container.scrollBy({ left: itemWidth, behavior: 'smooth' });

            // After smooth scroll finishes, reset silently if we crossed the boundary
            setTimeout(() => {
                if (container.scrollLeft >= maxScroll) {
                    container.scrollBy({ left: -maxScroll, behavior: 'auto' });
                }
            }, 600);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isHovered, totalOriginal, itemWidth]);

    const handlePrev = () => {
        const container = scrollContainerRef.current;
        if (!container || itemWidth === 0) return;
        
        if (container.scrollLeft <= 0) {
            container.scrollBy({ left: totalOriginal * itemWidth, behavior: 'auto' });
        }
        
        // Use timeout to ensure reflow
        setTimeout(() => {
            container.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        }, 10);
    };

    const handleNext = () => {
        const container = scrollContainerRef.current;
        if (!container || itemWidth === 0) return;
        
        const maxScroll = totalOriginal * itemWidth;
        container.scrollBy({ left: itemWidth, behavior: 'smooth' });
        
        setTimeout(() => {
            if (container.scrollLeft >= maxScroll) {
                container.scrollBy({ left: -maxScroll, behavior: 'auto' });
            }
        }, 600);
    };

    if (totalOriginal === 0) return null;

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    return (
        <div className="w-full mb-12">
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                    {categoryLabel}
                </h2>
                {onViewAll && (
                    <button
                        onClick={() => onViewAll(categoryId)}
                        className="text-[#10b981] font-semibold hover:text-[#0A3D2E] transition-colors flex items-center group"
                    >
                        View All
                        <i className="fa-solid fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                    </button>
                )}
            </div>

            <div
                className="relative group/slider overflow-hidden px-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
            >
                {/* Left Arrow */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover/slider:translate-x-0 focus:outline-none"
                    aria-label="Previous products"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Right Arrow */}
                <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/slider:translate-x-0 focus:outline-none"
                    aria-label="Next products"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>

                {/* Slider Track via Native Scroll */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 w-full overflow-x-auto snap-x snap-mandatory pb-4 pt-1 scroller-container hide-scrollbar"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {displayProducts.map((p, idx) => (
                        <div
                            key={`${p.slug || p._id || p.id || 'item'}-${idx}`}
                            ref={idx === 0 ? cardRef : null}
                            className="product-card scroller-item shrink-0 w-[42vw] md:w-[22vw] max-w-[280px] bg-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col group h-auto min-h-[380px]"
                        >
                            <Link href={`/products/${p.slug || p._id || p.id}`} className="block relative pt-[100%] bg-gray-50 cursor-pointer w-full overflow-hidden shrink-0">
                                {(p.Image || p.image) && (
                                    <Image
                                        src={p.Image || p.image}
                                        alt={p.Name || p.name || 'product'}
                                        fill
                                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        unoptimized
                                    />
                                )}
                            </Link>
                            <div className="product-info p-3 flex flex-col flex-grow justify-between gap-3 z-10">
                                <Link href={`/products/${p.slug || p._id || p.id}`} className="block cursor-pointer">
                                    <h3 className="product-title text-sm font-medium text-gray-800 mb-1 leading-[1.3] hover:text-[#10b981] transition-colors rounded line-clamp-2" title={p.Name || p.name}>
                                        {p.Name || p.name || 'Unknown'}
                                    </h3>
                                </Link>
                                <div>
                                    <p className="product-price text-lg font-extrabold text-[#1f2937] mb-3">
                                        {formatPrice(p.Price || p.price)}
                                    </p>
                                    <button
                                        onClick={() => addToCart(p)}
                                        className="btn btn-primary bg-[#0A3D2E] text-white w-full !flex justify-center items-center py-2.5 md:py-3 px-4 md:text-base rounded-lg font-semibold text-sm transition-colors hover:bg-[#10b981] shadow-sm cursor-pointer mt-auto opacity-100 visible block"
                                    >
                                        <i className="fa-solid fa-cart-plus mr-1.5 flex-shrink-0"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
