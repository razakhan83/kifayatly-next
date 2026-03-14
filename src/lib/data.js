import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import Category from '@/models/Category';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import dbConnect from '@/lib/dbConnect';
import { normalizeProductImages } from '@/lib/productImages';

const SETTINGS_KEY = 'site-settings';

export function normalizeCategoryId(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
    id: product.slug || product._id.toString(),
    slug: product.slug || product._id.toString(),
    Category: Array.isArray(product.Category) ? product.Category : product.Category ? [product.Category] : [],
    Images: normalizeProductImages(product.Images, product.ImageURL || product.Image || ''),
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
  };
}

function toProductCardItem(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Price: Number(product.Price || 0),
    Description: product.Description || '',
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    createdAt: product.createdAt,
    isLive: product.isLive !== false,
  };
}

function toProductDetailView(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Description: product.Description || '',
    Price: Number(product.Price || 0),
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    stockQuantity: Number(product.stockQuantity || 0),
    createdAt: product.createdAt,
  };
}

function toAdminProductRow(product) {
  return {
    id: product.id,
    _id: product._id,
    slug: product.slug,
    Name: product.Name,
    Price: Number(product.Price || 0),
    Category: product.Category,
    Images: product.Images,
    StockStatus: product.StockStatus || 'Out of Stock',
    stockQuantity: Number(product.stockQuantity || 0),
    isLive: product.isLive !== false,
    createdAt: product.createdAt,
  };
}

function toOrderSummaryRow(order) {
  return {
    _id: order._id.toString(),
    orderId: order.orderId,
    customerName: order.customerName,
    customerPhone: order.customerPhone || '',
    customerAddress: order.customerAddress || '',
    totalAmount: Number(order.totalAmount || 0),
    status: order.status,
    notes: order.notes || '',
    items: Array.isArray(order.items) ? order.items : [],
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
  };
}

async function getLiveProductsRaw() {
  'use cache';

  cacheLife('minutes');
  cacheTag('products');

  await dbConnect();

  const products = await Product.find({ isLive: true }).sort({ createdAt: -1 }).lean();
  return products.map(serializeProduct);
}

async function getAllProductsRaw() {
  'use cache';

  cacheLife('minutes');
  cacheTag('products');

  await dbConnect();

  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  return products.map(serializeProduct);
}

async function getSettingsRaw() {
  'use cache';

  cacheLife('hours');
  cacheTag('settings');

  await dbConnect();

  let settings = await Settings.findOne({ singletonKey: SETTINGS_KEY }).lean();
  if (!settings) {
    settings = await Settings.create({ singletonKey: SETTINGS_KEY });
    settings = settings.toObject();
  }

  return {
    _id: settings._id.toString(),
    storeName: settings.storeName || 'China Unique Store',
    supportEmail: settings.supportEmail || '',
    businessAddress: settings.businessAddress || '',
    whatsappNumber: settings.whatsappNumber || '923001234567',
    karachiDeliveryFee: Number(settings.karachiDeliveryFee || 200),
    outsideKarachiDeliveryFee: Number(settings.outsideKarachiDeliveryFee || 250),
    freeShippingThreshold: Number(settings.freeShippingThreshold || 3000),
    announcementBarEnabled: settings.announcementBarEnabled ?? true,
    announcementBarText: settings.announcementBarText || '',
  };
}

