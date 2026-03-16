import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Package, Calendar, Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LinkOrdersForm from '@/components/LinkOrdersForm';
import InvoiceButton from '@/components/InvoiceButtonWrapper';

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Shipped: 'bg-blue-100 text-blue-700 border-blue-200',
  Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const rawOrders = await getUserOrders(session.user.email);
  const orders = JSON.parse(JSON.stringify(rawOrders));

  return (
    <main className="min-h-screen bg-background pb-16 pt-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
          <p className="mt-2 text-muted-foreground">Track and manage your previous orders.</p>
        </div>

        {orders.length === 0 ? (
          <div className="space-y-8">
            <div className="surface-card rounded-xl p-12 text-center border border-dashed border-border">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">No orders yet</h2>
              <p className="mt-2 text-muted-foreground">You haven't placed any orders with this account yet.</p>
              <Button asChild className="mt-6">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t border-border">
              <LinkOrdersForm />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="surface-card overflow-hidden rounded-xl border border-border shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</span>
                      <span className="font-mono text-sm font-semibold text-foreground">{order.orderId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <InvoiceButton order={order} />
                    <Badge 
                      variant="outline" 
                      className={`px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-muted'}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted shrink-0">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">Rs. {(item.price * item.quantity).toLocaleString('en-PK')}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-primary">Rs. {order.totalAmount.toLocaleString('en-PK')}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
