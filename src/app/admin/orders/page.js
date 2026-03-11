'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
    };
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const statusStyles = {
        Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
        Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const statusDots = {
        Pending: 'text-yellow-500',
        Shipped: 'text-blue-500',
        Delivered: 'text-emerald-500',
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Track and manage customer orders ({orders.length} total)
                    </p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {/* Order ID — hidden on very small screens */}
                                <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Order ID
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Customer
                                </th>
                                {/* Date & Time — hidden on very small screens */}
                                <th className="hidden sm:table-cell text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Date & Time
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Total
                                </th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Status
                                </th>
                                {/* Action — hidden on very small screens */}
                                <th className="hidden sm:table-cell text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="hidden sm:table-cell px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="hidden sm:table-cell px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                                        <td className="px-4 py-4"><div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" /></td>
                                        <td className="hidden sm:table-cell px-4 py-4"><div className="h-8 w-24 mx-auto bg-gray-200 rounded-lg animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <i className="fa-solid fa-receipt text-4xl text-gray-300 mb-3 block"></i>
                                        <p className="text-gray-400 font-medium">No orders yet.</p>
                                        <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers place them.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                                        {/* Order ID — hidden on small screens */}
                                        <td className="hidden sm:table-cell px-5 py-4">
                                            <span className="text-sm font-mono font-semibold text-gray-900">{order.orderId}</span>
                                        </td>

                                        {/* Customer — always visible, on mobile also shows date below */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <span className="text-sm font-semibold text-gray-700">{order.customerName}</span>
                                                {/* Show date inline on mobile */}
                                                <span className="sm:hidden block text-[11px] text-gray-400 mt-1">{formatDate(order.createdAt)}</span>
                                            </div>
                                        </td>

                                        {/* Date & Time — hidden on small screens */}
                                        <td className="hidden sm:table-cell px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800">{formatDate(order.createdAt)}</span>
                                                <span className="text-xs text-gray-400">{formatTime(order.createdAt)}</span>
                                            </div>
                                        </td>

                                        {/* Total — always visible */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-emerald-600">{formatPrice(order.totalAmount)}</span>
                                        </td>

                                        {/* Status — always visible, tappable on mobile to view details */}
                                        <td className="px-5 py-4">
                                            <Link href={`/admin/orders/${order._id}`} className="sm:pointer-events-none">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${statusStyles[order.status] || statusStyles.Pending}`}>
                                                    <i className={`fa-solid fa-circle text-[5px] ${statusDots[order.status] || statusDots.Pending}`}></i>
                                                    {order.status}
                                                </span>
                                            </Link>
                                        </td>

                                        {/* Action — hidden on small screens */}
                                        <td className="hidden sm:table-cell px-5 py-4">
                                            <div className="flex items-center justify-center">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-all hover:scale-105"
                                                    title="View Details"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
