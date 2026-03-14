'use client';

import { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
import HeroSlider from '@/components/HeroSlider';
import HomeCategories from '@/components/HomeCategories';
import ProductGridClient from '@/components/ProductGridClient';
import CategoryIconCarousel from '@/components/CategoryIconCarousel';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function HomeClientWrapper({ products, heroSlides }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const wrapperRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    // Compute categories from products for the icon carousel
    const dynamicCategories = useMemo(() => {
        const cats = new Set();
        products.forEach(p => {
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : []));
            categories.forEach(cat => {
                const trimmed = (cat || '').trim();
                if (trimmed) cats.add(trimmed);
            });
        });
        return Array.from(cats).sort().map(cat => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
        }));
    }, [products]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Debounce logic for live search autocomplete
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter products for suggestions based on user typing
    const suggestions = useMemo(() => {
        if (!debouncedSearch.trim()) return [];
        return products.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase();
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
            const term = debouncedSearch.toLowerCase();
            return name.includes(term) || categories.some(c => (c || '').toLowerCase().includes(term));
        }).slice(0, 5); // Limit to top 5 suggestions
    }, [debouncedSearch, products]);

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        setIsFocused(false);
        if (searchTerm.trim()) {
            setHasSearched(true);
        } else {
            setHasSearched(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setDebouncedSearch('');
        setHasSearched(false);
        setIsFocused(false);
    };

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.Name || product.name || '');
        setHasSearched(true);
        setIsFocused(false);
    };

    return (
        <>
            {/* Hero Slider */}
            <div className="w-full relative overflow-hidden">
                 {mounted && <HeroSlider slides={heroSlides} />}
            </div>

            {/* Category Icon Carousel */}
            <CategoryIconCarousel categories={dynamicCategories} />

            {/* Live Search Bar — mobile only (desktop uses navbar search) */}
            <div className="md:hidden container mx-auto max-w-[600px] px-4 pt-6 mb-2 relative" ref={wrapperRef}>
                <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full gap-2">
                    <div className="relative flex-1 min-w-0">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#0A3D2E] text-[1.1rem] z-10"></i>
                        <Input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setHasSearched(false);
                            }}
                            onFocus={() => setIsFocused(true)}
                            className="w-full pl-12 pr-10 h-12 rounded-full border-2 border-[#145e46] text-base focus-visible:ring-[#0A3D2E]/20"
                            placeholder="Search for premium products..."
                        />
                        {searchTerm && (
                            <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Clear Search">
                                <i className="fa-solid fa-circle-xmark text-xl"></i>
                            </button>
                        )}
                    </div>
                    <Button type="submit" className="rounded-full px-4 h-12 shrink-0 min-w-max">
                        Search
                    </Button>
                </form>

                {/* Autocomplete Dropdown */}
                {isFocused && searchTerm.trim() && (
                    <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50">
                        {suggestions.length > 0 ? (
                            <ul>
                                {suggestions.map((p, idx) => (
                                    <li key={`${p._id || p.id || 'sugg'}-${idx}`}>
                                        <button 
                                            type="button"
                                            onClick={() => handleSuggestionClick(p)}
                                            className="w-full text-left px-4 py-3 hover:bg-[#10b981]/10 flex items-center gap-3 transition-colors"
                                        >
                                            <div className="relative w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                                                {(p.Image || p.image) && (
                                                    <Image src={p.Image || p.image} alt={p.Name || p.name || 'product'} fill sizes="48px" className="object-cover" unoptimized />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{p.Name || p.name}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {Array.isArray(p.Category) ? p.Category.join(', ') : (p.Category || 'Uncategorized')}
                                                </p>
                                            </div>
                                            <i className="fa-solid fa-arrow-right text-[#10b981] text-xs"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-6 text-center text-sm text-gray-500">
                                <i className="fa-solid fa-magnifying-glass text-2xl text-gray-300 mb-2 block"></i>
                                No products found matching &quot;{debouncedSearch}&quot;
                            </div>
                        )}
                    </div>
                )}
            </div>

            {hasSearched ? (
                <div className="mt-4 animate-fadeIn">
                    <ProductGridClient initialProducts={products} forceSearchTerm={searchTerm} hideSearch={true} />
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <HomeCategories products={products} />
                </div>
            )}
        </>
    );
}
