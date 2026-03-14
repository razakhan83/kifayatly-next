import { cacheLife, cacheTag } from 'next/cache';
import dbConnect from './dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { normalizeProductImages } from './productImages';

export async function getProducts() {
    try {
        console.log('[DATA] getProducts: Initiating DB connection...');
        await dbConnect();
        console.log('[DATA] getProducts: Fetching from Product model...');
        const products = await Product.find({ isLive: true }).sort({ createdAt: -1 }).lean();
        console.log('[DATA] getProducts: Successfully fetched', products.length, 'items');
        return products.map(p => ({
            ...p,
            _id: p._id.toString(),
            id: p.slug || p._id.toString(),
            // Normalize Category to always be an array
            Category: Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []),
            Images: normalizeProductImages(p.Images, p.ImageURL || p.Image || ''),
        }));
    } catch (err) {
        console.error('[DATA] getProducts Error:', err.message);
        return [];
    }
}

export async function getCategories() {
    try {
        await dbConnect();
        const dbCategories = await Category.find({}).sort({ name: 1 }).lean();
        const normalizedDbCategories = dbCategories.map((category) => ({
            _id: category._id.toString(),
            id: category.slug || category.name.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: category.name,
            image: category.image || '',
            imagePublicId: category.imagePublicId || '',
        }));

        if (normalizedDbCategories.length > 0) {
            return normalizedDbCategories;
        }

        const products = await getProducts();
        const cats = new Set();
        products.forEach((product) => {
            const categories = Array.isArray(product.Category) ? product.Category : (product.Category ? [product.Category] : []);
            categories.forEach((cat) => {
                const trimmed = (cat || '').trim();
                if (trimmed) cats.add(trimmed);
            });
        });

        return Array.from(cats).sort().map((cat) => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
            image: '',
            imagePublicId: '',
        }));
    } catch (err) {
        console.error('Error getting categories:', err);
        return [];
    }
}
