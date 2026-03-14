'use client';

import { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const CartContext = createContext();

function CartProviderContent({ children }) {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Provide robust exclusive setters to prevent both opening
    const openCart = () => {
        setIsSidebarOpen(false);
        setIsCartOpen(true);
    };

    const openSidebar = () => {
        setIsCartOpen(false);
        setIsSidebarOpen(true);
    };

    // Load from LocalStorage purely on client-side mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('kifayatly_cart');
            if (savedCart) setCart(JSON.parse(savedCart));
        } catch (e) {
            console.error("Failed to parse cart from local storage", e);
        }
        setIsInitialized(true);
    }, []);

    // Sync to LocalStorage on changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('kifayatly_cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

    const addToCart = (product, qtyToAdd = 1) => {
        const qtyNumber = Number(qtyToAdd) || 1;
        setCart(prev => {
            const existingIndex = prev.findIndex(item => (item.slug || item._id || item.id) === (product.slug || product._id || product.id));
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex] = { 
                    ...updated[existingIndex], 
                    quantity: (updated[existingIndex].quantity || 1) + qtyNumber 
                };
                return updated;
            }
            return [...prev, { ...product, quantity: qtyNumber }];
        });

        toast.success(`${product.Name || product.name} added to cart`, {
            duration: 3000,
            action: {
                label: 'View Cart',
                onClick: () => openCart()
            }
        });
    };

    const removeFromCart = (product) => {
        setCart(prev => prev.filter(item => (item.Name || item.name) !== (product.Name || product.name)));
        toast('Item removed from cart', {
            description: product.Name || product.name,
        });
    };

    const updateQuantity = (product, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(product);
            return;
        }
        setCart(prev => prev.map(item =>
            (item.Name || item.name) === (product.Name || product.name)
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    return (
        <CartContext.Provider value={{ 
            cart, cartCount, addToCart, 
            activeCategory, setActiveCategory, 
            updateQuantity, removeFromCart, 
            isInitialized, 
            isCartOpen, setIsCartOpen, openCart,
            isSidebarOpen, setIsSidebarOpen, openSidebar
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function CartProvider({ children }) {
    return (
        <Suspense fallback={null}>
            <CartProviderContent>{children}</CartProviderContent>
        </Suspense>
    );
}

export function useCart() {
    return useContext(CartContext);
}
