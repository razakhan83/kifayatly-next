'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Box, ChartColumn, CircleDollarSign, Inbox, ShoppingBag, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

const statsConfig = [
  { title: 'Total Orders', icon: ShoppingBag, tone: 'bg-primary/10 text-primary' },
  { title: 'Revenue', icon: CircleDollarSign, tone: 'bg-accent/18 text-accent-foreground' },
  { title: 'Total Products', icon: Box, tone: 'bg-secondary text-secondary-foreground' },
  { title: 'Customers', icon: Users, tone: 'bg-muted text-foreground' },
];

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProductCount(data.data.length);
      })
      .catch((error) => console.error('Failed to fetch products for dashboard', error));
  }, []);

  const stats = [
    { value: '0', change: 'No orders yet' },
    { value: 'Rs. 0', change: 'Revenue starts after first order' },
    { value: productCount.toString(), change: 'Catalog entries currently saved' },
    { value: '0', change: 'Customers appear after first order' },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">A calm view of store activity, inventory, and next actions.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="surface-card rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="size-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h3 className="mt-2 text-2xl font-bold text-foreground">{stats[index].value}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{stats[index].change}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface-card rounded-xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ChartColumn className="size-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Sales Overview</h2>
              <p className="text-sm text-muted-foreground">Charts can be connected when order analytics are ready.</p>
            </div>
          </div>
          <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-center text-sm text-muted-foreground">
            Orders and revenue visuals will appear here.
          </div>
        </div>

        <div className="surface-card rounded-xl p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Inbox className="size-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Recent Orders</h2>
              <p className="text-sm text-muted-foreground">Your order feed will populate as customers purchase.</p>
            </div>
          </div>
          <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-center">
            <Inbox className="mb-3 size-8 text-muted-foreground" />
            <p className="font-medium text-foreground">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Once customers place orders, this panel becomes your quick overview.</p>
          </div>
        </div>
      </div>

      <div className="surface-card flex flex-col gap-4 rounded-xl p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Next step</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add products to shape the catalog before the first order arrives.</p>
        </div>
        <Link href="/admin/products/add">
          <Button>
            Add New Product
            <ArrowRight data-icon="inline-end" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
