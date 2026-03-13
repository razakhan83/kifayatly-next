import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

// GET a single product by ID or slug - Protected Admin Route
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        let product = await Product.findById(id).lean().catch(() => null);
        if (!product) {
            product = await Product.findOne({ slug: id }).lean();
        }
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const safe = {
            ...product,
            _id: product._id.toString(),
            Category: Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : []),
        };

        return NextResponse.json({ success: true, data: safe });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT update a product - Protected Admin Route
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const { Name, Description, Price, ImageURL, cloudinary_id, Category, stockQuantity, isLive } = body;

        const updateData = {};

        if (Name !== undefined) updateData.Name = Name;
        if (Description !== undefined) updateData.Description = Description;
        if (Price !== undefined) updateData.Price = Number(Price);
        if (ImageURL !== undefined) {
            updateData.ImageURL = ImageURL;
            updateData.Image = ImageURL;
        }
        if (cloudinary_id !== undefined) updateData.cloudinary_id = cloudinary_id;
        if (Category !== undefined) {
            updateData.Category = Array.isArray(Category) ? Category : [Category].filter(Boolean);
        }
        if (stockQuantity !== undefined) {
            updateData.stockQuantity = Number(stockQuantity) || 0;
            updateData.StockStatus = (Number(stockQuantity) || 0) > 0 ? 'In Stock' : 'Out of Stock';
        }
        if (isLive !== undefined) updateData.isLive = Boolean(isLive);

        const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean().catch(async () => {
            // Try by slug
            return await Product.findOneAndUpdate({ slug: id }, updateData, { new: true }).lean();
        });

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { ...updated, _id: updated._id.toString() } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE a product by ID - Protected Admin Route
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        
        // Find product first to get cloudinary_id
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        // Delete from Cloudinary if cloudinary_id exists
        if (product.cloudinary_id) {
            try {
                const { v2: cloudinary } = await import('cloudinary');
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                await cloudinary.uploader.destroy(product.cloudinary_id);
            } catch (cloudErr) {
                console.error('Cloudinary delete error:', cloudErr);
            }
        }

        await Product.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
