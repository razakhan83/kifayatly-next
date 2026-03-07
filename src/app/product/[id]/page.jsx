import { getProducts } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartBtn from '@/components/AddToCartBtn';
import CategoryProductSlider from '@/components/CategoryProductSlider';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const products = await getProducts();
    return products.slice(0, 100).map(p => ({
        id: p.slug
    })); // Only pre-render first 100 to save build time, rest will fallback or block depending on next config.
}

export default async function ProductPage({ params }) {
    const resolvedParams = await params;
    const products = await getProducts();
    const product = products.find(p => p.slug === resolvedParams.id);

    if (!product) return notFound();

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 min-h-[60vh]">
            <div className="mb-6">
                <Link href="/" className="text-[#0A3D2E] font-medium hover:underline flex items-center gap-2 max-w-max">
                    <i className="fa-solid fa-arrow-left"></i> Back to Products
                </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                <div className="w-full md:w-1/2 relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    {product.Image || product.image ? (
                        <Image
                            src={product.Image || product.image}
                            alt={product.Name || product.name || 'Product Image'}
                            fill
                            className="object-cover transition-transform duration-700 hover:scale-105"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <i className="fa-solid fa-image text-8xl opacity-20"></i>
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="mb-4 inline-flex">
                        <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {product.Category || product.category || 'Premium Item'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                        {product.Name || product.name}
                    </h1>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#10b981] mb-6">
                        {formatPrice(product.Price || product.price)}
                    </div>

                    <div className="prose prose-gray mb-8">
                        <p className="text-gray-900 font-medium leading-relaxed text-lg">
                            {product.Description || product.description || "Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind, designed to elevate your everyday lifestyle."}
                        </p>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                        <AddToCartBtn
                            product={product}
                            className="w-full md:w-max bg-[#0A3D2E] text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-[#10b981] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        />
                    </div>
                </div>
            </div>

            {/* More Like This Slider Section */}
            <div className="mt-20">
                <CategoryProductSlider
                    categoryId={product.Category?.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-') || product.category?.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')}
                    categoryLabel="More Like This"
                    products={products.filter(p => p.slug !== product.slug)} // exclude current product visually
                />
            </div>
        </div>
    );
}
