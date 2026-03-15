import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import Category from '@/models/Category';
import CoverPhoto from '@/models/CoverPhoto';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import dbConnect from '@/lib/dbConnect';
import { optimizeCloudinaryUrl } from '@/lib/cloudinaryImage';
import {
  getProductCategories,
  getProductCategoryNames,
  hasProductCategory,
  normalizeCategoryId,
} from '@/lib/productCategories';
import { normalizeProductImages } from '@/lib/productImages';

const SETTINGS_KEY = 'site-settings';
const COVER_PHOTOS_KEY = 'home-cover-photos';

function normalizeMediaItem(item, sortOrder = 0, fallbackItem = null) {
  if ((!item || typeof item !== 'object') && (!fallbackItem || typeof fallbackItem !== 'object')) return null;

  const source = item && typeof item === 'object' ? item : {};
  const fallback = fallbackItem && typeof fallbackItem === 'object' ? fallbackItem : {};
  const url = String(source.url || source.image || fallback.url || fallback.image || '').trim();
  if (!url) return null;

  return {
    url: optimizeCloudinaryUrl(url),
    publicId: String(source.publicId || source.public_id || fallback.publicId || fallback.public_id || '').trim(),
    blurDataURL: String(source.blurDataURL || fallback.blurDataURL || '').trim(),
    sortOrder: Number(source.sortOrder ?? sortOrder) || 0,
  };
}

function serializeProduct(product) {
  const { Image, ImageURL, ...safeProduct } = product;

  return {
    ...safeProduct,
    _id: safeProduct._id.toString(),
    id: safeProduct.slug || safeProduct._id.toString(),
    slug: safeProduct.slug || safeProduct._id.toString(),
    Category: getProductCategories(safeProduct),
    Images: normalizeProductImages(safeProduct.Images),
    createdAt: safeProduct.createdAt ? new Date(safeProduct.createdAt).toISOString() : null,
    updatedAt: safeProduct.updatedAt ? new Date(safeProduct.updatedAt).toISOString() : null,
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

  const products = await Product.find({ isLive: true })
    .populate('Category')
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serializeProduct);
}

