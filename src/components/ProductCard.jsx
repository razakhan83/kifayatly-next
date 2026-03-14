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
        <Card className={`rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md border-0 ring-0 hover:ring-0 flex flex-col group h-full will-change-transform ${className}`}>
            <Link href={`/products/${product.slug || product._id || product.id}`} className="block relative aspect-square bg-gray-50 cursor-pointer w-full overflow-hidden">
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
            <CardContent className="p-3 flex flex-col flex-grow justify-between gap-2">
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
                <div className="mt-auto">
                    <p className="text-lg font-extrabold text-[#0A3D2E] mb-2">
                        {formatPrice(product.Price || product.price)}
                    </p>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-full font-semibold text-sm h-[44px] md:h-[48px] cursor-pointer shadow-none hover:shadow-sm"
                        size="default"
                    >
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
