import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Return only the fields needed for the search autocomplete to keep it fast and light
        const products = await Product.find(
            { isLive: { $ne: false } }, // Only fetch live products for public search
            'Name name Image image Category category slug _id'
        )
        .sort({ createdAt: -1 })
        .limit(200) // Limit to 200 to prevent massive payloads on global mount, search autocomplete mostly needs just recent
        .lean();

        // Format objectId to string securely
        const safeProducts = products.map(p => ({
            ...p,
            _id: p._id.toString(),
            id: p.slug || p._id.toString(),
            Category: Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : (p.category ? [p.category] : [])),
        }));

        return NextResponse.json(safeProducts);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch search products' }, { status: 500 });
    }
}
