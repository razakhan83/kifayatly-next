'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ categories = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const isAdmin = session?.user?.email === '123raza83@gmail.com';

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Header / Hamburger Menu */}
            <div className="md:hidden flex items-center justify-between bg-[#0A3D2E] text-white p-4 sticky top-0 z-40 shadow-md">
                <Link href="/" onClick={closeSidebar}>
                    <span className="text-xl font-bold tracking-tight">Kifayatly Store</span>
                </Link>
                <button onClick={toggleSidebar} className="text-2xl focus:outline-none" aria-label="Toggle Menu">
                    <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
            </div>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-none flex flex-col h-screen md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out`}
            >
                {/* Desktop Branding */}
                <div className="hidden md:flex items-center justify-center h-20 border-b border-gray-100 bg-[#0A3D2E] text-white">
                    <Link href="/">
                        <span className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <i className="fa-solid fa-store text-[#10b981]"></i> Kifayatly
                        </span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="py-6 px-4 space-y-2 overflow-y-auto w-full">
                    {/* Public Links */}
                    <Link
                        href="/"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#10b981]'
                            }`}
                    >
                        <i className="fa-solid fa-house w-5 text-center"></i> Home
                    </Link>

                    <Link
                        href="/products"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/products' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#10b981]'
                            }`}
                    >
                        <i className="fa-solid fa-layer-group w-5 text-center"></i> All Products
                    </Link>

                    {/* Dynamic Categories */}
                    {categories && categories.length > 0 && (
                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shop by Category</p>
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/products?category=${encodeURIComponent(category.Name)}`}
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/products' && typeof window !== 'undefined' && window.location.search.includes(encodeURIComponent(category.Name)) ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#10b981]'
                                        }`}
                                >
                                    <i className="fa-solid fa-angle-right w-5 text-center text-xs opacity-50"></i> {category.Name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Admin Links */}
                    {isAdmin && (
                        <>
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Controls</p>
                                <Link
                                    href="/admin"
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${pathname === '/admin' ? 'bg-[#10b981]/10 text-[#10b981]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#10b981]'
                                        }`}
                                >
                                    <i className="fa-solid fa-chart-line w-5"></i> Dashboard
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                {/* Footer / Auth Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto w-full">
                    {isAdmin ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 px-2">
                                {session?.user?.image ? (
                                    <img src={session.user.image} alt="Admin" className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        A
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 leading-tight">Admin</span>
                                    <span className="text-xs text-gray-500 font-medium truncate w-32">{session?.user?.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    signOut({ callbackUrl: '/' });
                                    closeSidebar();
                                }}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white border border-red-700 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md text-lg mt-2"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/signin"
                            onClick={closeSidebar}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 hover:text-[#10b981] transition-all shadow-sm text-sm"
                        >
                            <i className="fa-solid fa-shield-halved"></i> Admin Login
                        </Link>
                    )}
                </div>
            </motion.aside>
        </>
    );
}
