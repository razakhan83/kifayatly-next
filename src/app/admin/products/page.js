import { Suspense } from 'react';
import { connection } from 'next/server';

import { getAdminProducts } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';

import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage() {
  await connection();
  await requireAdmin();

  return <ProductsContent />;
}

async function ProductsContent() {
  const products = await getAdminProducts();
  return <AdminProductsClient initialProducts={products} />;
}
