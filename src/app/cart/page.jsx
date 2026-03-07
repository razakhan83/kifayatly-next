'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart } = useCart();

    const formatPrice = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 0;
        return Number(cleanNumbers);
    };

    const formatPriceToString = (raw) => {
        let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
        if (!cleanNumbers) return 'Rs. 0';
        return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
    };

    const subtotal = cart.reduce((total, item) => total + (formatPrice(item.Price || item.price) * item.quantity), 0);

    const handleWhatsAppCheckout = () => {
        if (cart.length === 0) return;
        let message = `*✨ New Order from Kifayatly Store ✨*\n\n`;
        message += `*Items:*\n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.Name || item.name} - ${item.quantity} x Rs. ${formatPrice(item.Price || item.price)}\n`;
        });
        message += `\n*Subtotal:* Rs. ${subtotal.toLocaleString('en-PK')}\n`;
        message += `*Shipping:* Free (Above 3000) or Rs. 200\n`;
        message += `\nPlease confirm my order.`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/923001234567?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 min-h-[60vh]">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold text-[#0A3D2E] m-0"><i className="fa-solid fa-cart-shopping mr-3"></i>Your Cart</h1>
                <Link href="/" className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-white bg-gray-100 hover:bg-red-500 transition-colors rounded-full shadow-sm">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </Link>
            </div>

            {cart.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="text-6xl text-gray-200 mb-4"><i className="fa-solid fa-bag-shopping"></i></div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Looks like you haven't added any premium items yet.</p>
                    <Link href="/" className="btn btn-primary bg-[#10b981] text-white py-3 px-8 rounded-full font-semibold inline-block hover:bg-[#0e9f6e] transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        <AnimatePresence initial={false}>
                            {cart.map((item, idx) => (
                                <motion.div
                                    key={`${item.id || item.Name || idx}`}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
                                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-100"
                                >
                                    <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                        {(item.Image || item.image) && (
                                            <Image
                                                src={item.Image || item.image}
                                                alt={item.Name || item.name || 'product'}
                                                fill
                                                sizes="96px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between h-full py-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.Name || item.name}</h3>
                                            <button
                                                onClick={() => removeFromCart(item)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                aria-label="Remove item"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-[#0A3D2E] font-bold">
                                                {formatPriceToString(item.Price || item.price)}
                                            </div>
                                            <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="fa-solid fa-minus text-xs"></i>
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                                >
                                                    <i className="fa-solid fa-plus text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96 shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Order Summary</h2>

                            <div className="flex justify-between items-center mb-4 text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">Rs. {subtotal.toLocaleString('en-PK')}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6 text-gray-600">
                                <span>Shipping</span>
                                <span>Calculated on WhatsApp</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-8">
                                <div className="flex justify-between items-center text-lg font-bold text-[#0A3D2E]">
                                    <span>Total</span>
                                    <span>Rs. {subtotal.toLocaleString('en-PK')}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                <button
                                    onClick={handleWhatsAppCheckout}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-transform hover:-translate-y-0.5 shadow-sm"
                                >
                                    <i className="fa-brands fa-whatsapp text-lg"></i> Order via WhatsApp
                                </button>

                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#0A3D2E] hover:bg-[#145e46] text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-transform hover:-translate-y-0.5 shadow-sm"
                                    onClick={() => alert("Standard checkout integrating in later phase - Use WhatsApp!")}
                                >
                                    Proceed to Checkout
                                </button>
                            </div>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                You will be redirected to WhatsApp to confirm your delivery details securely.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
