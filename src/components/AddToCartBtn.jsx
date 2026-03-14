'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function AddToCartBtn({ product, className }) {
    const { addToCart } = useCart();
    return (
        <Button
            onClick={() => addToCart(product)}
            className={className}
        >
            <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
        </Button>
    );
}
