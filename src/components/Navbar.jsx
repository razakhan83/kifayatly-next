'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function NavbarContent({ categories }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const cartContext = useCart();
    const cartCount = cartContext ? cartContext.cartCount : 0;
    const activeCategory = cartContext ? cartContext.activeCategory : 'all';
    const setActiveCategory = cartContext ? cartContext.setActiveCategory : () => { };

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
                                onClick={() => setIsSidebarOpen(true)}
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

                        <div className="header-right flex-1 flex items-center justify-end gap-5">
                            <button
                                className="icon-btn search-trigger bg-transparent border-none text-xl text-white cursor-pointer hover:scale-110 transition-transform"
                                aria-label="Search"
                                onClick={() => {
                                    const searchEl = document.getElementById('product-search');
                                    if (searchEl) {
                                        const header = document.querySelector('.sticky-header-wrapper');
                                        const offset = (header ? header.offsetHeight : 0) + 20;
                                        const elementPosition = searchEl.getBoundingClientRect().top + window.scrollY;
                                        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
                                        setTimeout(() => searchEl.focus(), 300);
                                    }
                                }}
                            >
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                            <button
                                className="icon-btn cart-header-btn bg-transparent border-none text-xl text-white cursor-pointer relative"
                                aria-label="Cart"
                                onClick={() => router.push('/cart')}
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
            </div>

            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Slide-in Sidebar */}
            <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header flex justify-between items-center p-6 bg-[#0A3D2E] text-white">
                    <h2 className="text-xl font-bold m-0">Categories</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="close-sidebar-btn bg-transparent border-none text-white text-2xl cursor-pointer"
                        aria-label="Close Menu"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div className="sidebar-content p-4 flex flex-col gap-2">
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`category-btn flex items-center gap-3 p-3 text-left text-base font-medium rounded-md w-full transition-all ${activeCategory === 'all' ? 'bg-[#10b981] text-white font-bold' : 'text-black border border-transparent hover:bg-black/5 hover:text-[#10b981]'}`}
                    >
                        <i className="fa-solid fa-layer-group w-5"></i> All Items
                    </button>
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
            </nav>
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
