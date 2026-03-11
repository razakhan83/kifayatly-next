import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

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
