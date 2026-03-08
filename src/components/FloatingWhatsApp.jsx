'use client';

import { usePathname } from 'next/navigation';

export default function FloatingWhatsApp() {
    return (
        <a
            href="https://wa.me/923001234567?text=Hello%20China%20Unique%20Store!"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float fixed right-6 bottom-8 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white w-14 h-14 rounded-lg flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
            aria-label="Contact us on WhatsApp"
        >
            <i className="fa-brands fa-whatsapp text-3xl"></i>
        </a>
    );
}
