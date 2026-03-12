'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';

export default function LayoutWrapper({ children, categories = [] }) {
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(2025);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    useEffect(() => {
        const handleLoad = () => setLoading(false);

        if (document.readyState === 'complete') {
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => clearTimeout(timer);
        } else {
            window.addEventListener('load', handleLoad);
            const timer = setTimeout(() => setLoading(false), 2000);
            return () => {
                window.removeEventListener('load', handleLoad);
                clearTimeout(timer);
            };
        }
    }, []);

    // Admin routes: render children directly — no store chrome
    if (isAdminPage) {
        return <>{children}</>;
    }

    // Store routes: full chrome with Navbar, Footer, WhatsApp, Splash
    return (
        <>
            {loading && <SplashScreen onComplete={() => setLoading(false)} />}
            <div
                className="flex flex-col min-h-screen bg-[#f3f4f6]"
                style={{ visibility: loading ? 'hidden' : 'visible' }}
            >
                <Navbar categories={categories} />

                <main className="flex-grow">
                    {children}
                </main>

                {/* Emerald Professional Footer */}
                <footer className="bg-[#0A3D2E] pt-12 pb-6 text-white text-sm mt-auto">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><i className="fa-solid fa-store text-[#10b981]"></i> China Unique Store</h3>
                                <p className="text-white/80 leading-relaxed mb-4">Your premium destination for high-quality kitchenware, home decor, and lifestyle products imported directly for you.</p>
                                <div className="flex gap-4">
                                    <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#10b981] transition-colors"><i className="fa-brands fa-facebook-f"></i></a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#10b981] transition-colors"><i className="fa-brands fa-instagram"></i></a>
                                    <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#10b981] transition-colors"><i className="fa-brands fa-tiktok"></i></a>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Quick Links</h3>
                                <ul className="space-y-3 text-white/80">
                                    <li><a href="#" className="hover:text-[#10b981] transition-colors flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs"></i> About Us</a></li>
                                    <li><a href="#" className="hover:text-[#10b981] transition-colors flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs"></i> Refund Policy</a></li>
                                    <li><a href="#" className="hover:text-[#10b981] transition-colors flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs"></i> Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-[#10b981] transition-colors flex items-center gap-2"><i className="fa-solid fa-angle-right text-xs"></i> Shipping Policy</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">Contact Us</h3>
                                <ul className="space-y-4 text-white/80">
                                    <li className="flex items-start gap-3">
                                        <i className="fa-brands fa-whatsapp mt-1 text-[#10b981] text-lg"></i>
                                        <div>
                                            <span className="block font-semibold text-white">WhatsApp Line</span>
                                            <a href="https://wa.me/923001234567" className="hover:text-[#10b981] transition-colors">+92 300 1234567</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <i className="fa-solid fa-location-dot mt-1 text-[#10b981] text-lg"></i>
                                        <div>
                                            <span className="block font-semibold text-white">Location</span>
                                            <span>Karachi, Pakistan</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/60 text-xs">
                            <p>&copy; {year} China Unique Store. All rights reserved.</p>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                <i className="fa-brands fa-cc-visa text-3xl opacity-50 hover:opacity-100 transition-opacity"></i>
                                <i className="fa-brands fa-cc-mastercard text-3xl opacity-50 hover:opacity-100 transition-opacity"></i>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <FloatingWhatsApp />
            <CartDrawer />
        </>
    );
}
