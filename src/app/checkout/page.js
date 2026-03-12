'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
    const { cart } = useCart();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        altPhone: '',
        fullName: '',
        address: '',
        landmark: '',
        city: '',
        instructions: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setIsMounted(true);
        if (cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

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
    const shipping = 200; // Mock shipping logic if under thresholds
    const total = subtotal > 3000 ? subtotal : subtotal + shipping;
    const isFreeShipping = subtotal > 3000;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error dynamically
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
        if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required.';
        if (!formData.address.trim()) newErrors.address = 'Complete Address is required.';
        if (!formData.city.trim() || formData.city === '') newErrors.city = 'City is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        let message = `*✨ New Order from Kifayatly Store ✨*\n\n`;
        message += `*Customer Details:*\n`;
        message += `Name: ${formData.fullName}\n`;
        message += `Email: ${formData.email || 'N/A'}\n`;
        message += `Phone: ${formData.phone}\n`;
        if (formData.altPhone) message += `Alt Phone: ${formData.altPhone}\n`;
        message += `City: ${formData.city}\n`;
        message += `Address: ${formData.address}\n`;
        if (formData.landmark) message += `Landmark: ${formData.landmark}\n`;
        if (formData.instructions) message += `\n*Notes:*\n${formData.instructions}\n\n`;
        else message += `\n`;
        
        message += `*Items:*\n`;
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.Name || item.name} - ${item.quantity} x ${formatPriceToString(item.Price || item.price)}\n`;
        });
        
        message += `\n*Subtotal:* Rs. ${subtotal.toLocaleString('en-PK')}\n`;
        message += `*Shipping:* ${isFreeShipping ? 'Free (Above 3000)' : 'Rs. 200'}\n`;
        message += `*Total Amount:* Rs. ${total.toLocaleString('en-PK')}\n`;
        message += `\nPlease confirm my order.`;

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/923001234567?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
        
        // Optional: Clear cart logic could go here after successful routing
    };

    if (!isMounted || cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#0A3D2E]"></i>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#0A3D2E] transition-colors"><i className="fa-solid fa-house"></i> Home</Link>
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    <Link href="/products" className="hover:text-[#0A3D2E] transition-colors">Products</Link>
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    <span className="font-semibold text-gray-800">Checkout</span>
                </div>

                <h1 className="text-3xl font-extrabold text-[#0A3D2E] tracking-tight mb-8">Secure Checkout</h1>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                    {/* Left Column - Form */}
                    <div className="lg:col-span-7 space-y-6">
                        <section className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-location-dot text-[#10b981]"></i> Shipping Information
                            </h2>
                            <form className="space-y-6">
                                {/* Contact Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-gray-700">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl outline-none transition-colors focus:bg-white focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full p-3 bg-white/50 border rounded-xl outline-none transition-colors focus:bg-white ${errors.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20'}`}
                                                placeholder="03XX XXXXXXX"
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-sm font-semibold text-gray-700">Alternate Phone <span className="text-gray-400 font-normal">(Optional)</span></label>
                                            <input 
                                                type="tel" 
                                                name="altPhone"
                                                value={formData.altPhone}
                                                onChange={handleChange}
                                                className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl outline-none transition-colors focus:bg-white focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20"
                                                placeholder="03XX XXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-200" />

                                {/* Shipping Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                                            <input 
                                                type="text" 
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className={`w-full p-3 bg-white/50 border rounded-xl outline-none transition-colors focus:bg-white ${errors.fullName ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20'}`}
                                                placeholder="John Doe"
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-gray-700">City *</label>
                                            <select 
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className={`w-full p-3 bg-white/50 border rounded-xl outline-none transition-colors focus:bg-white appearance-none ${errors.city ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20'}`}
                                            >
                                                <option value="" disabled>Select City</option>
                                                <option value="Karachi">Karachi</option>
                                                <option value="Lahore">Lahore</option>
                                                <option value="Islamabad">Islamabad</option>
                                                <option value="Rawalpindi">Rawalpindi</option>
                                                <option value="Faisalabad">Faisalabad</option>
                                                <option value="Multan">Multan</option>
                                                <option value="Peshawar">Peshawar</option>
                                                <option value="Quetta">Quetta</option>
                                                <option value="Other">Other (Specify in Notes)</option>
                                            </select>
                                            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Complete Address *</label>
                                        <input 
                                            type="text" 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className={`w-full p-3 bg-white/50 border rounded-xl outline-none transition-colors focus:bg-white ${errors.address ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20'}`}
                                            placeholder="House #, Street #, Sector/Block, Area"
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Nearest Landmark <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input 
                                            type="text" 
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl outline-none transition-colors focus:bg-white focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20"
                                            placeholder="e.g. Near KFC, Behind City School"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700">Special Notes / Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <textarea 
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl outline-none transition-colors resize-none focus:bg-white focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#0A3D2E]/20"
                                            placeholder="Any specific delivery instructions?"
                                        ></textarea>
                                    </div>
                                </div>
                            </form>
                        </section>

                        <section className="bg-white/50 p-6 rounded-2xl border border-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
                            <div className="relative z-10 w-full">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-wallet text-[#10b981]"></i> Payment Method
                                </h2>
                                <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50/50 flex flex-col w-full relative">
                                    <label className="flex items-center gap-3 cursor-pointer w-full">
                                        <input type="radio" checked readOnly className="w-5 h-5 text-emerald-600 border-emerald-300 focus:ring-emerald-500" />
                                        <span className="text-gray-800 font-semibold text-lg">Cash on Delivery</span>
                                    </label>
                                    <p className="text-sm text-gray-500 ml-8 mt-1">Pay with cash upon delivery.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-5 sticky top-24">
                        <section className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A3D2E] to-[#10b981]"></div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                                <span>Order Summary</span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">{cart.length} Items</span>
                            </h2>

                            <div className="max-h-[300px] overflow-y-auto pr-2 mb-6 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-16 relative bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                                            {(item.Image || item.image) && (
                                                <Image 
                                                    src={item.Image || item.image} 
                                                    alt={item.Name || item.name} 
                                                    fill 
                                                    className="object-cover"
                                                    unoptimized 
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{item.Name || item.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                <span className="text-sm font-bold text-[#0A3D2E]">{formatPriceToString(item.Price || item.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">Rs. {subtotal.toLocaleString('en-PK')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping Estimate</span>
                                    {isFreeShipping ? (
                                        <span className="font-bold text-[#10b981]">FREE</span>
                                    ) : (
                                        <span className="font-semibold text-gray-600">Rs. {shipping.toLocaleString('en-PK')}</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mb-8">
                                <div className="flex justify-between items-center text-xl font-black text-[#0A3D2E]">
                                    <span>Total</span>
                                    <span>Rs. {total.toLocaleString('en-PK')}</span>
                                </div>
                                <p className="text-right text-[10px] text-gray-400 mt-1">Including all taxes</p>
                            </div>

                            <button 
                                onClick={handlePlaceOrder}
                                className="w-full bg-[#0A3D2E] hover:bg-[#10b981] text-white py-4 px-6 rounded-xl font-black tracking-wide text-lg transition-transform hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-3 mt-auto uppercase"
                            >
                                <i className="fa-solid fa-check-circle text-2xl"></i>
                                Complete Order
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5 font-medium">
                                <i className="fa-solid fa-shield-halved text-[#10b981]"></i> Securing your order via encrypted chat
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
