import { getProducts } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import ProductActions from '@/components/ProductActions';
import CategoryProductSlider from '@/components/CategoryProductSlider';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const products = await getProducts();
    return products.slice(0, 100).map(p => ({
        id: p.slug
    }));
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

    const categorySlug = (product.Category || product.category || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

    return (
        <div className="bg-white min-h-screen">
            {/* Surgical: hide ONLY the floating WhatsApp circle, keep sticky bar */}
            <style dangerouslySetInnerHTML={{
                __html: `
  a[href*='wa.me'].fixed { display: none !important; pointer-events: none !important; }
  .fa-whatsapp.text-3xl { display: none !important; }
  .whatsapp-float { display: none !important; opacity: 0 !important; pointer-events: none !important; }
` }} />
            {/* Breadcrumb */}
            <div className="container mx-auto max-w-7xl px-4 pt-4 pb-2">
                <Link href="/" className="text-sm text-gray-500 hover:text-[#064e3b] transition-colors flex items-center gap-1.5 max-w-max">
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                    <span>Back to Store</span>
                </Link>
            </div>

            {/* Main Product Section */}
            <div className="container mx-auto max-w-7xl px-4 py-4 md:py-8 pb-20 md:pb-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-14">

                    {/* Left Column — Product Image */}
                    <div className="w-full md:w-[55%] lg:w-[58%]">
                        <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            {product.Image || product.image ? (
                                <Image
                                    src={product.Image || product.image}
                                    alt={product.Name || product.name || 'Product Image'}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    unoptimized
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <i className="fa-solid fa-image text-8xl"></i>
                                </div>
                            )}
                        </div>
                        {/* Image Skeleton Thumbnails */}
                        <div className="flex gap-2 mt-3">
                            <div className="w-1/4 aspect-square bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative">
                                {(product.Image || product.image) && (
                                    <Image
                                        src={product.Image || product.image}
                                        alt="Thumbnail"
                                        fill
                                        className="object-cover opacity-100 ring-2 ring-[#064e3b] rounded-xl"
                                        unoptimized
                                    />
                                )}
                            </div>
                            <div className="w-1/4 aspect-square bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                                <i className="fa-solid fa-image text-gray-300 text-lg"></i>
                            </div>
                            <div className="w-1/4 aspect-square bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                                <i className="fa-solid fa-image text-gray-300 text-lg"></i>
                            </div>
                            <div className="w-1/4 aspect-square bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center">
                                <i className="fa-solid fa-image text-gray-300 text-lg"></i>
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Product Details (Sticky on Desktop) */}
                    <div className="w-full md:w-[45%] lg:w-[42%]">
                        <div className="md:sticky md:top-28 flex flex-col gap-5">
                            {/* Category Badge */}
                            <div>
                                <span className="inline-block bg-emerald-50 text-[#064e3b] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-emerald-100">
                                    {product.Category || product.category || 'Premium Item'}
                                </span>
                            </div>

                            {/* Product Title */}
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                {product.Name || product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl md:text-4xl font-extrabold text-[#064e3b]">
                                    {formatPrice(product.Price || product.price)}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-200"></div>

                            {/* Description */}
                            <div className="text-gray-600 leading-relaxed text-[15px]">
                                <p>
                                    {product.Description || product.description || "Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind, designed to elevate your everyday lifestyle."}
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-200"></div>

                            {/* Interactive Buttons Section */}
                            <ProductActions product={product} />

                            {/* Trust Badges */}
                            <div className="mt-2 pt-5 border-t border-gray-100">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <i className="fa-solid fa-bag-shopping text-[#064e3b]"></i>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">Purchased</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                            <i className="fa-solid fa-truck-fast text-blue-600"></i>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">Dispatch</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                            <i className="fa-solid fa-circle-check text-green-600"></i>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">Delivered</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="container mx-auto max-w-7xl px-4 mt-12 mb-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Customer Reviews</h2>
                            <div className="flex items-center gap-2">
                                <div className="flex text-amber-400 text-lg">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star-half-stroke"></i>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">4.8/5</span>
                                <span className="text-sm text-gray-400">based on 12 reviews</span>
                            </div>
                        </div>
                        <button className="px-5 py-2.5 border-2 border-emerald-950 text-emerald-950 rounded-xl font-semibold text-sm hover:bg-emerald-950 hover:text-white transition-colors max-w-max">
                            Write a Review
                        </button>
                    </div>

                    {/* Review Cards */}
                    <div className="grid gap-4">
                        {/* Review 1 */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-bold">A</div>
                                    <span className="font-semibold text-gray-800 text-sm">Ahmed K.</span>
                                </div>
                                <div className="flex text-amber-400 text-xs gap-0.5">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Excellent quality! The product arrived in perfect condition. Very happy with my purchase. Will definitely order again.</p>
                        </div>

                        {/* Review 2 */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">S</div>
                                    <span className="font-semibold text-gray-800 text-sm">Sara M.</span>
                                </div>
                                <div className="flex text-amber-400 text-xs gap-0.5">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Great value for money. Fast delivery and the item looks exactly like the picture. Highly recommended!</p>
                        </div>

                        {/* Review 3 */}
                        <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-sm font-bold">R</div>
                                    <span className="font-semibold text-gray-800 text-sm">Raza B.</span>
                                </div>
                                <div className="flex text-amber-400 text-xs gap-0.5">
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-solid fa-star"></i>
                                    <i className="fa-regular fa-star"></i>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">Good product overall. Packaging was neat and delivery was on time. Would love to see more color options.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* You May Also Like Section */}
            <div className="bg-gray-50 border-t border-gray-100 py-10 md:py-14">
                <div className="container mx-auto max-w-7xl px-4">
                    <CategoryProductSlider
                        categoryId={categorySlug}
                        categoryLabel="You May Also Like"
                        products={products.filter(p => p.slug !== product.slug)}
                    />
                </div>
            </div>
        </div>
    );
}
