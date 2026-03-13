'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CategoryProductSlider from '@/components/CategoryProductSlider';

export default function HomeCategories({ products }) {
    const router = useRouter();

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

    const handleViewAll = (catId) => {
        router.push(`/products?category=${catId}`);
    };

    return (
        <div className="flex flex-col">
            {dynamicCategories.length === 0 ? (
                <div className="py-12 bg-gray-100">
                    <div className="container mx-auto px-2 max-w-7xl">
                        <p className="text-center text-gray-500">No products available at the moment.</p>
                    </div>
                </div>
            ) : (
                dynamicCategories.map((cat, index) => (
                    <section key={cat.id} className={`py-8 md:py-12 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                        <div className="container mx-auto px-2 max-w-7xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <CategoryProductSlider
                                    categoryId={cat.id}
                                    categoryLabel={cat.label}
                                    products={products}
                                    onViewAll={handleViewAll}
                                />
                            </motion.div>
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
