'use client';
import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function NavbarContent({ categories }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const catDropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();

    const cartContext = useCart();
    const cartCount = cartContext?.cartCount || 0;
    const activeCategory = cartContext?.activeCategory || 'all';
    const setActiveCategory = cartContext?.setActiveCategory || (() => {});
    const isSidebarOpen = cartContext?.isSidebarOpen || false;
    const setIsSidebarOpen = cartContext?.setIsSidebarOpen || (() => {});
    const openSidebar = cartContext?.openSidebar || (() => {});
    const openCart = cartContext?.openCart || (() => {});

    // Trap scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClick = (e) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setIsCategoriesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Derived suggestions based on categories prop which seems to only have category info, not products.
    // Need a global product context or pass products to Navbar.
    // If we don't have products in Navbar, we can just hit an API or pass them.
    // Let's check where products can come from. Wait, Navbar is used in `layout.js`, which only fetches categories.
    // We'll need a way for Navbar to fetch or access products. Or we just keep the basic search logic if no products are passed.
    // Search suggestions logic synchronized with mobile
    const [allProducts, setAllProducts] = useState([]);
    
    // Fetch products once on mount for global search autocomplete
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/search-products'); // We will create this simple endpoint
                if (res.ok) {
                    const data = await res.json();
                    setAllProducts(data);
                }
            } catch (err) {
                console.error("Failed to fetch products for search", err);
            }
        };
        fetchProducts();
    }, []);

    const suggestions = useMemo(() => {
        if (!debouncedSearch.trim()) return [];
        return allProducts.filter(p => {
            const name = (p.Name || p.name || '').toLowerCase();
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
            const term = debouncedSearch.toLowerCase();
            return name.includes(term) || categories.some(c => (c || '').toLowerCase().includes(term));
        }).slice(0, 5);
    }, [debouncedSearch, allProducts]);

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.Name || product.name || '');
        setIsSearchOpen(false);
        setIsFocused(false);
        router.push(`/products?search=${encodeURIComponent(product.Name || product.name || '')}`);
    };

    const scrollToProducts = () => {
        const section = document.querySelector('.category-nav-container');
        const header = document.querySelector('.sticky-header-wrapper');
        const headerHeight = header ? header.offsetHeight : 0;
        if (section) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: sectionTop - headerHeight - 10, behavior: 'smooth' });
        }
    };

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        setIsSidebarOpen(false);
        setIsCategoriesOpen(false);
        
        if (pathname !== '/' && pathname !== '/products') {
            router.push(`/products?category=${catId}`);
        } else {
            setTimeout(() => {
                scrollToProducts();
            }, 100);
        }
    };

    const navLinkClass = (path) =>
        `text-sm font-semibold transition-colors whitespace-nowrap ${
            pathname === path
                ? 'text-[#10b981]'
                : 'text-white/90 hover:text-white'
        }`;

    return (
        <>
            <div className="sticky-header-wrapper">
                <div className="announcement-bar">
                    <marquee behavior="scroll" direction="left" scrollamount={6}>
                        🔥 Welcome to China Unique Store | Free Delivery on orders above Rs. 3000! | New Arrivals Daily 🔥
                    </marquee>
                </div>

                <header className="main-header bg-[#0A3D2E] h-14">
                    <div className="container flex justify-between items-center px-4 mx-auto max-w-7xl h-full">
                        {/* Left: Hamburger (mobile only) */}
                        <div className="header-left flex-1 flex items-center md:hidden">
                            <button
                                onClick={openSidebar}
                                className="menu-toggle-btn bg-transparent border-none text-2xl text-white cursor-pointer"
                                aria-label="Open Menu"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        </div>

                        {/* Desktop nav links (hidden on mobile) */}
                        <nav className="hidden md:flex items-center gap-1 flex-1">
                            <Link href="/" className={`${navLinkClass('/')} px-3 py-1.5 rounded-lg hover:bg-white/10`}>
                                Home
                            </Link>
                            <Link href="/products" className={`${navLinkClass('/products')} px-3 py-1.5 rounded-lg hover:bg-white/10`}>
                                All Products
                            </Link>

                            {/* Categories dropdown */}
                            <div className="relative" ref={catDropdownRef}>
                                <button
                                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                    className="text-sm font-semibold text-white/90 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    Categories
                                    <i className={`fa-solid fa-chevron-down text-[9px] transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                <div className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto transition-all duration-200 origin-top ${isCategoriesOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <button
                                        onClick={() => handleCategoryClick('new-arrivals')}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2.5"
                                    >
                                        <i className="fa-solid fa-star text-amber-400 text-xs w-4 text-center"></i>
                                        New Arrivals
                                    </button>
                                    <div className="h-px bg-gray-100 mx-3 my-1"></div>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2.5"
                                        >
                                            <i className="fa-solid fa-tag text-gray-300 text-xs w-4 text-center"></i>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </nav>

                        {/* Logo */}
                        <div className="logo flex-[2] md:flex-none flex justify-center text-xl md:text-2xl font-black text-white tracking-tight whitespace-nowrap overflow-visible px-1">
                            <Link href="/">
                                <span>China Unique Store</span>
                            </Link>
                        </div>

                        {/* Right: Search (desktop only) + Cart */}
                        <div className="header-right flex-1 flex items-center justify-end gap-4 md:gap-5">
                            {/* Search icon — desktop only */}
                            <button
                                className="icon-btn search-trigger hidden md:inline-flex bg-transparent border-none text-xl text-white cursor-pointer hover:scale-110 transition-transform"
                                aria-label="Toggle Search"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                            >
                                <i className={`fa-solid ${isSearchOpen ? 'fa-xmark text-2xl' : 'fa-magnifying-glass'}`}></i>
                            </button>
                            <button
                                className="icon-btn cart-header-btn bg-transparent border-none text-xl text-white cursor-pointer relative"
                                aria-label="Cart"
                                onClick={openCart}
                            >
                                <i className="fa-solid fa-bag-shopping"></i>
                                {cartCount > 0 && (
                                    <span className="cart-badge absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[0.7rem] font-bold h-[18px] min-w-[18px] rounded-full flex items-center justify-center px-1">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Navbar Dropdown Search Bar — desktop only */}
                <div
                    className={`bg-white border-b border-gray-200 shadow-md overflow-visible hidden md:block transition-all duration-200 will-change-[max-height,opacity] relative z-40 ${isSearchOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                >
                    <div className="container mx-auto px-4 py-4 max-w-3xl relative">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchTerm.trim()) {
                                    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                                    setIsSearchOpen(false);
                                }
                            }}
                            className="relative flex items-center w-full gap-2"
                        >
                            <div className="relative flex-1">
                                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#0A3D2E] text-[1.1rem] z-10"></i>
                                <Input
                                    type="text"
                                    autoFocus={isSearchOpen}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    className="w-full pl-12 pr-10 h-12 rounded-full border-2 border-[#145e46] text-base focus-visible:ring-[#0A3D2E]/20"
                                    placeholder="Search for premium products..."
                                />
                                {searchTerm && (
                                    <button type="button" onClick={() => { setSearchTerm(''); setIsFocused(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Clear Search">
                                        <i className="fa-solid fa-circle-xmark text-xl"></i>
                                    </button>
                                )}
                            </div>
                            <Button type="submit" className="rounded-full px-6 h-10 shadow-sm border-0">
                                Search
                            </Button>
                        </form>
                        
                        {/* Autocomplete Dropdown - Desktop Sync */}
                        {isFocused && searchTerm.trim() && (
                            <div className="absolute top-full mt-2 left-4 right-[108px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50">
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
                                                            <img src={p.Image || p.image} alt={p.Name || p.name || 'product'} className="w-full h-full object-cover" />
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
                </div>
            </div>

            {/* Backdrop Overlay for sidebar */}
            <div
                className={`fixed inset-0 bg-black/20 z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />

            {/* Slide-in Sidebar — mobile only */}
            <nav 
                className={`fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-[#0A3D2E] m-0">Menu</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white bg-gray-100 hover:bg-red-500 transition-colors rounded-full"
                        aria-label="Close Menu"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div className="sidebar-content flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    <button
                        onClick={() => {
                            setIsSidebarOpen(false);
                            router.push('/');
                        }}
                        className={`category-btn flex items-center gap-3 p-3 text-left text-base font-medium rounded-md w-full transition-all ${pathname === '/' ? 'bg-[#10b981] text-white font-bold' : 'text-black border border-transparent hover:bg-black/5 hover:text-[#10b981]'}`}
                    >
                        <i className="fa-solid fa-house w-5"></i> Home
                    </button>
                    <button
                        onClick={() => {
                            setIsSidebarOpen(false);
                            router.push('/products');
                        }}
                        className={`category-btn flex items-center gap-3 p-3 text-left text-base font-medium rounded-md w-full transition-all ${pathname === '/products' ? 'bg-[#10b981] text-white font-bold' : 'text-black border border-transparent hover:bg-black/5 hover:text-[#10b981]'}`}
                    >
                        <i className="fa-solid fa-box-open w-5"></i> All Products
                    </button>

                    <div className="sidebar-divider h-px bg-gray-200 my-2"></div>

                    <Accordion type="single" className="w-full">
                        <AccordionItem value="categories" className="border-b-0">
                            <AccordionTrigger className="hover:no-underline py-2 px-3 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors uppercase tracking-wider">
                                Browse Categories
                            </AccordionTrigger>
                            <AccordionContent className="pb-0 pt-2 px-1">
                                <div className="dynamic-sidebar-cats flex flex-col gap-1.5 border-l-2 border-emerald-100 ml-4 pl-3">
                                    <button
                                        onClick={() => handleCategoryClick('new-arrivals')}
                                        className={`category-btn flex items-center gap-3 p-2.5 text-left text-sm font-medium rounded-lg w-full transition-all ${activeCategory === 'new-arrivals' ? 'bg-[#10b981]/10 text-[#10b981] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-[#10b981]'}`}
                                    >
                                        <i className="fa-solid fa-star w-4"></i> New Arrivals
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={`category-btn flex items-center gap-3 p-2.5 text-left text-sm font-medium rounded-lg w-full transition-all ${activeCategory === cat.id ? 'bg-[#10b981]/10 text-[#10b981] font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-[#10b981]'}`}
                                        >
                                            <i className="fa-solid fa-tag w-4"></i> {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </nav>
        </>
    );
}

export default function Navbar({ categories = [] }) {
    return (
        <Suspense fallback={<div className="h-14 bg-[#0A3D2E] w-full" />}>
            <NavbarContent categories={categories} />
        </Suspense>
    );
}