async function getAllProductsRaw() {
  'use cache';

  cacheLife('minutes');
  cacheTag('products');

  await dbConnect();

  const products = await Product.find({})
    .populate('Category')
    .sort({ createdAt: -1 })
    .lean();
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

async function getCoverPhotosRaw() {
  'use cache';

  cacheLife('hours');
  cacheTag('cover-photos');

  await dbConnect();

  let coverPhoto = await CoverPhoto.findOne({ singletonKey: COVER_PHOTOS_KEY }).lean();
  if (!coverPhoto) {
    coverPhoto = await CoverPhoto.create({ singletonKey: COVER_PHOTOS_KEY });
    coverPhoto = coverPhoto.toObject();
  }

  return Array.isArray(coverPhoto.slides)
    ? coverPhoto.slides
        .map((item, index) => {
          const desktopImage = normalizeMediaItem(
            item.desktopImage || {
              url: item.url,
              publicId: item.publicId,
              blurDataURL: item.blurDataURL,
            },
            index,
          );
          if (!desktopImage) return null;
          const tabletImage = normalizeMediaItem(item.tabletImage, index, desktopImage);
          const mobileImage = normalizeMediaItem(item.mobileImage, index, desktopImage);

          return {
            desktopImage,
            tabletImage,
            mobileImage,
            alt: String(item.alt || '').trim(),
            sortOrder: Number(item.sortOrder ?? index) || 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
}

async function getCategoriesRaw() {
  'use cache';

  cacheLife('hours');
  cacheTag('categories');

  await dbConnect();

  // Sort by sortOrder first (admin-defined order), then by name as fallback
  const dbCategories = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
  if (dbCategories.length > 0) {
    return dbCategories.map((category) => ({
      _id: category._id.toString(),
      id: category.slug || normalizeCategoryId(category.name),
      label: category.name,
      image: optimizeCloudinaryUrl(category.image || ''),
      imagePublicId: category.imagePublicId || '',
      blurDataURL: category.blurDataURL || '',
      sortOrder: category.sortOrder ?? 0,
    }));
  }

  const products = await getLiveProductsRaw();
  const categoryMap = new Map();

  for (const product of products) {
    for (const category of getProductCategories(product)) {
      const trimmed = String(category.name || '').trim();
      if (!trimmed) continue;
      const id = category.id || normalizeCategoryId(trimmed);
      if (!categoryMap.has(id)) {
        categoryMap.set(id, {
          id,
          label: trimmed,
          image: '',
          imagePublicId: '',
          blurDataURL: '',
        });
      }
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export async function getStoreSettings() {
  return getSettingsRaw();
}

export async function getAdminCoverPhotos() {
  await dbConnect();

  let coverPhoto = await CoverPhoto.findOne({ singletonKey: COVER_PHOTOS_KEY }).lean();
  if (!coverPhoto) {
    coverPhoto = await CoverPhoto.create({ singletonKey: COVER_PHOTOS_KEY });
    coverPhoto = coverPhoto.toObject();
  }

  return Array.isArray(coverPhoto.slides)
    ? coverPhoto.slides
        .map((item, index) => {
          const desktopImage = normalizeMediaItem(
            item.desktopImage || {
              url: item.url,
              publicId: item.publicId,
              blurDataURL: item.blurDataURL,
            },
            index,
          );
          if (!desktopImage) return null;
          const tabletImage = normalizeMediaItem(item.tabletImage, index, desktopImage);
          const mobileImage = normalizeMediaItem(item.mobileImage, index, desktopImage);

          return {
            desktopImage,
            tabletImage,
            mobileImage,
            alt: String(item.alt || '').trim(),
            sortOrder: Number(item.sortOrder ?? index) || 0,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
}

export async function getStoreCategories() {
  return getCategoriesRaw();
}

export async function getHomeSections() {
  const [products, categories, coverPhotos] = await Promise.all([
    getLiveProductsRaw(),
    getCategoriesRaw(),
    getCoverPhotosRaw(),
  ]);
  const featuredProducts = products.slice(0, 8).map(toProductCardItem);
  const sections = categories
    .map((category) => {
      const items = products
        .filter((product) => hasProductCategory(product, category.id))
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
    coverPhotos,
    featuredProducts,
    searchProducts: products.map(toProductCardItem),
    sections,
  };
}

export async function getProductsList({ category = 'all', search = '', sort = 'newest', page = 1, limit = 24 } = {}) {
  const products = await getLiveProductsRaw();
  const normalizedSearch = String(search || '').trim().toLowerCase();

  let searchMatched = products;

  if (normalizedSearch) {
    searchMatched = searchMatched.filter((product) => {
      const name = String(product.Name || '').toLowerCase();
      const categories = getProductCategoryNames(product).map((value) => String(value || '').toLowerCase());
      return name.includes(normalizedSearch) || categories.some((value) => value.includes(normalizedSearch));
    });
  }

  let filtered = searchMatched;

  if (category === 'new-arrivals') {
    filtered = [...filtered].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (category && category !== 'all') {
    filtered = filtered.filter((product) => hasProductCategory(product, category));
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
  for (const product of searchMatched) {
    for (const value of getProductCategories(product)) {
      const id = value.id || value._id;
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

    const product = await Product.findOne({ slug: productSlug, isLive: true }).populate('Category').lean();
    return product ? serializeProduct(product) : null;
  }

  const product = await getSingleProduct(safeSlug);
  return product ? toProductDetailView(product) : null;
}

export async function getRelatedProducts({ category = '', excludeSlug = '', limit = 8 } = {}) {
  const products = await getLiveProductsRaw();

  return products
    .filter((product) => product.slug !== excludeSlug)
    .filter((product) => {
      if (!category) return true;
      return hasProductCategory(product, category);
    })
    .slice(0, limit)
    .map(toProductCardItem);
}

export async function getAdminProducts() {
  await dbConnect();
  const products = await Product.find({}).populate('Category').sort({ createdAt: -1 }).lean();
  const serializedProducts = products.map(serializeProduct);
  return serializedProducts.map(toAdminProductRow);
}

export async function getOrdersList() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return orders.map(toOrderSummaryRow);
}

export async function getOrderById(id) {
  await dbConnect();
  const order = await Order.findById(String(id || '')).lean();
  return order ? toOrderSummaryRow(order) : null;
}

export async function getAdminDashboardData() {
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

export async function getAdminSettings() {
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
