'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CategoryProductSlider from '@/components/CategoryProductSlider';

export default function HomeCategories({ products, categories = [] }) {
    const router = useRouter();

    const dynamicCategories = useMemo(() => {
        if (categories.length > 0) {
            return categories.filter((category) =>
                products.some((product) => {
                    const values = Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : (product.category ? [product.category] : []));
                    return values.some((value) => {
                        const normalized = (value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
                        return normalized === category.id;
                    });
                })
            );
        }

        const cats = new Set();
        products.forEach((product) => {
            const values = Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : (product.category ? [product.category] : []));
            values.forEach((cat) => {
                const trimmed = (cat || '').trim();
                if (trimmed) cats.add(trimmed);
            });
        });
        return Array.from(cats).sort().map((cat) => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
            image: '',
        }));
    }, [categories, products]);

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
                dynamicCategories.map((cat, index) => {
                    const sectionClassName = index % 2 === 0
                        ? 'bg-[color:color-mix(in_oklab,var(--color-primary)_10%,white)]'
                        : 'bg-white';
                    return (
                        <section key={cat.id} className={`py-8 md:py-12 ${sectionClassName}`}>
                            <div className="mx-auto w-full max-w-[1240px] px-4">
                                <div className="animate-fadeInUp">
                                    <CategoryProductSlider
                                        categoryId={cat.id}
                                        categoryLabel={cat.label}
                                        products={products}
                                        onViewAll={handleViewAll}
                                    />
                                </div>
                            </div>
                        </section>
                    );
                })
            )}
        </div>
    );
}
