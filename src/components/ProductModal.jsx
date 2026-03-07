'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function ProductModal({ product, onClose }) {
    const { addToCart } = useCart();

    if (!product) return null;

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 relative bg-gray-50 aspect-square md:aspect-auto md:min-h-[300px]">
                        {(product.Image || product.image) ? (
                            <Image
                                src={product.Image || product.image}
                                alt={product.Name || product.name || 'Product'}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <i className="fa-solid fa-image text-6xl opacity-20"></i>
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <div className="mb-3">
                            <span className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.Category || product.category || 'Premium Item'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                            {product.Name || product.name}
                        </h2>
                        <div className="text-3xl font-extrabold text-[#1f2937] mb-4 tracking-tight">
                            {formatPrice(product.Price || product.price)}
                        </div>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                            {product.Description || product.description || "Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind."}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                            <button
                                onClick={() => {
                                    addToCart(product);
                                    onClose();
                                }}
                                className="flex-1 bg-[#0A3D2E] text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors hover:bg-[#10b981] shadow-md flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-cart-plus"></i> Add to Cart
                            </button>

                            <a
                                href={`https://wa.me/923001234567?text=${encodeURIComponent(`Hi Kifayatly Store, I would like to order:\n\n*${product.Name || product.name || 'Premium Item'}*\nPrice: ${formatPrice(product.Price || product.price)}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-[#25D366] text-white py-3 px-4 rounded-lg font-bold text-sm transition-colors hover:bg-[#1ebe5d] shadow-md flex items-center justify-center gap-2"
                            >
                                <i className="fa-brands fa-whatsapp flex-shrink-0 text-xl"></i> Order via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
