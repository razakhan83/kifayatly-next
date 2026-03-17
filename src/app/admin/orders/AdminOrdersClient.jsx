'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Receipt, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const statusVariant = {
  Pending: 'accent',
  Confirmed: 'primary',
  'In Process': 'secondary',
  Delivered: 'emerald',
  'Delivery Address Issue': 'destructive',
  Returned: 'outline',
};

const ITEMS_PER_PAGE = 10;

const formatPrice = (price) => `PKR ${Number(price).toLocaleString('en-PK')}`;
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });

export default function AdminOrdersClient({ initialOrders }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    let result = initialOrders;

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [initialOrders, statusFilter, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage customer orders ({filteredOrders.length} found).</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by Order ID or Customer Name..."
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={statusFilter} 
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="In Process">In Process</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Delivery Address Issue">Address Issue</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-10 px-3 gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Receipt className="mx-auto mb-4 size-10 text-muted-foreground/40" />
                    <p className="text-lg font-semibold text-foreground">No orders found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                    {(searchQuery || statusFilter !== 'all') && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                        Clear all filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="transition-colors hover:bg-muted/35">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-foreground">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{formatDate(order.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[order.status] || 'secondary'} className="rounded-full px-3">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all hover:bg-primary hover:text-white hover:border-primary shadow-sm"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
            </span>{' '}
            of <span className="font-medium text-foreground">{filteredOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="size-9 font-medium"
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
