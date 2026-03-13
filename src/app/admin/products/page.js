'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data.map(p => ({
                    ...p,
                    Category: Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : [])),
                })));
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.Name?.toLowerCase().includes(q) ||
            (Array.isArray(p.Category) ? p.Category.some(c => c.toLowerCase().includes(q)) : p.Category?.toLowerCase().includes(q))
        );
    }, [products, searchQuery]);

    const handleDelete = async () => {
        if (!deleteModal.product) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${deleteModal.product._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== deleteModal.product._id));
                setDeleteModal({ open: false, product: null });
                showToast(`Product "${deleteModal.product.Name}" has been deleted.`, 'error');
            } else {
                showToast(data.message || 'Failed to delete product', 'error');
            }
        } catch {
            showToast('Something went wrong while deleting.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleLive = async (product) => {
        setTogglingId(product._id);
        try {
            const res = await fetch(`/api/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isLive: !product.isLive }),
            });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isLive: !p.isLive } : p));
                showToast(`"${product.Name}" is now ${!product.isLive ? 'Live' : 'Draft'}.`, 'success');
            } else {
                showToast(data.message || 'Toggle failed', 'error');
            }
        } catch {
            showToast('Something went wrong.', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;

    return (
        <div className="pb-24 md:pb-0">
            <Toast
                isVisible={toast.visible}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {/* Page Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Products</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Manage inventory ({products.length} total · {products.filter(p => p.isLive).length} live)
                    </p>
                </div>
                <Link
                    href="/admin/products/add"
                    className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0EB981] text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-[#0da874] active:scale-[0.97] transition-all"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Add New Product
                </Link>
                <Link
                    href="/admin/products/add"
                    className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#0EB981] text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center z-50 active:scale-95 transition-transform"
                >
                    <i className="fa-solid fa-plus text-xl"></i>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
                <div className="relative max-w-sm">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Search products or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                    />
                </div>
            </div>

            {/* === MOBILE CARD VIEW === */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse h-32" />
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center">
                        <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-4 block"></i>
                        <p className="text-gray-400 font-medium">No products found.</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-200">
                                        {product.ImageURL || product.Image ? (
                                            <img src={product.ImageURL || product.Image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100"><i className="fa-solid fa-image text-gray-300 text-xl"></i></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">{product.Name}</h3>
                                        <p className="text-lg font-black text-emerald-600 mt-1">{formatPrice(product.Price)}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {(Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : (product.category ? [product.category] : []))).filter(Boolean).map((c, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Live Toggle */}
                                <div className="flex items-center justify-between mt-3 px-1">
                                    <span className={`text-xs font-bold ${product.isLive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {product.isLive ? '🟢 Live' : '🔴 Draft'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleLive(product)}
                                        disabled={togglingId === product._id}
                                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${product.isLive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                        aria-label="Toggle Live"
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${product.isLive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3 mt-4">
                                    <Link
                                        href={`/admin/products/edit/${product._id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-50 text-blue-600 font-bold rounded-xl active:bg-blue-100 transition-all active:scale-[0.98] text-sm"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        Edit Product
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModal({ open: true, product })}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-red-50 text-red-500 font-bold rounded-xl active:bg-red-100 transition-all active:scale-[0.98] text-sm"
                                    >
                                        <i className="fa-solid fa-trash-can"></i>
                                        Delete Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* === DESKTOP TABLE VIEW === */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Product</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Price</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Category</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Stock</th>
                                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Live</th>
                                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-6 py-4 animate-pulse"><div className="h-12 bg-gray-50 rounded-xl" /></td></tr>
                                ))
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {product.ImageURL || product.Image ? (
                                                        <img src={product.ImageURL || product.Image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">?</div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 line-clamp-2 max-w-[180px] leading-tight">{product.Name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="text-sm font-bold text-emerald-600">{formatPrice(product.Price)}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                                                {(Array.isArray(product.Category) ? product.Category : [product.Category]).filter(Boolean).map((c, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase">{c}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.StockStatus === 'In Stock' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                                                    <i className="fa-solid fa-circle text-[4px]"></i> In Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">
                                                    <i className="fa-solid fa-circle text-[4px]"></i> Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleLive(product)}
                                                disabled={togglingId === product._id}
                                                className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50 ${product.isLive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                                title={product.isLive ? 'Click to set Draft' : 'Click to go Live'}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${product.isLive ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/admin/products/edit/${product._id}`}
                                                    className="flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                                                    title="Edit"
                                                >
                                                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                                                    <span className="hidden lg:inline">Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, product })}
                                                    className="flex items-center justify-center gap-2 p-2 bg-red-50 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                                    title="Delete"
                                                >
                                                    <i className="fa-solid fa-trash-can text-xs"></i>
                                                    <span className="hidden lg:inline">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal({ open: false, product: null })}></div>
                    <div className="relative bg-white w-[90%] max-w-[400px] p-6 rounded-2xl shadow-2xl z-[1001]">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <i className="fa-solid fa-trash-can text-red-500 text-xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Are you sure?</h3>
                            <p className="text-sm text-gray-500">
                                You are about to delete{' '}
                                <span className="font-semibold text-gray-700">{deleteModal.product?.Name}</span>.
                                <br />This action cannot be undone.
                            </p>
                            <div className="flex flex-row justify-center gap-4 mt-6 w-full">
                                <button
                                    onClick={() => setDeleteModal({ open: false, product: null })}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
