import ProductGridClient from '@/components/ProductGridClient';
import { getProducts } from '@/lib/data';

export default async function Products() {
    const products = await getProducts();

    return (
        <div className="pt-8">
            <div className="container mx-auto px-4 max-w-7xl mb-4">
                <h1 className="text-3xl font-bold text-[#0A3D2E]">All Products</h1>
            </div>
            <ProductGridClient initialProducts={products} />
        </div>
    );
}
