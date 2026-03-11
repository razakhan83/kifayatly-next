'use client';
import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';

export default function AdminLayout({ children }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Exclude login page
    if (pathname === '/admin/login') return <>{children}</>;

    // Loading
    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-xl text-gray-500 font-semibold animate-pulse">Loading Dashboard...</p>
        </div>;
    }

    // Not authenticated or not admin
    if (!session || session.user?.email !== '123raza83@gmail.com') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-lock text-2xl text-[#10b981]"></i>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Access Only</h1>
                    <p className="text-gray-500 mb-8 text-sm">Please login with your authorized store manager account.</p>
                    <button
                        onClick={() => signIn('google')}
                        className="w-full min-w-[140px] h-[45px] bg-white border border-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continue with Google
                    </button>
                </div>
            </div>
        );
    }

    // Authenticated admin layout
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Progress Loader */}
            <NextTopLoader
                color="#10b981"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #10b981,0 0 5px #10b981"
            />

            {/* Top Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex justify-between items-center shadow-sm sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu - Mobile Only */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden min-w-[45px] h-[45px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex flex-col justify-center items-center transition-all duration-200 active:scale-95 shadow-sm"
                    >
                        <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                        <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                        <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                    </button>
                    <i className="fa-solid fa-store text-[#10b981] text-xl hidden md:inline"></i>
                    <span className="font-bold text-gray-900 text-sm md:text-lg">China Unique Store Admin</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-xs md:text-sm text-gray-600 hidden md:block">Welcome, {session?.user?.name || 'Admin'}</span>
                    <button
                        onClick={() => signOut({ callbackUrl: '/admin/login' })}
                        className="min-w-[140px] h-[45px] bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 relative">
                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 md:hidden z-30"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Sidebar */}
                <aside className={`
                    fixed md:static top-16 left-0 bottom-0 w-64 bg-gray-900 text-white p-5 
                    overflow-y-auto transition-transform duration-300 ease-in-out z-40
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <h2 className="text-xl font-bold mb-10 text-emerald-500">China Unique</h2>
                    <nav className="space-y-2">
                        <a
                            href="/admin"
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                                pathname === '/admin'
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {pathname === '/admin' && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}
                            <i className="fa-solid fa-chart-line mr-3 text-lg"></i>
                            Dashboard
                        </a>
                        <a
                            href="/admin/products"
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                                pathname.startsWith('/admin/products')
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {pathname.startsWith('/admin/products') && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}
                            <i className="fa-solid fa-box mr-3 text-lg"></i>
                            Products
                        </a>
                        <a
                            href="/admin/orders"
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                                pathname.startsWith('/admin/orders')
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {pathname.startsWith('/admin/orders') && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}
                            <i className="fa-solid fa-shopping-cart mr-3 text-lg"></i>
                            Orders
                        </a>
                        <a
                            href="/admin/settings"
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                                pathname.startsWith('/admin/settings')
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {pathname.startsWith('/admin/settings') && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                            )}
                            <i className="fa-solid fa-cog mr-3 text-lg"></i>
                            Settings
                        </a>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto overflow-x-hidden w-full relative">
                    {children}
                </main>
            </div>
        </div>
    );
}