'use client';

import { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductSkeleton from '@/components/ProductSkeleton';

function ProductGridContent({ initialProducts, forceSearchTerm, hideSearch }) {
    const searchParams = useSearchParams();
    const { activeCategory, setActiveCategory, addToCart } = useCart();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(forceSearchTerm || searchParams?.get('search') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [fadeState, setFadeState] = useState('opacity-100');
    const itemsPerPage = 24;
    const categoryNavRef = useRef(null);
    const loadMoreRef = useRef(null);

    // 1. First Pass: Filter strictly by Search Term to compute available categories
    const searchFilteredProducts = useMemo(() => {
        let base = [...initialProducts];
        if (!searchTerm.trim()) return base;

        return base.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase();
            const rawCat = (p.Category || p.category || '').toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term) || rawCat.includes(term);
        });
    }, [initialProducts, searchTerm]);

    // 2. Compute dynamic categories EXCLUSIVELY from the search-filtered results
    const dynamicCategories = useMemo(() => {
        const cats = new Map();
        searchFilteredProducts.forEach(p => {
            const cat = (p.Category || p.category || '').trim();
            if (cat && !cats.has(cat.toLowerCase())) {
                cats.set(cat.toLowerCase(), cat);
            }
        });
        return Array.from(cats.values()).sort().map(cat => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
        }));
    }, [searchFilteredProducts]);

    // 3. Second Pass: Apply Category filters and sorting
    const filteredProducts = useMemo(() => {
        let base = [...searchFilteredProducts];

        if (activeCategory === 'new-arrivals') {
            base.sort((a, b) => {
                const dateA = new Date(a.created_at || a['created_at'] || 0).getTime();
                const dateB = new Date(b.created_at || b['created_at'] || 0).getTime();
                return dateB - dateA;
            });
            base = base.slice(0, 30);
            return base;
        }

        if (activeCategory !== 'all') {
            base = base.filter(p => {
                const rawCat = (p.Category || p.category || '').trim();
                const pCat = rawCat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
                return pCat === activeCategory;
            });
        }

        return base;
    }, [searchFilteredProducts, activeCategory]);

    const displayedProducts = filteredProducts.slice(0, currentPage * itemsPerPage);
    const hasMore = displayedProducts.length < filteredProducts.length;

    // Intersection Observer for Infinite Scroll
    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: "200px",
            threshold: 0
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        
        return () => {
            if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
        };
    }, [handleObserver, loadMoreRef]);

    const scrollToProducts = () => {
        const section = document.querySelector('.category-nav-container');
        const header = document.querySelector('.sticky-header-wrapper');
        const headerHeight = header ? header.offsetHeight : 0;
        if (section) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: sectionTop - headerHeight - 10, behavior: 'smooth' });
        }
    };

    const setCategoryAndScroll = (catId) => {
        setFadeState('opacity-0');
        setTimeout(() => {
            setActiveCategory(catId);
            setCurrentPage(1); // Reset page on filter
            setFadeState('opacity-100');
            setTimeout(scrollToProducts, 50);
        }, 150);
    };

    // Simulate premium loading state on category or search change
    useEffect(() => {
        setIsLoading(true);
        setCurrentPage(1); // Reset to page 1 on new search
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [activeCategory, searchTerm]);

    // Handle incoming URL search params or forcefully imposed search param changes
    useEffect(() => {
        if (forceSearchTerm !== undefined) {
             setSearchTerm(forceSearchTerm);
        } else {
             const queryTerm = searchParams?.get('search');
             if (queryTerm) {
                 setSearchTerm(queryTerm);
             }
        }
    }, [searchParams, forceSearchTerm]);

    // Auto-scroll the pills container
    useEffect(() => {
        if (categoryNavRef.current) {
            const activePill = categoryNavRef.current.querySelector('.category-btn.bg-\\[\\#10b981\\]');
            if (activePill) {
                const containerLeft = categoryNavRef.current.scrollLeft;
                const containerWidth = categoryNavRef.current.clientWidth;
                const pillLeft = activePill.offsetLeft;
                const pillWidth = activePill.clientWidth;

                categoryNavRef.current.scrollTo({
                    left: pillLeft - (containerWidth / 2) + (pillWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [activeCategory]);

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    return (
        <>
            <div className="category-nav-container transition-all duration-300 opacity-100">
                <div
                    ref={categoryNavRef}
                    className="container mx-auto px-4 max-w-7xl category-nav-inner flex gap-2 overflow-x-auto pt-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <button
                        className={`category-btn px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 ${activeCategory === 'all' ? 'bg-[#10b981] text-white border-[#10b981] shadow-sm' : 'bg-white text-black border-gray-200 hover:bg-[#10b981]/5 hover:text-[#10b981]'}`}
                        onClick={() => setCategoryAndScroll('all')}
                    >
                        All Items
                    </button>
                    <button
                        className={`category-btn px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 ${activeCategory === 'new-arrivals' ? 'bg-[#10b981] text-white border-[#10b981] shadow-sm' : 'bg-white text-black border-gray-200 hover:bg-[#10b981]/5 hover:text-[#10b981]'}`}
                        onClick={() => setCategoryAndScroll('new-arrivals')}
                    >
                        New Arrivals
                    </button>

                    {dynamicCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 ${activeCategory === cat.id ? 'bg-[#10b981] text-white border-[#10b981] shadow-sm' : 'bg-white text-black border-gray-200 hover:bg-[#10b981]/5 hover:text-[#10b981]'}`}
                            onClick={() => setCategoryAndScroll(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {!hideSearch && (
                <div className="container mx-auto max-w-[600px] px-4 pt-6 mb-4">
                    <div className="search-container relative flex items-center w-full">
                        <i className="fa-solid fa-magnifying-glass search-icon absolute left-4 text-[#0A3D2E] text-[1.1rem]"></i>
                        <input
                            id="product-search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input w-full py-3 px-4 pl-12 border-2 border-[#145e46] rounded-full text-base outline-none transition-all shadow-sm focus:border-[#0A3D2E] focus:ring-4 focus:ring-[#0A3D2E]/20"
                            placeholder="Search for premium products..."
                        />
                    </div>
                </div>
            )}

            <section id="products-section" className="section py-3 flex-grow w-full overflow-hidden">
                <div className="container mx-auto px-2 max-w-7xl">
                    <div className={`transition-opacity duration-300 ${fadeState}`}>
                        <div
                            className="products-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 min-h-[400px]"
                        >
                            {isLoading ? (
                                Array(12).fill(0).map((_, idx) => (
                                    <div key={`grid-skeleton-${idx}`} className="h-[320px]">
                                        <ProductSkeleton />
                                    </div>
                                ))
                            ) : displayedProducts.length === 0 ? (
                                <p className="col-span-full text-center text-gray-500 py-4 w-full">No products found matching your criteria.</p>
                            ) : (
                                displayedProducts.map((p, idx) => (
                                    <div key={p._id || p.id || p.slug || `${p.Name || p.name}-${idx}`} className="product-card bg-white/70 backdrop-blur-md rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-white/40 transition-transform hover:-translate-y-1 hover:shadow-xl flex flex-col group h-auto min-h-[380px] h-full">
                                        <Link href={`/products/${p._id || p.id || p.slug}`} className="block relative pt-[100%] bg-gray-50 cursor-pointer w-full overflow-hidden">
                                            {(p.Image || p.image) && (
                                                <Image
                                                    src={p.Image || p.image}
                                                    alt={p.Name || p.name || 'product'}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    unoptimized
                                                />
                                            )}
                                        </Link>
                                        <div className="product-info p-3 flex flex-col flex-grow justify-between gap-3">
                                            <Link href={`/products/${p._id || p.id || p.slug}`} className="block cursor-pointer">
                                                <h3 className="product-title text-sm font-medium text-gray-800 mb-1 leading-[1.3] hover:text-[#10b981] transition-colors rounded" title={p.Name || p.name}>
                                                    {p.Name || p.name || 'Unknown'}
                                                </h3>
                                            </Link>
                                            <p className="product-price text-lg font-extrabold text-[#1f2937]">
                                                {formatPrice(p.Price || p.price)}
                                            </p>
                                            <button
                                                onClick={() => handleAddToCart(p)}
                                                className="btn btn-primary bg-[#0A3D2E] text-white w-full !flex justify-center items-center py-2.5 md:py-3 px-4 md:px-6 md:text-base rounded-lg font-semibold text-sm transition-colors hover:bg-[#10b981] md:hover:bg-emerald-700 shadow-sm mt-auto opacity-100 visible h-[44px] md:h-[48px] shrink-0"
                                            >
                                                <i className="fa-solid fa-cart-plus mr-1.5 md:mr-2 flex-shrink-0"></i> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Infinite Scroll Detection Target */}
                    {!isLoading && hasMore && (
                        <div ref={loadMoreRef} className="flex justify-center mt-10 mb-6 w-full h-10 border-t border-transparent">
                            <i className="fa-solid fa-circle-notch fa-spin text-[#0A3D2E] text-2xl"></i>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default function ProductGridClient({ initialProducts, forceSearchTerm, hideSearch }) {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-7xl py-12 text-center">Loading products...</div>}>
            <ProductGridContent initialProducts={initialProducts} forceSearchTerm={forceSearchTerm} hideSearch={hideSearch} />
        </Suspense>
    );
}
