import { cacheLife, cacheTag } from 'next/cache';
import dbConnect from './dbConnect';
import Product from '@/models/Product';

export async function getProducts() {
    'use cache';
    cacheLife('minutes');
    cacheTag('products');
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
        }));
    } catch (err) {
        console.error('[DATA] getProducts Error:', err.message);
        return [];
    }
}

export async function getCategories() {
    'use cache';
    cacheTag('categories');
    try {
        const products = await getProducts();
        const cats = new Set();

        products.forEach(p => {
            const categories = Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []);
            categories.forEach(cat => {
                const trimmed = (cat || '').trim();
                if (trimmed) cats.add(trimmed);
            });
        });

        return Array.from(cats).sort().map(cat => ({
            id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
            label: cat,
        }));
    } catch (err) {
        console.error('Error getting categories:', err);
        return [];
    }
}
