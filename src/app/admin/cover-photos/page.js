import { Suspense } from 'react';
import { connection } from 'next/server';

import { AdminTableSkeleton } from '@/components/AdminDashboardSkeleton';
import { getAdminCoverPhotos } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';

import CoverPhotosClient from './CoverPhotosClient';

export default async function AdminCoverPhotosPage() {
  await connection();
  await requireAdmin();

  return (
    <Suspense fallback={<AdminTableSkeleton rows={4} />}>
      <CoverPhotosContent />
    </Suspense>
  );
}

async function CoverPhotosContent() {
  const coverPhotos = await getAdminCoverPhotos();
  return <CoverPhotosClient initialSlides={coverPhotos} />;
}
