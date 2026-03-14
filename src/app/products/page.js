import ProductGridClient from '@/components/ProductGridClient';
import ProductsPageHeader from '@/components/ProductsPageHeader';
import ProductsPageSkeleton from '@/components/ProductsPageSkeleton';
import { getProducts } from '@/lib/data';
import { Suspense } from 'react';

function normalizeCategoryId(category) {
    return category
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

function buildCategoryList(products) {
    return Array.from(
        new Map(
            products
                .flatMap((product) => (Array.isArray(product.Category) ? product.Category : product.Category ? [product.Category] : []))
                .filter(Boolean)
                .map((category) => [normalizeCategoryId(category), { id: normalizeCategoryId(category), label: category }])
        ).values()
    ).sort((a, b) => a.label.localeCompare(b.label));
}

function buildSuspenseKey(searchParams) {
    return JSON.stringify({
        category: searchParams?.category || 'all',
        search: searchParams?.search || '',
    });
}

export default async function Products({ searchParams }) {
    const resolvedSearchParams = (await searchParams) || {};

    return (
        <Suspense key={buildSuspenseKey(resolvedSearchParams)} fallback={<ProductsPageSkeleton />}>
            <ProductsContent searchParams={resolvedSearchParams} />
        </Suspense>
    );
}

async function ProductsContent({ searchParams }) {
    const products = await getProducts();
    const activeCategory = searchParams?.category || 'all';
    const searchTerm = searchParams?.search || '';
    const categories = buildCategoryList(products);

    return (
        <div>
            <ProductsPageHeader categories={categories} activeCategory={activeCategory} searchTerm={searchTerm} />
            <ProductList products={products} activeCategory={activeCategory} searchTerm={searchTerm} />
        </div>
    );
}

function ProductList({ products, activeCategory, searchTerm }) {
    return <ProductGridClient initialProducts={products} hideCategoryBar activeCategoryOverride={activeCategory} forceSearchTerm={searchTerm} />;
}
