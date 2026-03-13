'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, updateQuantity, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
    const drawerRef = useRef(null);

    // Trap scroll on body when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen]);

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

    const handleWhatsAppDirectCheckout = () => {
        if (cart.length === 0) return;
        let message = `*✨ New Order from Kifayatly Store ✨*\n\n`;
        message += `*Items:*\n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.Name || item.name} - ${item.quantity} x Rs. ${formatPrice(item.Price || item.price)}\n`;
        });
        message += `\n*Subtotal:* Rs. ${subtotal.toLocaleString('en-PK')}\n`;
        message += `*Shipping:* Calculated at checkout\n`;
        message += `\nPlease confirm my order.`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/923052622043?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
    };

    const handleCheckoutRoute = () => {
        setIsCartOpen(false);
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setIsCartOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [setIsCartOpen]);


    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60] origin-center"
                        onClick={() => setIsCartOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Cart Drawer Panel */}
                    <motion.div
                        ref={drawerRef}
                        style={{ willChange: 'transform' }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-[320px] max-w-[100vw] sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold text-[#0A3D2E] m-0 flex items-center gap-2">
                                <i className="fa-solid fa-cart-shopping"></i> Your Cart
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white bg-gray-100 hover:bg-red-500 transition-colors rounded-full"
                                aria-label="Close Cart"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        {/* Body / Items */}
                        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 flex flex-col gap-4">
                            {cart.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-center py-12 flex flex-col items-center justify-center h-full"
                                >
                                    <div className="text-6xl text-gray-200 mb-4"><i className="fa-solid fa-bag-shopping"></i></div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
                                    <p className="text-sm text-gray-500 mb-6">Looks like you haven't added any premium items yet.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        className="btn btn-primary bg-[#10b981] text-white py-2 px-6 rounded-full font-semibold inline-block hover:bg-[#0e9f6e] transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </motion.div>
                            ) : (
                                <AnimatePresence>
                                    {cart.map((item, idx) => (
                                        <motion.div
                                            key={`${item.id || item.Name || idx}`}
                                            layout
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                                            transition={{ duration: 0.25 }}
                                            className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group"
                                        >
                                            <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                {(item.Image || item.image) && (
                                                    <Image
                                                        src={item.Image || item.image}
                                                        alt={item.Name || item.name || 'product'}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="pr-6">
                                                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight mb-1">{item.Name || item.name}</h3>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="text-[#0A3D2E] font-bold text-sm shrink-0">
                                                        {formatPriceToString(item.Price || item.price)}
                                                    </div>
                                                    <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 overflow-hidden h-7 shrink-0 ml-2">
                                                        <button
                                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                                            className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                                        >
                                                            <i className="fa-solid fa-minus text-[10px]"></i>
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-semibold text-gray-800">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                                            className="w-7 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                                        >
                                                            <i className="fa-solid fa-plus text-[10px]"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 p-2"
                                                aria-label="Remove item"
                                            >
                                                <i className="fa-solid fa-trash-can text-sm"></i>
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer / Checkout */}
                        {cart.length > 0 && (
                            <motion.div layout className="p-4 border-t bg-gray-50 pb-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-2 text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">Rs. {subtotal.toLocaleString('en-PK')}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 text-gray-600 text-sm">
                                    <span>Shipping</span>
                                    <span>Calculated on WhatsApp</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-[#0A3D2E] mb-4">
                                    <span>Total</span>
                                    <span>Rs. {subtotal.toLocaleString('en-PK')}</span>
                                </div>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleWhatsAppDirectCheckout}
                                        className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0e9f6e] text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
                                    >
                                        <i className="fa-brands fa-whatsapp text-xl"></i> Order on WhatsApp
                                    </button>
                                    <Link
                                        href="/checkout"
                                        onClick={handleCheckoutRoute}
                                        className="w-full flex items-center justify-center gap-2 bg-[#0A3D2E] hover:bg-[#082e22] text-white py-3 px-4 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer"
                                    >
                                        Proceed to Checkout <i className="fa-solid fa-arrow-right ml-1"></i>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
