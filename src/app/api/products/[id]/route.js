import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getProductCategories } from '@/lib/productCategories';
import { normalizeProductImages } from '@/lib/productImages';
import { ensureProductImagesBlur } from '@/lib/serverImageBlur';

export async function GET(_request, { params }) {
    try {
        await dbConnect();

        const { id } = await params;
        const product = await Product.findById(id).populate('Category').lean();

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        const { Image, ImageURL, ...safeProduct } = product;

        return NextResponse.json({
            success: true,
            data: {
                ...safeProduct,
                _id: safeProduct._id.toString(),
                id: safeProduct.slug || safeProduct._id.toString(),
                Category: getProductCategories(safeProduct),
                Images: normalizeProductImages(safeProduct.Images),
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
            revalidateTag('products', 'max');
            if (existingProduct.slug) {
                revalidateTag(`product-${existingProduct.slug}`, 'max');
            }
            revalidateTag('admin-dashboard', 'max');

            return NextResponse.json({ success: true, data: existingProduct });
        }

        const categoryInput = Array.isArray(body.Category)
            ? body.Category
            : [body.Category].filter(Boolean);
        const categories = await Category.find({ _id: { $in: categoryInput } }, '_id').lean();
        const validCategoryIdSet = new Set(categories.map((category) => category._id.toString()));
        const categoryArray = categoryInput.filter((id) => validCategoryIdSet.has(String(id)));

        if (categoryArray.length === 0) {
            return NextResponse.json({ success: false, message: 'Please provide valid categories' }, { status: 400 });
        }

        const normalizedImages = await ensureProductImagesBlur(normalizeProductImages(body.Images));
        const stockQuantity = Number(body.stockQuantity) || 0;
        const previousSlug = existingProduct.slug;

        existingProduct.Name = body.Name;
        existingProduct.Description = body.Description;
        existingProduct.Price = Number(body.Price);
        existingProduct.Images = normalizedImages;
        existingProduct.Category = categoryArray;
        existingProduct.stockQuantity = stockQuantity;
        existingProduct.StockStatus = stockQuantity > 0 ? 'In Stock' : 'Out of Stock';
        existingProduct.isLive = body.isLive === true || body.isLive === 'true';

        await existingProduct.save();
        await existingProduct.populate('Category');
        revalidateTag('products', 'max');
        if (previousSlug) {
            revalidateTag(`product-${previousSlug}`, { expire: 0 });
            revalidatePath(`/products/${previousSlug}`);
        }
        if (existingProduct.slug) {
            revalidateTag(`product-${existingProduct.slug}`, { expire: 0 });
            revalidatePath(`/products/${existingProduct.slug}`);
        }
        revalidateTag('admin-dashboard', 'max');
        revalidatePath('/admin/products');
        revalidatePath('/products');

        return NextResponse.json({
            success: true,
            data: {
                ...existingProduct.toObject(),
                _id: existingProduct._id.toString(),
                id: existingProduct.slug || existingProduct._id.toString(),
                Category: getProductCategories(existingProduct.toObject()),
                Images: normalizeProductImages(existingProduct.Images),
            },
        });
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

        revalidateTag('products', 'max');
        if (deletedProduct.slug) {
            revalidateTag(`product-${deletedProduct.slug}`, { expire: 0 });
            revalidatePath(`/products/${deletedProduct.slug}`);
        }
        revalidateTag('admin-dashboard', 'max');
        revalidatePath('/admin/products');
        revalidatePath('/products');

        return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
