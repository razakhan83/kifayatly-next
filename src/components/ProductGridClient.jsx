'use client';

import { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import ProductSkeleton from '@/components/ProductSkeleton';
import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function ProductGridContent({ initialProducts, forceSearchTerm, hideSearch }) {
    const searchParams = useSearchParams();
    const { activeCategory, setActiveCategory } = useCart();
    const [searchTerm, setSearchTerm] = useState(forceSearchTerm || searchParams?.get('search') || '');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [fadeState, setFadeState] = useState('opacity-100');
    const [initialLoad, setInitialLoad] = useState(true);
    const itemsPerPage = 12;

    const loadMoreRef = useRef(null);
    const categoryNavRef = useRef(null);

    // Only show skeleton on very first render
    useEffect(() => {
        const timer = setTimeout(() => setInitialLoad(false), 100);
        return () => clearTimeout(timer);
    }, []);

    // 1. First Pass: Filter strictly by Search Term to compute available categories
    const searchFilteredProducts = useMemo(() => {
        let base = [...initialProducts];
        if (!searchTerm.trim()) return base;

        return base.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase();
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : []));
            const term = searchTerm.toLowerCase();
            return name.includes(term) || categories.some(c => c.toLowerCase().includes(term));
        });
    }, [initialProducts, searchTerm]);

    // 2. Compute dynamic categories EXCLUSIVELY from the search-filtered results
    const dynamicCategories = useMemo(() => {
        const cats = new Map();
        searchFilteredProducts.forEach(p => {
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : []));
            categories.forEach(cat => {
                const trimmed = (cat || '').trim();
                if (trimmed && !cats.has(trimmed.toLowerCase())) {
                    cats.set(trimmed.toLowerCase(), trimmed);
                }
            });
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
                const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : []));
                return categories.some(cat => {
                    const pCat = cat.trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
                    return pCat === activeCategory;
                });
            });
        }

        // Apply Sorting
        if (sortBy === 'price-low') {
            base.sort((a, b) => (a.Price || a.price || 0) - (b.Price || b.price || 0));
        } else if (sortBy === 'price-high') {
            base.sort((a, b) => (b.Price || b.price || 0) - (a.Price || a.price || 0));
        } else if (sortBy === 'az') {
            base.sort((a, b) => (a.Name || a.name || '').localeCompare(b.Name || b.name || ''));
        } else if (sortBy === 'za') {
            base.sort((a, b) => (b.Name || b.name || '').localeCompare(a.Name || a.name || ''));
        } else if (sortBy === 'newest') {
            base.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        return base;
    }, [searchFilteredProducts, activeCategory, sortBy]);

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
        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);
        
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [handleObserver]);

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
            setCurrentPage(1);
            setFadeState('opacity-100');
            setTimeout(scrollToProducts, 50);
        }, 150);
    };

    // Reset page on category or search change
    useEffect(() => {
        setCurrentPage(1);
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

    // Handle category URL parameters
    useEffect(() => {
        const catQuery = searchParams?.get('category');
        if (catQuery && catQuery !== activeCategory) {
            setActiveCategory(catQuery);
            setCurrentPage(1);
        }
    }, [searchParams, activeCategory, setActiveCategory]);

    // Auto-scroll the pills container
    useEffect(() => {
        if (categoryNavRef.current) {
            const activePill = categoryNavRef.current.querySelector('.cat-pill-active');
            if (activePill) {
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

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price-low', label: 'Price: Low → High' },
        { value: 'price-high', label: 'Price: High → Low' },
        { value: 'az', label: 'Name: A → Z' },
        { value: 'za', label: 'Name: Z → A' },
    ];

    return (
        <>
            {/* Category Pills */}
            <div className="category-nav-container transition-all duration-300 opacity-100">
                <div
                    ref={categoryNavRef}
                    className="container mx-auto px-4 max-w-7xl category-nav-inner flex gap-2 overflow-x-auto pt-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <button
                        className={`cat-pill px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 will-change-transform ${activeCategory === 'all' ? 'cat-pill-active bg-[#10b981] text-white border-[#10b981] shadow-sm scale-[1.02]' : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                        onClick={() => setCategoryAndScroll('all')}
                    >
                        All Items
                    </button>
                    <button
                        className={`cat-pill px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 will-change-transform ${activeCategory === 'new-arrivals' ? 'cat-pill-active bg-[#10b981] text-white border-[#10b981] shadow-sm scale-[1.02]' : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                        onClick={() => setCategoryAndScroll('new-arrivals')}
                    >
                        ✨ New Arrivals
                    </button>

                    {dynamicCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={`cat-pill px-3.5 py-1.5 rounded-full text-[0.85rem] font-semibold border transition-all whitespace-nowrap shrink-0 will-change-transform ${activeCategory === cat.id ? 'cat-pill-active bg-[#10b981] text-white border-[#10b981] shadow-sm scale-[1.02]' : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'}`}
                            onClick={() => setCategoryAndScroll(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search + Sort Bar */}
            {!hideSearch && (
                <div className="container mx-auto px-4 max-w-7xl pt-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm">
                        {/* Search Input */}
                        <div className="relative flex items-center w-full flex-1 sm:max-w-2xl">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 text-gray-400 text-[1rem] z-10"></i>
                            <Input
                                id="product-search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-10 h-10 rounded-full text-base transition-colors"
                                placeholder="Search products..."
                            />
                            {searchTerm && (
                                <button 
                                    type="button" 
                                    onClick={() => setSearchTerm('')} 
                                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors" 
                                    aria-label="Clear Search"
                                >
                                    <i className="fa-solid fa-circle-xmark text-base"></i>
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown — shadcn Select */}
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Sort:</span>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                                    <i className="fa-solid fa-arrow-down-wide-short text-gray-400 mr-1.5 text-[11px]" />
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}

            <section id="products-section" className="section py-3 flex-grow w-full overflow-hidden">
                <div className="container mx-auto px-2 max-w-7xl">
                    {/* Results count */}
                    {!initialLoad && (
                        <div className="flex items-center justify-between px-2 mb-3">
                            <p className="text-xs text-gray-500">
                                Showing <span className="font-bold text-gray-800">{displayedProducts.length}</span> of{' '}
                                <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
                            </p>
                            {searchTerm && (
                                <Badge variant="emerald" className="text-[10px]">
                                    <i className="fa-solid fa-magnifying-glass mr-1 text-[9px]" />
                                    &quot;{searchTerm}&quot;
                                </Badge>
                            )}
                        </div>
                    )}

                    <div className={`transition-opacity duration-300 ${fadeState}`}>
                        <div
                            className="products-grid grid auto-rows-max grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5"
                        >
                            {initialLoad ? (
                                Array(12).fill(0).map((_, idx) => (
                                    <div key={`grid-skeleton-${idx}`}>
                                        <ProductSkeleton />
                                    </div>
                                ))
                            ) : displayedProducts.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-box-open text-3xl text-gray-300"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-1">No products found</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Try adjusting your search or filter to find what you&apos;re looking for.
                                    </p>
                                </div>
                            ) : (
                                displayedProducts.map((p, idx) => (
                                    <ProductCard
                                        key={`${p.slug || p._id || p.id || 'product'}-${idx}`}
                                        product={p}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Load More + Results Count */}
                    {!initialLoad && displayedProducts.length > 0 && (
                        <div className="flex flex-col items-center gap-3 mt-8 mb-6">
                            <p className="text-xs text-gray-400">
                                {displayedProducts.length} of {filteredProducts.length} products loaded
                            </p>
                            {hasMore && (
                                <Button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="rounded-full px-8 cursor-pointer"
                                >
                                    Load More Products
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Infinite Scroll Detection Target */}
                    {!initialLoad && hasMore && (
                        <div ref={loadMoreRef} className="h-10 w-full border-t border-transparent" />
                    )}
                </div>
            </section>
        </>
    );
}

export default function ProductGridClient({ initialProducts, forceSearchTerm, hideSearch }) {
    return (
        <Suspense fallback={
            <div className="container mx-auto max-w-7xl px-2 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                    {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            </div>
        }>
            <ProductGridContent initialProducts={initialProducts} forceSearchTerm={forceSearchTerm} hideSearch={hideSearch} />
        </Suspense>
    );
}
