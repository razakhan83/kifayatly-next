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
            const existing = prev.findIndex(item => (item.slug || item._id) === (product.slug || product._id));
            if (existing > -1) {
                const updated = [...prev];
                // User requirement: Reset/Set to selected qty rather than totalizing exponentially
                updated[existing] = { ...updated[existing], quantity: qtyNumber };
                return updated;
            }
            return [...prev, { ...product, quantity: qtyNumber }];
        });

        // Trigger Toast Pop-up safely avoiding immediate overlaps
        setIsToastVisible(false); // Unmount actively running ones first
        setTimeout(() => {
            setToastMessage({ title: `${product.Name || product.name} added to cart`, _trigger: Date.now() });
            setIsToastVisible(true);
        }, 50); // slight debounce for framer motion exit map
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
        <CartContext.Provider value={{ 
            cart, cartCount, addToCart, 
            activeCategory, setActiveCategory, 
            updateQuantity, removeFromCart, 
            isInitialized, 
            isCartOpen, setIsCartOpen, openCart,
            isSidebarOpen, setIsSidebarOpen, openSidebar
        }}>
            {children}

            <Toast
                message={toastMessage}
                isVisible={isToastVisible}
                onClose={() => setIsToastVisible(false)}
                action={{
                    label: 'View Cart',
                    onClick: openCart
                }}
            />
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
