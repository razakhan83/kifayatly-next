'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Share2 } from 'lucide-react';

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [copied, setCopied] = useState(false);

    const handleMinus = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handlePlus = () => {
        setQuantity(quantity + 1);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const productName = product.Name || product.name || 'Product';
    const productPrice = product.Price || product.price || '';
    const whatsappMessage = encodeURIComponent(
        `Hi, I would like to order:\n*${productName}*\nQuantity: ${quantity}\nPrice: ${productPrice}\n\nPlease confirm availability.`
    );

    return (
        <>
            {/* ═══ INLINE SECTION (inside the details column) ═══ */}
            <div className="flex flex-col gap-4">
                {/* Top Row: Qty (Mobile Friendly) + Share */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Quantity</span>
                        <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50/50 h-10 w-28">
                            <button
                                onClick={handleMinus}
                                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors text-lg font-bold"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <div className="flex-1 h-full flex items-center justify-center font-bold text-gray-800 text-base border-x border-gray-100">
                                {quantity}
                            </div>
                            <button
                                onClick={handlePlus}
                                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors text-lg font-bold"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleShare}
                        className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-800 transition-all text-xs font-bold"
                        aria-label="Share product"
                    >
                        <Share2 size={14} />
                        <span>Share</span>
                    </button>
                </div>

                {/* Primary Actions (Desktop Layout) */}
                <div className="hidden md:flex flex-col gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="shake-cart-btn w-full h-[56px] bg-[#064e3b] text-white rounded-xl font-bold text-lg tracking-wide hover:bg-[#065f46] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-cart-shopping text-xl"></i>
                        ADD TO CART
                    </button>
                    <a
                        href={`https://wa.me/923001234567?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-[56px] bg-white border-2 border-gray-100 text-gray-700 rounded-xl font-bold text-lg tracking-wide hover:border-[#25D366] hover:text-[#25D366] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                    >
                        <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]"></i>
                        Order via WhatsApp
                    </a>
                </div>
            </div>

            {/* ═══ STICKY BOTTOM BAR (mobile only) ═══ */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-2 z-50 border-t grid grid-cols-2 gap-2 shadow-2xl rounded-t-3xl md:hidden">
                <button
                    onClick={handleAddToCart}
                    className="shake-cart-btn bg-white text-[#0EB981] border-2 border-[#0EB981] rounded-xl h-12 flex items-center justify-center font-semibold text-sm gap-2"
                >
                    <i className="fa-solid fa-cart-shopping text-sm"></i>
                    ADD TO CART {quantity > 1 ? `(${quantity})` : ''}
                </button>
                <a
                    href={`https://wa.me/923001234567?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0EB981] text-white rounded-xl h-12 flex items-center justify-center font-semibold text-sm gap-2"
                >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    Order on WhatsApp
                </a>
            </div>

            {/* ═══ "LINK COPIED" TOAST ═══ */}
            {copied && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 animate-[springSlideDown_0.4s_ease-out]">
                    <i className="fa-solid fa-check-circle text-emerald-400"></i>
                    Link Copied!
                </div>
            )}
        </>
    );
}
