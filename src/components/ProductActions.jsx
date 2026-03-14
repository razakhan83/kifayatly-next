'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Share2, Minus, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductActions({ product }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Small delay to allow react to render the spinner
        await new Promise(resolve => setTimeout(resolve, 300));
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setIsAdding(false);
    };

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const title = product.Name || product.name || 'Check out this product!';
        
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch (err) {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            } catch {
                toast.error('Failed to copy link.');
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                        onClick={decrement}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-gray-800">{quantity}</span>
                    <button
                        onClick={increment}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 h-12 text-base font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    size="lg"
                >
                    {isAdding ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                        <ShoppingCart className="w-5 h-5 mr-2" />
                    )}
                    Add to Cart
                </Button>
                <Button
                    onClick={handleShare}
                    variant="outline"
                    className="h-12 w-12 p-0 border-gray-200 hover:border-[#10b981] hover:text-[#10b981] cursor-pointer"
                    size="icon"
                >
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile Sticky Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 flex gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <button onClick={decrement} className="w-8 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{quantity}</span>
                    <button onClick={increment} className="w-8 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
                <Button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 h-10 text-sm font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isAdding ? (
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                    )}
                    Add to Cart
                </Button>
            </div>
        </div>
    );
}
