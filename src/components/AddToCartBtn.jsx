'use client';

import { useCart } from '@/context/CartContext';

export default function AddToCartBtn({ product, className }) {
    const { addToCart } = useCart();
    return (
        <button
            onClick={() => addToCart(product)}
            className={className}
        >
            <i className="fa-solid fa-cart-plus mr-2"></i> Add to Cart
        </button>
    );
}
