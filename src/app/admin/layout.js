'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import {
  Box,
  ChartColumn,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: ChartColumn, match: (pathname) => pathname === '/admin' },
  { href: '/admin/products', label: 'Products', icon: Box, match: (pathname) => pathname.startsWith('/admin/products') },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, match: (pathname) => pathname.startsWith('/admin/orders') },
  { href: '/admin/settings', label: 'Settings', icon: Settings, match: (pathname) => pathname.startsWith('/admin/settings') },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="surface-card rounded-xl px-8 py-6 text-center">
          <p className="text-base font-semibold text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="surface-card w-full max-w-md rounded-xl p-8 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please sign in with the authorized store manager account.</p>
          <Button className="mt-6 w-full" onClick={() => signIn('google')}>
            Continue with Google
          </Button>
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-primary px-4 py-5 text-primary-foreground">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-white/10">
          <Store className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em]">China Unique</p>
          <p className="text-xs text-primary-foreground/70">Admin workspace</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                active ? 'bg-white text-primary' : 'text-primary-foreground/72 hover:bg-white/10 hover:text-primary-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <NextTopLoader
        color="#0A3D2E"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl
        showSpinner={false}
        easing="ease"
        speed={200}
      />

      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-border bg-primary md:block">{sidebar}</aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 md:px-8">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu />
                </Button>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Dashboard</p>
                  <p className="text-xs text-muted-foreground">Welcome back, {session?.user?.name || 'Admin'}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                <LogOut data-icon="inline-start" />
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[min(92vw,20rem)] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Navigate between admin sections.</SheetDescription>
          </SheetHeader>
          {sidebar}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <X className="size-4" />
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
