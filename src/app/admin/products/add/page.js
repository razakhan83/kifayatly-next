import AddProductClient from './AddProductClient';
import { requireAdmin } from '@/lib/requireAdmin';

export default async function AddProductPage() {
  await requireAdmin();
  return <AddProductClient />;
}
