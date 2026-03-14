'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
    const shipping = 200;
    const total = subtotal > 3000 ? subtotal : subtotal + shipping;
    const isFreeShipping = subtotal > 3000;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Checkout</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <h1 className="text-3xl font-extrabold text-[#0A3D2E] tracking-tight mb-8">Secure Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeInUp">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-7 space-y-6">
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-white/40">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-location-dot text-[#10b981]"></i> Shipping Information
                            </h2>
                            <form onSubmit={handlePlaceOrder} className="space-y-6">
                                {/* Contact Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="03XX XXXXXXX"
                                                className={errors.phone ? 'border-red-500 focus-visible:ring-red-200' : ''}
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="altPhone">Alternate Phone <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                            <Input
                                                id="altPhone"
                                                type="tel"
                                                name="altPhone"
                                                value={formData.altPhone}
                                                onChange={handleChange}
                                                placeholder="03XX XXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Shipping Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name *</Label>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className={errors.fullName ? 'border-red-500 focus-visible:ring-red-200' : ''}
                                            />
                                            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City *</Label>
                                            <Select
                                                value={formData.city}
                                                onValueChange={(value) => {
                                                    setFormData(prev => ({ ...prev, city: value }));
                                                    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                                                }}
                                            >
                                                <SelectTrigger className={errors.city ? 'border-red-500 focus:ring-red-200' : ''}>
                                                    <SelectValue placeholder="Select City" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Karachi">Karachi</SelectItem>
                                                    <SelectItem value="Lahore">Lahore</SelectItem>
                                                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                                                    <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                                                    <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                                                    <SelectItem value="Multan">Multan</SelectItem>
                                                    <SelectItem value="Peshawar">Peshawar</SelectItem>
                                                    <SelectItem value="Quetta">Quetta</SelectItem>
                                                    <SelectItem value="Other">Other (Specify in Notes)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Complete Address *</Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House #, Street #, Sector/Block, Area"
                                            className={errors.address ? 'border-red-500 focus-visible:ring-red-200' : ''}
                                        />
                                        {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="landmark">Nearest Landmark <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                        <Input
                                            id="landmark"
                                            type="text"
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            placeholder="e.g. Near KFC, Behind City School"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instructions">Special Notes / Instructions <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                        <Textarea
                                            id="instructions"
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Any specific delivery instructions?"
                                        />
                                    </div>
                                </div>

                                {/* Submit button (hidden, triggered by the visible one in summary) */}
                                <button type="submit" id="checkout-submit" className="hidden" />
                            </form>
                        </section>

                        <section className="bg-white/50 p-6 rounded-2xl border border-gray-200 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white z-0"></div>
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

                            <Separator className="mb-4" />

                            <div className="space-y-3 mb-6">
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

                            <Separator className="mb-4" />

                            <div className="mb-8">
                                <div className="flex justify-between items-center text-xl font-black text-[#0A3D2E]">
                                    <span>Total</span>
                                    <span>Rs. {total.toLocaleString('en-PK')}</span>
                                </div>
                                <p className="text-right text-[10px] text-gray-400 mt-1">Including all taxes</p>
                            </div>

                            <Button 
                                onClick={() => document.getElementById('checkout-submit').click()}
                                className="w-full h-14 text-lg font-black tracking-wide uppercase cursor-pointer"
                                size="lg"
                            >
                                <i className="fa-solid fa-check-circle text-2xl mr-3"></i>
                                Complete Order
                            </Button>
                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5 font-medium">
                                <i className="fa-solid fa-shield-halved text-[#10b981]"></i> Securing your order via encrypted chat
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
