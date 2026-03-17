import { connection } from 'next/server';
import { getOrdersList } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import AdminOrdersClient from './AdminOrdersClient';

export default async function AdminOrdersPage() {
  await connection();
  await requireAdmin();

  const orders = await getOrdersList();

  return <AdminOrdersClient initialOrders={orders} />;
}
