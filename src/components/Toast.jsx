'use client';
import { useEffect, useState } from 'react';

export default function Toast({ message, isVisible, onClose }) {
    const [shouldRender, setRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setRender(true);
            // Auto close after 4 seconds (matching CSS animation progress duration)
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const handleAnimationEnd = (e) => {
        // Determine if hiding animation just finished
        if (!isVisible && e.animationName.includes('toastSlideOut')) {
            setRender(false);
        }
    };

    if (!shouldRender) return null;

    return (
        <div className="toast-container">
            <div
                className={`toast-card ${!isVisible ? 'slide-out' : ''}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="toast-icon-circle">
                    <i className="fa-solid fa-check"></i>
                </div>
                <div className="toast-info">
                    <strong>{message?.title || 'Product Name'}</strong>
                    <span>Added to your collection</span>
                </div>
                <button
                    onClick={() => {
                        onClose();
                        // In a real app, this would trigger open cart drawer
                        if (message?.onViewCart) message.onViewCart();
                    }}
                    className="toast-view-cart"
                >
                    View Cart
                </button>
                <div className="toast-progress"></div>
            </div>
        </div>
    );
}
