import { connection } from 'next/server';
import { Suspense } from 'react';
import { requireAdmin } from '@/lib/requireAdmin';
import AdminUsersClient from './AdminUsersClient';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const metadata = {
  title: 'User Management | Admin',
};

export default async function AdminUsersPage() {
  await connection();
  await requireAdmin();

  return <UsersContent />;
}

async function UsersContent() {
  await dbConnect();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  
  const serializedUsers = users.map(user => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }));

  return (
    <Suspense fallback={null}>
      <AdminUsersClient initialUsers={serializedUsers} />
    </Suspense>
  );
}
