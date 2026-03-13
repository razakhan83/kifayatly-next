'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

function NavbarContent({ categories }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
        if (pathname === '/cart') {
            router.push('/');
            setTimeout(() => {
                scrollToProducts();
            }, 300); // Wait for navigation and render
        } else {
            scrollToProducts();
        }
    };

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
                        <div className="header-left flex-1 flex items-center">
                            <button
                                onClick={openSidebar}
                                className="menu-toggle-btn bg-transparent border-none text-2xl text-white cursor-pointer"
                                aria-label="Open Menu"
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>
                        </div>

                        <div className="logo flex-[2] flex justify-center text-xl md:text-2xl font-black text-white tracking-tight whitespace-nowrap overflow-visible px-1">
                            <Link href="/">
                                <span>China Unique Store</span>
                            </Link>
                        </div>

                        <div className="header-right flex-1 flex items-center justify-end gap-4 md:gap-5">
                            <button
                                className="icon-btn search-trigger bg-transparent border-none text-xl text-white cursor-pointer hover:scale-110 transition-transform"
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
                
                {/* Navbar Dropdown Search Bar */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-white border-b border-gray-200 shadow-md overflow-hidden"
                        >
                            <div className="container mx-auto px-4 py-4 max-w-3xl">
                                <form 
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (searchTerm.trim()) {
                                            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                    className="relative flex items-center w-full"
                                >
                                    <i className="fa-solid fa-magnifying-glass absolute left-4 text-[#0A3D2E] text-[1.1rem]"></i>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full py-3 px-4 pl-12 pr-28 border-2 border-[#145e46] rounded-full text-base outline-none shadow-sm focus:border-[#0A3D2E] focus:ring-4 focus:ring-[#0A3D2E]/20"
                                        placeholder="Search for premium products..."
                                    />
                                    {searchTerm && (
                                        <button type="button" onClick={() => setSearchTerm('')} className="absolute right-[85px] text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Clear Search">
                                            <i className="fa-solid fa-circle-xmark text-xl"></i>
                                        </button>
                                    )}
                                    <button type="submit" className="absolute right-2 bg-[#0A3D2E] hover:bg-[#10b981] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-md">
                                        Search
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Slide-in Sidebar via Framer Motion */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60] origin-center"
                            onClick={() => setIsSidebarOpen(false)}
                            aria-hidden="true"
                        />

                        <motion.nav 
                            style={{ willChange: 'transform' }}
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-[300px] max-w-[85vw] bg-white z-[70] shadow-2xl flex flex-col"
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
                    <div className="text-xs uppercase font-bold text-gray-500 mb-1 px-3 mt-2 tracking-wider">Categories</div>

                    <button
                        onClick={() => handleCategoryClick('new-arrivals')}
                        className={`category-btn flex items-center gap-3 p-3 text-left text-base font-medium rounded-md w-full transition-all ${activeCategory === 'new-arrivals' ? 'bg-[#10b981] text-white font-bold' : 'text-black border border-transparent hover:bg-black/5 hover:text-[#10b981]'}`}
                    >
                        <i className="fa-solid fa-star w-5"></i> New Arrivals
                    </button>

                    <div className="sidebar-divider h-px bg-gray-200 my-2"></div>

                    <div className="dynamic-sidebar-cats flex flex-col gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`category-btn flex items-center gap-3 p-3 text-left text-base font-medium rounded-md w-full transition-all ${activeCategory === cat.id ? 'bg-[#10b981] text-white font-bold' : 'text-black border border-transparent hover:bg-black/5 hover:text-[#10b981]'}`}
                            >
                                <i className="fa-solid fa-tag w-5"></i> {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.nav>
            </>
            )}
            </AnimatePresence>
        </>
    );
}

export default function Navbar({ categories = [] }) {
    return (
        <Suspense fallback={<div className="h-16 bg-[#0A3D2E] w-full" />}>
            <NavbarContent categories={categories} />
        </Suspense>
    );
}
