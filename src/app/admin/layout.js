'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'fa-chart-line' },
    { href: '/admin/products', label: 'Products', icon: 'fa-box-open' },
    { href: '/admin/orders', label: 'Orders', icon: 'fa-receipt' },
    { href: '/admin/settings', label: 'Settings', icon: 'fa-gear' },
];

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
                    <div className="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center">
                        <i className="fa-solid fa-store text-white text-sm"></i>
                    </div>
                    <span className="text-lg font-bold tracking-tight">Admin Panel</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                        ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to Store */}
                <div className="p-3 border-t border-white/10">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <i className="fa-solid fa-arrow-left w-5 text-center"></i>
                        Back to Store
                    </Link>
                </div>

                {/* User Info */}
                {session?.user && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                            {session.user.image ? (
                                <img src={session.user.image} alt="Admin" className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30" />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#10b981] flex items-center justify-center text-sm font-bold">A</div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold truncate">{session.user.name || 'Admin'}</span>
                                <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors"
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Open menu"
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 hidden md:block">
                        <i className="fa-solid fa-shield-halved text-[#10b981] mr-2"></i>
                        Store Management
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
                            <i className="fa-solid fa-circle text-[6px] mr-1.5 animate-pulse"></i>
                            Live
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
