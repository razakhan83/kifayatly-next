'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Receipt, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

  const statusVariant = {
    Pending: 'accent',
    Shipped: 'secondary',
    Delivered: 'emerald',
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">Track and manage customer orders ({orders.length} total).</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-10 animate-pulse rounded-xl bg-muted" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Receipt className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="font-medium text-foreground">No orders yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">Orders will appear here once customers place them.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-muted/35">
                    <td className="px-4 py-4 text-sm font-mono font-semibold text-foreground">{order.orderId}</td>
                    <td className="px-4 py-4">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{order.customerName}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground sm:hidden">{formatDate(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{formatDate(order.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-primary">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[order.status] || 'secondary'}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="size-4" />
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
