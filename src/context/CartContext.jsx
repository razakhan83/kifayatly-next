'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

const CartContext = createContext();

export function CartProvider({ children }) {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

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

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.findIndex(item => (item.Name || item.name) === (product.Name || product.name));
            if (existing > -1) {
                const updated = [...prev];
                updated[existing].quantity = (updated[existing].quantity || 1) + 1;
                return updated;
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Globally trigger Toast component
        setIsToastVisible(false); // Reset animation if spam clicking
        setTimeout(() => {
            setToastMessage({
                title: product.Name || product.name || 'Item',
                onViewCart: () => router.push('/cart')
            });
            setIsToastVisible(true);
        }, 50);
    };

    const removeFromCart = (product) => {
        setCart(prev => prev.filter(item => (item.Name || item.name) !== (product.Name || product.name)));
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
        <CartContext.Provider value={{ cart, cartCount, addToCart, activeCategory, setActiveCategory, updateQuantity, removeFromCart, isInitialized }}>
            {children}

            {/* Global Add to Cart Popup */}
            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
            />
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