async function getCategoriesRaw() {
  'use cache';

  cacheLife('hours');
  cacheTag('categories');

  await dbConnect();

  const dbCategories = await Category.find({}).sort({ name: 1 }).lean();
  if (dbCategories.length > 0) {
    return dbCategories.map((category) => ({
      _id: category._id.toString(),
      id: category.slug || normalizeCategoryId(category.name),
      label: category.name,
      image: category.image || '',
      imagePublicId: category.imagePublicId || '',
    }));
  }

  const products = await getLiveProductsRaw();
  const categoryMap = new Map();

  for (const product of products) {
    for (const category of product.Category) {
      const trimmed = String(category || '').trim();
      if (!trimmed) continue;
      const id = normalizeCategoryId(trimmed);
      if (!categoryMap.has(id)) {
        categoryMap.set(id, {
          id,
          label: trimmed,
          image: '',
          imagePublicId: '',
        });
      }
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export async function getStoreSettings() {
  return getSettingsRaw();
}

export async function getStoreCategories() {
  return getCategoriesRaw();
}

export async function getHomeSections() {
  const [products, categories] = await Promise.all([getLiveProductsRaw(), getCategoriesRaw()]);
  const featuredProducts = products.slice(0, 8).map(toProductCardItem);
  const sections = categories
    .map((category) => {
      const items = products
        .filter((product) =>
          product.Category.some((value) => normalizeCategoryId(value) === category.id),
        )
        .slice(0, 12)
        .map(toProductCardItem);

      return {
        category,
        products: items,
      };
    })
    .filter((section) => section.products.length > 0);

  return {
    categories,
    featuredProducts,
    searchProducts: products.map(toProductCardItem),
    sections,
  };
}

export async function getProductsList({ category = 'all', search = '', sort = 'newest', page = 1, limit = 24 } = {}) {
  const products = await getLiveProductsRaw();
  const normalizedSearch = String(search || '').trim().toLowerCase();

  let filtered = products;

  if (normalizedSearch) {
    filtered = filtered.filter((product) => {
      const name = String(product.Name || '').toLowerCase();
      const categories = product.Category.map((value) => String(value || '').toLowerCase());
      return name.includes(normalizedSearch) || categories.some((value) => value.includes(normalizedSearch));
    });
  }

  if (category === 'new-arrivals') {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (category && category !== 'all') {
    filtered = filtered.filter((product) =>
      product.Category.some((value) => normalizeCategoryId(value) === category),
    );
  }

  const sorted = [...filtered];
  if (sort === 'price-low') {
    sorted.sort((a, b) => Number(a.Price || 0) - Number(b.Price || 0));
  } else if (sort === 'price-high') {
    sorted.sort((a, b) => Number(b.Price || 0) - Number(a.Price || 0));
  } else if (sort === 'az') {
    sorted.sort((a, b) => String(a.Name || '').localeCompare(String(b.Name || '')));
  } else if (sort === 'za') {
    sorted.sort((a, b) => String(b.Name || '').localeCompare(String(a.Name || '')));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 24);
  const start = (safePage - 1) * safeLimit;
  const items = sorted.slice(start, start + safeLimit).map(toProductCardItem);

  const categoryCounts = new Map();
  for (const product of filtered) {
    for (const value of product.Category) {
      const id = normalizeCategoryId(value);
      categoryCounts.set(id, (categoryCounts.get(id) || 0) + 1);
    }
  }

  const availableCategories = (await getCategoriesRaw()).filter(
    (entry) => (categoryCounts.get(entry.id) || 0) > 0,
  );

  return {
    items,
    total: sorted.length,
    page: safePage,
    limit: safeLimit,
    hasMore: start + safeLimit < sorted.length,
    activeCategory: category,
    searchTerm: search,
    sort,
    categories: availableCategories,
  };
}

export async function getProductBySlug(slug) {
  const safeSlug = String(slug || '').trim();
  if (!safeSlug) return null;

  async function getSingleProduct(productSlug) {
    'use cache';

    cacheLife('minutes');
    cacheTag('products');
    cacheTag(`product-${productSlug}`);

    await dbConnect();

    const product = await Product.findOne({ slug: productSlug, isLive: true }).lean();
    return product ? serializeProduct(product) : null;
  }

  const product = await getSingleProduct(safeSlug);
  return product ? toProductDetailView(product) : null;
}

export async function getRelatedProducts({ category = '', excludeSlug = '', limit = 8 } = {}) {
  const products = await getLiveProductsRaw();
  const normalizedCategory = normalizeCategoryId(category);

  return products
    .filter((product) => product.slug !== excludeSlug)
    .filter((product) => {
      if (!normalizedCategory) return true;
      return product.Category.some((value) => normalizeCategoryId(value) === normalizedCategory);
    })
    .slice(0, limit)
    .map(toProductCardItem);
}

export async function getAdminProducts() {
  const products = await getAllProductsRaw();
  return products.map(toAdminProductRow);
}

export async function getOrdersList() {
  async function getOrders() {
    'use cache';

    cacheLife('minutes');
    cacheTag('orders');

    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return orders.map(toOrderSummaryRow);
  }

  return getOrders();
}

export async function getOrderById(id) {
  async function getOrder(orderId) {
    'use cache';

    cacheLife('minutes');
    cacheTag('orders');
    cacheTag(`order-${orderId}`);

    await dbConnect();
    const order = await Order.findById(orderId).lean();
    return order ? toOrderSummaryRow(order) : null;
  }

  return getOrder(String(id || ''));
}

export async function getAdminDashboardData() {
  async function getDashboard() {
    'use cache';

    cacheLife('minutes');
    cacheTag('admin-dashboard');
    cacheTag('orders');
    cacheTag('products');

    await dbConnect();

    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      liveProducts,
      revenueAgg,
      customersAgg,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Pending' }),
      Product.countDocuments(),
      Product.countDocuments({ isLive: true }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$customerPhone' } }, { $count: 'count' }]),
      Order.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return {
      summary: {
        totalOrders,
        pendingOrders,
        totalProducts,
        liveProducts,
        totalRevenue: Number(revenueAgg[0]?.total || 0),
        totalCustomers: Number(customersAgg[0]?.count || 0),
      },
      recentOrders: recentOrders.map(toOrderSummaryRow),
    };
  }

  return getDashboard();
}
