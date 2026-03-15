'use server';

import { revalidateTag, updateTag } from 'next/cache';

import { isAdminEmail } from '@/lib/admin';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import { getServerSession } from 'next-auth';

const SETTINGS_KEY = 'site-settings';

function makeOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdminEmail(session.user?.email)) {
    throw new Error('Unauthorized access');
  }
  return session;
}

export async function toggleProductLiveAction(productId, nextValue) {
  await assertAdmin();
  await dbConnect();

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  product.isLive = Boolean(nextValue);
  await product.save();

  updateTag('products');
  if (product.slug) {
    updateTag(`product-${product.slug}`);
  }
  revalidateTag('admin-dashboard');

  return { success: true, isLive: product.isLive };
}

export async function deleteProductAction(productId) {
  await assertAdmin();
  await dbConnect();

  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  updateTag('products');
  if (product.slug) {
    updateTag(`product-${product.slug}`);
  }
  revalidateTag('admin-dashboard');

  return { success: true };
}

export async function saveStoreSettingsAction(nextSettings) {
  await assertAdmin();
  await dbConnect();

  const allowedFields = [
    'storeName',
    'supportEmail',
    'businessAddress',
    'whatsappNumber',
    'karachiDeliveryFee',
    'outsideKarachiDeliveryFee',
    'freeShippingThreshold',
    'announcementBarEnabled',
    'announcementBarText',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (nextSettings[field] !== undefined) {
      updates[field] = nextSettings[field];
    }
  }

  const settings = await Settings.findOneAndUpdate(
    { singletonKey: SETTINGS_KEY },
    { $set: updates },
    { new: true, upsert: true, runValidators: true },
  ).lean();

  updateTag('settings');

  return {
    success: true,
    data: {
      ...settings,
      _id: settings._id.toString(),
    },
  };
}

export async function submitOrderAction(input) {
  await dbConnect();

  const customerName = String(input?.customerName || '').trim();
  const customerPhone = String(input?.customerPhone || '').trim();
  const customerAddress = String(input?.customerAddress || '').trim();
  const items = Array.isArray(input?.items) ? input.items : [];
  const totalAmount = Number(input?.totalAmount || 0);
  const notes = String(input?.notes || '').trim();
  const whatsappNumber = String(input?.whatsappNumber || '').trim();

  if (!customerName || !customerPhone || !customerAddress || items.length === 0 || totalAmount <= 0) {
    throw new Error('Missing required checkout details');
  }

  const normalizedItems = items.map((item) => ({
    productId: String(item.productId || item.id || item.slug || ''),
    name: String(item.name || item.Name || ''),
    price: Number(item.price || item.Price || 0),
    quantity: Math.max(1, Number(item.quantity || 1)),
    image: String(item.image || item.imageUrl || ''),
  }));

  const order = await Order.create({
    orderId: makeOrderId(),
    customerName,
    customerPhone,
    customerAddress,
    items: normalizedItems,
    totalAmount,
    notes,
    status: 'Pending',
  });

  updateTag('orders');
  revalidateTag('admin-dashboard');

  const lines = [
    '*New Order from China Unique Store*',
    '',
    '*Customer Details*',
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    `Address: ${customerAddress}`,
  ];

  if (notes) {
    lines.push(`Notes: ${notes}`);
  }

  lines.push('', '*Items*');
  normalizedItems.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} - ${item.quantity} x Rs. ${item.price.toLocaleString('en-PK')}`);
  });
  lines.push('', `*Total:* Rs. ${totalAmount.toLocaleString('en-PK')}`);
  lines.push(`*Order ID:* ${order.orderId}`);

  return {
    success: true,
    orderId: order.orderId,
    whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}` : '',
  };
}
