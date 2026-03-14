import { Suspense } from 'react';

import { AdminTableSkeleton } from '@/components/AdminDashboardSkeleton';
import { getStoreSettings } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';

import AdminSettingsClient from './AdminSettingsClient';

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <Suspense fallback={<AdminTableSkeleton rows={4} />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const settings = await getStoreSettings();
  return <AdminSettingsClient initialSettings={settings} />;
}
