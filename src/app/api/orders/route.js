import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

// GET all orders — Protected Admin Route
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminEmail(session.user?.email)) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

        const safeOrders = orders.map(o => ({
            ...o,
            _id: o._id.toString(),
        }));

        return NextResponse.json({ success: true, data: safeOrders });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST new order — Public (called by checkout)
export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const { customerName, customerPhone, customerAddress, items, totalAmount, notes } = body;

        if (!customerName || !totalAmount || !items || items.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Customer name, items, and total amount are required.' },
                { status: 400 }
            );
        }

        // Generate unique order ID: ORD-XXXXXX
        const orderId = `ORD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        const order = await Order.create({
            orderId,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            notes,
            status: 'Pending',
        });

        return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
