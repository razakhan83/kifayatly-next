import ProductGridClient from '@/components/ProductGridClient';
import { getProducts } from '@/lib/data';
import { Suspense } from 'react';
import ProductSkeleton from '@/components/ProductSkeleton';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Products() {
    return (
        <div className="pt-8">
            <div className="container mx-auto px-4 max-w-7xl mb-4">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>All Products</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-3xl font-bold text-[#0A3D2E]">All Products</h1>
            </div>
            <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                </div>
            }>
                <ProductList />
            </Suspense>
        </div>
    );
}

async function ProductList() {
    const products = await getProducts();
    return <ProductGridClient initialProducts={products} />;
}
