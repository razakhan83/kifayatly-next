import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// Utility for formatting a string to a unique URL-friendly slug
const slugify = (text) => {
    return (text || '').toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// GET all products - used by both Public Store and Admin
export async function GET() {
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ createdAt: -1 }).lean();

        // Format objectId to string securely
        const safeProducts = products.map(p => ({
            ...p,
            _id: p._id.toString(),
            id: p.slug || p._id.toString(),
            Category: Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []),
        }));

        return NextResponse.json({ success: true, data: safeProducts });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST new product - Protected Admin Route
export async function POST(req) {
    try {
        console.log('[API] POST /api/products - Received request');

        // Validation: Verify if the requester is the authorized Admin
        const session = await getServerSession(authOptions);
        console.log('[API] Session check:', session?.user?.email || 'No session');

        if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
            console.log('[API] ❌ Unauthorized access attempt');
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        console.log('[API] ✅ Admin verified, connecting to database...');
        await dbConnect();
        console.log('[API] ✅ Database connected');

        const body = await req.json();
        console.log('[API] Body received:', { Name: body.Name, Category: body.Category, Price: body.Price });

        let { Name, Description, Price, ImageURL, cloudinary_id, Category, stockQuantity, slug, isLive } = body;

        if (!Name || !Price || !Category) {
            console.log('[API] ❌ Validation failed: Missing required fields');
            return NextResponse.json({ success: false, message: 'Please provide Name, Price, and Category' }, { status: 400 });
        }

        // Normalize Category to always be an array
        const categoryArray = Array.isArray(Category) ? Category : [Category].filter(Boolean);

        // Auto-generate slug if missing or empty
        let uniqueSlug = slug || slugify(Name);
        const baseSlug = slugify(Name);
        let counter = 1;

        while (await Product.exists({ slug: uniqueSlug })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        console.log('[API] 🔗 Generated slug:', uniqueSlug);

        // Compute stock status from quantity
        const stockStatus = (stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock';
        console.log('[API] 📦 Stock Quantity:', stockQuantity, '-> Status:', stockStatus);

        const product = await Product.create({
            Name,
            Description,
            Price,
            ImageURL,
            Image: ImageURL, // Map ImageURL broadly for legacy data bindings
            cloudinary_id,
            Category: categoryArray,
            stockQuantity: stockQuantity || 0,
            StockStatus: stockStatus,
            slug: uniqueSlug, // Ensure slug is saved
            isLive: isLive === true || isLive === 'true' ? true : false,
        });

        console.log('[API] ✅ Product saved:', product._id);

        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error) {
        console.error('[API] ❌ Error:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
