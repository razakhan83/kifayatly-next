import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { normalizeProductImages } from '@/lib/productImages';

export async function GET(_request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const product = await Product.findById(id).lean();

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...product,
                _id: product._id.toString(),
                id: product.slug || product._id.toString(),
                Category: Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : []),
                Images: normalizeProductImages(product.Images, product.ImageURL || product.Image || ''),
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminEmail(session.user?.email)) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const existingProduct = await Product.findById(id);

        if (!existingProduct) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        if (Object.keys(body).length === 1 && Object.prototype.hasOwnProperty.call(body, 'isLive')) {
            existingProduct.isLive = body.isLive === true || body.isLive === 'true';
            await existingProduct.save();

            return NextResponse.json({ success: true, data: existingProduct });
        }

        const categoryArray = Array.isArray(body.Category)
            ? body.Category
            : [body.Category].filter(Boolean);

        const normalizedImages = normalizeProductImages(body.Images, body.ImageURL || '');
        const primaryImage = normalizedImages[0]?.url || body.ImageURL || '';
        const stockQuantity = Number(body.stockQuantity) || 0;

        existingProduct.Name = body.Name;
        existingProduct.Description = body.Description;
        existingProduct.Price = Number(body.Price);
        existingProduct.ImageURL = primaryImage;
        existingProduct.Image = primaryImage;
        existingProduct.Images = normalizedImages;
        existingProduct.Category = categoryArray;
        existingProduct.stockQuantity = stockQuantity;
        existingProduct.StockStatus = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
        existingProduct.isLive = body.isLive === true || body.isLive === 'true';

        await existingProduct.save();

        return NextResponse.json({ success: true, data: existingProduct });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE a product by ID - Protected Admin Route
export async function DELETE(_request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !isAdminEmail(session.user?.email)) {
            return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
