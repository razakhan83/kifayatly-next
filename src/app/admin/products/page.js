'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.Name?.toLowerCase().includes(q) ||
            p.Category?.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const handleDelete = async () => {
        if (!deleteModal.product) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${deleteModal.product._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setProducts(prev => prev.filter(p => p._id !== deleteModal.product._id));
                setDeleteModal({ open: false, product: null });
            } else {
                alert(data.message || 'Failed to delete product');
            }
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Something went wrong while deleting.');
        } finally {
            setDeleting(false);
        }
    };

    const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your store inventory ({products.length} total)
                    </p>
                </div>
                <Link
                    href="/admin/products/add"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0EB981] text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-[#0da874] active:scale-[0.97] transition-all"
                >
                    <i className="fa-solid fa-plus text-xs"></i>
                    Add New Product
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-5">
                <div className="relative max-w-sm">
                    <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* === MOBILE CARD VIEW (shown below md) === */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-16 h-16 rounded-lg bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                        <i className="fa-solid fa-box-open text-3xl text-gray-300 mb-3 block"></i>
                        <p className="text-gray-400 font-medium text-sm">
                            {searchQuery ? 'No products match your search.' : 'No products yet.'}
                        </p>
                        {!searchQuery && (
                            <Link href="/admin/products/add" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-[#0EB981]">
                                <i className="fa-solid fa-plus text-xs"></i> Add your first product
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex gap-3">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {product.ImageURL || product.Image ? (
                                        <img src={product.ImageURL || product.Image} alt={product.Name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <i className="fa-solid fa-image text-gray-300"></i>
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{product.Name}</h3>
                                    <p className="text-sm font-bold text-emerald-600 mt-0.5">{formatPrice(product.Price)}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-medium rounded">
                                            {product.Category}
                                        </span>
                                        {product.StockStatus === 'In Stock' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                <i className="fa-solid fa-circle text-[4px]"></i> In Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                                                <i className="fa-solid fa-circle text-[4px]"></i> Out
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                    <Link
                                        href={`/admin/products/edit/${product.slug || product._id}`}
                                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                    >
                                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModal({ open: true, product })}
                                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                                    >
                                        <i className="fa-solid fa-trash-can text-sm"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* === DESKTOP TABLE VIEW (hidden below md) === */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Price</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Category</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Status</th>
                                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-lg bg-gray-200 animate-pulse" /><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></div></td>
                                        <td className="px-5 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" /></td>
                                        <td className="px-5 py-4"><div className="h-4 w-16 mx-auto bg-gray-200 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3 block"></i>
                                        <p className="text-gray-400 font-medium">{searchQuery ? 'No products match your search.' : 'No products yet.'}</p>
                                        {!searchQuery && (
                                            <Link href="/admin/products/add" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#0EB981] hover:underline">
                                                <i className="fa-solid fa-plus text-xs"></i> Add your first product
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {product.ImageURL || product.Image ? (
                                                        <img src={product.ImageURL || product.Image} alt={product.Name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><i className="fa-solid fa-image text-gray-300 text-sm"></i></div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{product.Name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><span className="text-sm font-medium text-gray-700">{formatPrice(product.Price)}</span></td>
                                        <td className="px-5 py-4"><span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{product.Category}</span></td>
                                        <td className="px-5 py-4">
                                            {product.StockStatus === 'In Stock' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full"><i className="fa-solid fa-circle text-[5px]"></i> In Stock</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full"><i className="fa-solid fa-circle text-[5px]"></i> Out of Stock</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admin/products/edit/${product.slug || product._id}`} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit">
                                                    <i className="fa-solid fa-pen-to-square text-sm"></i>
                                                </Link>
                                                <button onClick={() => setDeleteModal({ open: true, product })} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                                                    <i className="fa-solid fa-trash-can text-sm"></i>
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

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-[scaleIn_0.2s_ease-out]">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-solid fa-trash-can text-red-500 text-lg"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Product?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-700">{deleteModal.product?.Name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, product: null })} disabled={deleting} className="flex-1 min-w-[140px] h-[45px] rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 min-w-[140px] h-[45px] rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                                {deleting ? (<><i className="fa-solid fa-spinner animate-spin text-xs"></i>Deleting...</>) : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
