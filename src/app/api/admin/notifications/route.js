import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

// GET recent notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH mark as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, all } = await req.json();
    await dbConnect();

    if (all) {
      await Notification.updateMany({ isRead: false }, { isRead: true });
    } else if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
