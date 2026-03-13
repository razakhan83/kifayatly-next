'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="container mx-auto max-w-[600px] px-4 pt-6 mb-2">
            <form onSubmit={handleSearch} className="search-container relative flex items-center w-full">
                <i className="fa-solid fa-magnifying-glass search-icon absolute left-4 text-[#0A3D2E] text-[1.1rem]"></i>
                <input
                    id="home-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input w-full py-3 px-4 pl-12 border-2 border-[#145e46] rounded-full text-base outline-none transition-all shadow-sm focus:border-[#0A3D2E] focus:ring-4 focus:ring-[#0A3D2E]/20"
                    placeholder="Search for premium products..."
                />
                <button type="submit" className="absolute right-2 bg-[#0A3D2E] hover:bg-[#10b981] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-md">
                    Search
                </button>
            </form>
        </div>
    );
}
