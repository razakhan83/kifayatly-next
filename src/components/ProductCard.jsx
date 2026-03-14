'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getCategoryColor } from '@/lib/categoryColors';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const formatPrice = (raw) => {
    let cleanNumbers = String(raw).replace(/[^\d.]/g, '');
    if (!cleanNumbers) return 'Rs. 0';
    return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
};

export default function ProductCard({ product, className = '' }) {
    const { addToCart } = useCart();
    const categoryLabel = Array.isArray(product.Category) ? product.Category[0] : (product.Category || product.category || '');
    const colors = getCategoryColor(categoryLabel);

    return (
        <Card className={`bg-white min-h-[380px] w-full rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(10,61,46,0.12)] border-0 ring-0 hover:ring-0 flex flex-col justify-between group will-change-transform ${className}`}>
            <Link href={`/products/${product.slug || product._id || product.id}`} className="block relative aspect-square bg-gray-50/50 cursor-pointer w-full overflow-hidden shrink-0">
                {categoryLabel && (
                    <Badge
                        variant="outline"
                        className={`absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wide shadow-sm ${colors.badge}`}
                    >
                        {categoryLabel}
                    </Badge>
                )}
                {(product.Image || product.image) && (
                    <Image
                        src={product.Image || product.image}
                        alt={product.Name || product.name || 'product'}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                )}
            </Link>
            <CardContent className="p-4 flex flex-col flex-grow justify-between relative">
                <Link href={`/products/${product.slug || product._id || product.id}`} className="block cursor-pointer">
                    <h3 className="text-sm font-semibold text-gray-800 mb-0.5 leading-tight hover:text-[#10b981] transition-colors line-clamp-1 h-5 overflow-hidden" title={product.Name || product.name}>
                        {product.Name || product.name || 'Unknown'}
                    </h3>
                </Link>
                {product.Description || product.description ? (
                    <p className="text-xs text-gray-500 line-clamp-2 h-8 overflow-hidden mb-1">
                        {product.Description || product.description}
                    </p>
                ) : (
                    <div className="h-8 mb-1"></div>
                )}
                <div className="mt-4 mb-[2px]">
                    <p className="text-xl font-extrabold text-[#072C21] mb-3 tracking-tight">
                        {formatPrice(product.Price || product.price)}
                    </p>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-full text-sm font-semibold rounded-xl bg-[#0A3D2E] hover:bg-[#10b981] text-white transition-colors duration-300"
                        size="default"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
