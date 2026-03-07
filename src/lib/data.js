import { parse } from 'papaparse';

export const revalidate = 60; // Cash for 60 seconds

export async function getProducts() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQocF9BvexghWp_6R6KJCbfC_IhO1GpvzLBxEVimIXZ3gyh6vGRbxMI6EzbUV9_fEZMjVn7Z2B-XMdF/pub?output=csv';

    try {
        const res = await fetch(csvUrl, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error('Failed to fetch CSV');
        const csvText = await res.text();

        const parsed = parse(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        const slugify = (text) => (text || '').toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

        return parsed.data.map((p, index) => ({
            ...p,
            id: slugify(p.Name || p.name) + '-' + index, // ensuring uniqueness
            slug: slugify(p.Name || p.name) + '-' + index
        }));
    } catch (err) {
        console.error('Error fetching/parsing CSV:', err);
        return [];
    }
}

export async function getCategories() {
    const products = await getProducts();
    const cats = new Set();

    products.forEach(p => {
        const cat = (p.Category || p.category || '').trim();
        if (cat) cats.add(cat);
    });

    return Array.from(cats).sort().map(cat => ({
        id: cat.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
        label: cat,
    }));
}
