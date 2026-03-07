'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductSkeleton from '@/components/ProductSkeleton';
import CategoryProductSlider from '@/components/CategoryProductSlider';

function ProductGridContent({ initialProducts }) {
    const { activeCategory, setActiveCategory, addToCart } = useCart();
    // Default view based on category. If 'all', default to categories. Otherwise, products grid.
    const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'products'
    const [isLoading, setIsLoading] = useState(true); // Premium loading state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [fadeState, setFadeState] = useState('opacity-100');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const itemsPerPage = 24;
    const categoryNavRef = useRef(null);

    // Extract precise dynamic categories natively from CSV data
    const dynamicCategories = useMemo(() => {
        const cats = new Set();
        initialProducts.forEach(p => {
            const cat = (p.Category || p.category || '').trim();
            if (cat) cats.add(cat);
        });
        return Array.from(cats).sort().map(cat => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
        }));
    }, [initialProducts]);

    const filteredProducts = useMemo(() => {
        let base = [...initialProducts];

        // "New Arrivals" sorting mock
        if (activeCategory === 'new-arrivals') {
            base.sort((a, b) => {
                const dateA = new Date(a.created_at || a['created_at'] || 0).getTime();
                const dateB = new Date(b.created_at || b['created_at'] || 0).getTime();
                return dateB - dateA;
            });
            base = base.slice(0, 30);
        }

        return base.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase();
            const rawCat = (p.Category || p.category || '').trim();
            const pCat = rawCat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

            const searchMatch = name.includes(searchTerm.toLowerCase()) || rawCat.toLowerCase().includes(searchTerm.toLowerCase());

            let catMatch = true;
            if (activeCategory !== 'all' && activeCategory !== 'new-arrivals') {
                catMatch = pCat === activeCategory;
            }
            return searchMatch && catMatch;
        });
    }, [initialProducts, activeCategory, searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const displayedProducts = filteredProducts.slice(0, currentPage * itemsPerPage);
    const hasMore = displayedProducts.length < filteredProducts.length;

    const handleLoadMore = () => setCurrentPage(prev => prev + 1);

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
        // Trigger fade out
        setFadeState('opacity-0');

        setTimeout(() => {
            setActiveCategory(catId);
            setCurrentPage(1); // Reset page on filter

            if (catId !== 'all') {
                setViewMode('products');
            }

            // Trigger fade in
            setFadeState('opacity-100');
            setTimeout(scrollToProducts, 50);
        }, 150); // Small delay to let fade out happen
    };

    // Simulate network delay for premium skeleton UX on first load and view switches
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600); // 600ms premium pause
        return () => clearTimeout(timer);
    }, [activeCategory, viewMode, searchTerm]);

    // Auto-scroll the pills container so the active pill is visible and sync pagination
    useEffect(() => {
        setCurrentPage(1); // Ensure pagination resets when tracking external Category changes

        if (categoryNavRef.current) {
            const activePill = categoryNavRef.current.querySelector('.category-btn.bg-\\[\\#10b981\\]');
            if (activePill) {
                // Scroll container to the active pill
                const containerLeft = categoryNavRef.current.scrollLeft;
                const containerWidth = categoryNavRef.current.clientWidth;
                const pillLeft = activePill.offsetLeft;
                const pillWidth = activePill.clientWidth;

                // Center the pill in the container
                categoryNavRef.current.scrollTo({
                    left: pillLeft - (containerWidth / 2) + (pillWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [activeCategory]);

    // --- Add to Cart Interaction ---
    const handleAddToCart = (product) => {
        addToCart(product);
    };

    // Helper formats
    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    return (
        <>
            {/* Category Navigation Bar (Only fully relevant in Products View or specific category, but keeping active for filters) */}
            <div className={`category-nav-container transition-all duration-300 ${viewMode === 'categories' && activeCategory === 'all' && !searchTerm ? 'h-0 overflow-hidden opacity-0 m-0 p-0' : 'opacity-100'}`}>
                <div
                    ref={categoryNavRef}
                    className="container mx-auto px-4 max-w-7xl category-nav-inner flex gap-2 overflow-x-auto"
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

            {/* Search Bar */}
            <div className="container mx-auto max-w-[600px] px-4 pt-6 mb-4">
                <div className="search-container relative flex items-center w-full">
                    <i className="fa-solid fa-magnifying-glass search-icon absolute left-4 text-[#0A3D2E] text-[1.1rem]"></i>
                    <input
                        id="product-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input w-full py-3 px-4 pl-12 border-2 border-[#145e46] rounded-full text-base outline-none transition-all shadow-sm focus:border-[#0A3D2E] focus:ring-4 focus:ring-[#0A3D2E]/20"
                        placeholder="Search for premium kitchen items or decor..."
                    />
                </div>
            </div>

            {/* Premium View Modes Toggle */}
            {activeCategory === 'all' && !searchTerm && (
                <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-center md:justify-end mb-4 border-b border-gray-100">
                    <div className="inline-flex bg-gray-100 rounded-lg p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => {
                                setViewMode('categories');
                                setIsLoading(true);
                            }}
                            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${viewMode === 'categories' ? 'bg-white text-[#0A3D2E] shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <i className="fa-solid fa-layer-group"></i> All Categories
                        </button>
                        <button
                            onClick={() => {
                                setViewMode('products');
                                setIsLoading(true);
                            }}
                            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${viewMode === 'products' ? 'bg-white text-[#0A3D2E] shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}
                        >
                            <i className="fa-solid fa-grid-2"></i> All Products
                        </button>
                    </div>
                </div>
            )}

            {/* Product Grid Array mapped locally leveraging next/image safely without throwing loading flicker since it's SSR */}
            <section id="products-section" className="section py-3 flex-grow w-full overflow-hidden">
                <div className="container mx-auto px-2 max-w-7xl">
                    <div className={`transition-opacity duration-300 ${fadeState}`}>
                        {viewMode === 'categories' && activeCategory === 'all' && !searchTerm ? (
                            <div className="flex flex-col gap-8 md:gap-12 pb-12">
                                {isLoading ? (
                                    <>
                                        {[1, 2, 3].map((sectionIndex) => (
                                            <div key={`skeleton-section-${sectionIndex}`} className="w-full mb-12">
                                                <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mb-6 ml-2"></div>
                                                <div className="flex gap-4 overflow-hidden px-2">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="w-[38vw] md:w-[22vw] max-w-[280px] shrink-0">
                                                            <ProductSkeleton />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    dynamicCategories.map((cat, index) => (
                                        <motion.div
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.5, delay: 0.1 }}
                                        >
                                            <CategoryProductSlider
                                                categoryId={cat.id}
                                                categoryLabel={cat.label}
                                                products={initialProducts}
                                                onViewAll={setCategoryAndScroll}
                                            />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div
                                className="products-grid grid gap-4 min-h-[400px]"
                                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}
                            >
                                {isLoading ? (
                                    // Render grid of skeletons
                                    Array(8).fill(0).map((_, idx) => (
                                        <div key={`grid-skeleton-${idx}`} className="h-[320px]">
                                            <ProductSkeleton />
                                        </div>
                                    ))
                                ) : displayedProducts.length === 0 ? (
                                    <p className="col-span-full text-center text-gray-500 py-4 w-full">No products found matching your criteria.</p>
                                ) : (
                                    displayedProducts.map((p, idx) => (
                                        <div key={p.slug || `${p.Name || p.name}-${idx}`} className="product-card bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-xl flex flex-col group h-full">
                                            <Link href={`/product/${p.slug}`} className="block relative pt-[100%] bg-gray-50 cursor-pointer w-full overflow-hidden">
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
                                                <Link href={`/product/${p.slug}`} className="block cursor-pointer">
                                                    <h3 className="product-title text-sm font-medium text-gray-800 mb-1 leading-[1.3] hover:text-[#10b981] transition-colors rounded" title={p.Name || p.name}>
                                                        {p.Name || p.name || 'Unknown'}
                                                    </h3>
                                                </Link>
                                                <p className="product-price text-lg font-extrabold text-[#1f2937]">
                                                    {formatPrice(p.Price || p.price)}
                                                </p>
                                                <button
                                                    onClick={() => handleAddToCart(p)}
                                                    className="btn btn-primary bg-[#0A3D2E] text-white w-full flex justify-center items-center py-2.5 md:py-3 px-4 md:px-6 md:text-base rounded-lg font-semibold text-sm transition-colors hover:bg-[#10b981] md:hover:bg-emerald-700 shadow-sm mt-auto"
                                                >
                                                    <i className="fa-solid fa-cart-plus mr-1.5 md:mr-2 flex-shrink-0"></i> Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {hasMore && (viewMode !== 'categories' || activeCategory !== 'all' || searchTerm) && !isLoading && (
                        <div className="flex justify-center mt-10 mb-6 w-full">
                            <button
                                onClick={handleLoadMore}
                                className="bg-white text-[#0A3D2E] border-2 border-[#0A3D2E] hover:bg-[#0A3D2E] hover:text-white px-8 py-3 rounded-full font-bold transition-colors w-full sm:w-auto shadow-sm"
                            >
                                Load More Products
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default function ProductGridClient({ initialProducts }) {
    return (
        <Suspense fallback={<div className="container mx-auto max-w-7xl py-12 text-center">Loading products...</div>}>
            <ProductGridContent initialProducts={initialProducts} />
        </Suspense>
    );
}
