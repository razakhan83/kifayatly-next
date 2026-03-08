'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CategoryProductSlider({ categoryId, categoryLabel, products, onViewAll }) {
    const { addToCart } = useCart();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const scrollContainerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Filter products for this category
    const categoryProducts = products.filter(p => {
        const rawCat = (p.Category || p.category || '').trim();
        const pCat = rawCat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
        return pCat === categoryId;
    });

    // Smooth auto-scroll: +1px every 30ms, resets at end
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || isHovered || categoryProducts.length <= 4) return;

        const intervalId = setInterval(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            if (maxScroll <= 0) return;

            if (container.scrollLeft >= maxScroll - 2) {
                container.scrollLeft = 0;
            } else {
                container.scrollLeft += 1;
            }
        }, 30);

        return () => clearInterval(intervalId);
    }, [isHovered, categoryProducts.length]);

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            const itemWidth = scrollContainerRef.current.querySelector('.product-card')?.clientWidth || 250;
            scrollContainerRef.current.scrollBy({ left: -(itemWidth + 16), behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            const itemWidth = scrollContainerRef.current.querySelector('.product-card')?.clientWidth || 250;
            scrollContainerRef.current.scrollBy({ left: itemWidth + 16, behavior: 'smooth' });
        }
    };

    if (categoryProducts.length === 0) return null;

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
                className="relative group/slider"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
            >
                {/* Left Arrow */}
                <button
                    onClick={handleScrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 md:-ml-4 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform group-hover/slider:translate-x-2 focus:outline-none"
                    aria-label="Previous products"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>

                {/* Right Arrow */}
                <button
                    onClick={handleScrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 md:-mr-4 z-10 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all duration-300 transform group-hover/slider:-translate-x-2 focus:outline-none"
                    aria-label="Next products"
                >
                    <i className="fa-solid fa-chevron-right"></i>
                </button>

                {/* Slider Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto pb-4 px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {categoryProducts.map((p, idx) => (
                        <div
                            key={`slider-${p.slug || p.Name || p.name}-${idx}`}
                            className="product-card shrink-0 w-[42vw] md:w-[22vw] max-w-[280px] bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col group h-full"
                        >
                            <Link href={`/products/${p.slug || p._id || p.id}`} className="block relative pt-[100%] bg-gray-50 cursor-pointer w-full overflow-hidden">
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
                            <div className="product-info p-3 flex flex-col flex-grow justify-between gap-3">
                                <Link href={`/products/${p.slug || p._id || p.id}`} className="block cursor-pointer">
                                    <h3 className="product-title text-sm font-medium text-gray-800 mb-1 leading-[1.3] hover:text-[#10b981] transition-colors rounded" title={p.Name || p.name}>
                                        {p.Name || p.name || 'Unknown'}
                                    </h3>
                                </Link>
                                <p className="product-price text-lg font-extrabold text-[#1f2937]">
                                    {formatPrice(p.Price || p.price)}
                                </p>
                                <button
                                    onClick={() => addToCart(p)}
                                    className="btn btn-primary bg-[#0A3D2E] text-white w-full flex justify-center items-center py-2.5 md:py-3 px-4 md:px-6 md:text-base rounded-lg font-semibold text-sm transition-colors hover:bg-[#10b981] md:hover:bg-emerald-700 shadow-sm mt-auto"
                                >
                                    <i className="fa-solid fa-cart-plus mr-1.5 md:mr-2 flex-shrink-0"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
