import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/data';
import { Button } from '@/components/ui/button';
import LinkOrdersForm from '@/components/LinkOrdersForm';
import OrdersClient from './OrdersClient';

export const metadata = {
  title: 'My Orders | Kifayatly',
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
          <OrdersClient initialOrders={orders} />
        )}
      </div>
    </main>
  );
}
