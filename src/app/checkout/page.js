'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, ShieldCheck, Wallet } from 'lucide-react';

import { useCart } from '@/context/CartContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getPrimaryProductImage } from '@/lib/productImages';
import { getBlurPlaceholderProps } from '@/lib/imagePlaceholder';

const formatPrice = (raw) => {
  const clean = String(raw).replace(/[^\d.]/g, '');
  return clean ? Number(clean) : 0;
};

const formatPriceLabel = (raw) => `Rs. ${formatPrice(raw).toLocaleString('en-PK')}`;

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    altPhone: '',
    fullName: '',
    address: '',
    landmark: '',
    city: '',
    instructions: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsMounted(true);
    if (cart.length === 0) router.push('/');
  }, [cart, router]);

  const subtotal = cart.reduce((total, item) => total + formatPrice(item.Price || item.price) * item.quantity, 0);
  const shipping = 200;
  const total = subtotal > 3000 ? subtotal : subtotal + shipping;
  const isFreeShipping = subtotal > 3000;

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: '' }));
  }

  function validateForm() {
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full Name is required.';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone Number is required.';
    if (!formData.address.trim()) nextErrors.address = 'Complete Address is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    if (!validateForm()) return;

    let message = `*New Order from China Unique Store*\n\n`;
    message += `*Customer Details*\n`;
    message += `Name: ${formData.fullName}\n`;
    message += `Email: ${formData.email || 'N/A'}\n`;
    message += `Phone: ${formData.phone}\n`;
    if (formData.altPhone) message += `Alt Phone: ${formData.altPhone}\n`;
    message += `City: ${formData.city}\n`;
    message += `Address: ${formData.address}\n`;
    if (formData.landmark) message += `Landmark: ${formData.landmark}\n`;
    if (formData.instructions) message += `Instructions: ${formData.instructions}\n`;
    message += `\n*Items*\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.Name || item.name} - ${item.quantity} x ${formatPriceLabel(item.Price || item.price)}\n`;
    });
    message += `\n*Subtotal:* Rs. ${subtotal.toLocaleString('en-PK')}\n`;
    message += `*Shipping:* ${isFreeShipping ? 'Free' : 'Rs. 200'}\n`;
    message += `*Total:* Rs. ${total.toLocaleString('en-PK')}`;

    window.open(`https://wa.me/923001234567?text=${encodeURIComponent(message)}`, '_blank');
  }

  if (!isMounted || cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16 pt-8">
      <div className="container mx-auto max-w-6xl px-4">
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

        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Secure Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="surface-card rounded-xl p-6">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
                <MapPin className="size-5 text-primary" />
                Shipping Information
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Contact Details</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />
                      {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="altPhone">Alternate Phone</Label>
                      <Input id="altPhone" type="tel" name="altPhone" value={formData.altPhone} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Delivery Address</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} aria-invalid={Boolean(errors.fullName)} />
                      {errors.fullName ? <p className="text-xs text-destructive">{errors.fullName}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Select value={formData.city} onValueChange={(value) => handleChange({ target: { name: 'city', value } })}>
                        <SelectTrigger aria-invalid={Boolean(errors.city)}>
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other'].map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address *</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleChange} aria-invalid={Boolean(errors.address)} />
                    {errors.address ? <p className="text-xs text-destructive">{errors.address}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="landmark">Nearest Landmark</Label>
                    <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Notes</Label>
                    <Textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows={3} />
                  </div>
                </div>

                <button type="submit" id="checkout-submit" className="hidden" />
              </form>
            </section>

            <section className="surface-card rounded-xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <Wallet className="size-5 text-primary" />
                Payment Method
              </h2>
              <div className="rounded-xl border border-border bg-muted/35 p-4">
                <p className="font-medium text-foreground">Cash on Delivery</p>
                <p className="mt-1 text-sm text-muted-foreground">Pay with cash upon delivery.</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <section className="surface-panel sticky top-24 rounded-xl p-6">
              <h2 className="mb-6 flex items-center justify-between text-xl font-semibold text-foreground">
                <span>Order Summary</span>
                <span className="rounded-lg border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground">{cart.length} Items</span>
              </h2>

              <div className="mb-6 max-h-[320px] space-y-4 overflow-y-auto pr-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted">
                      {getPrimaryProductImage(item)?.url ? (
                        <Image
                          src={getPrimaryProductImage(item).url}
                          alt={item.Name || item.name}
                          fill
                          className="object-cover"
                          {...getBlurPlaceholderProps(getPrimaryProductImage(item).blurDataURL)}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{item.Name || item.name}</h4>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold text-primary">{formatPriceLabel(item.Price || item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="mb-4" />

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">Rs. {subtotal.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping Estimate</span>
                  <span className="font-semibold text-foreground">{isFreeShipping ? 'FREE' : `Rs. ${shipping.toLocaleString('en-PK')}`}</span>
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="mb-8 flex items-center justify-between text-xl font-bold text-foreground">
                <span>Total</span>
                <span>Rs. {total.toLocaleString('en-PK')}</span>
              </div>

              <Button className="w-full" size="lg" onClick={() => document.getElementById('checkout-submit').click()}>
                Complete Order
              </Button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-primary" />
                Securing your order via encrypted chat
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
