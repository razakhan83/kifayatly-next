'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { isAdminEmail, normalizeEmail, normalizePhone, getPhoneRegex } from '@/lib/admin';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { generateOrderEmailHtml } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

const SETTINGS_KEY = 'site-settings';

function normalizeCoverImages(input) {
  if (!Array.isArray(input)) return [];

  return input
    .map((item, index) => {
      const normalizeAsset = (asset, fallback = null) => {
        const source = asset && typeof asset === 'object' ? asset : {};
        const fallbackSource = fallback && typeof fallback === 'object' ? fallback : {};
        const url = String(source.url || fallbackSource.url || '').trim();
        if (!url) return null;

        return {
          url,
          publicId: String(source.publicId || fallbackSource.publicId || '').trim(),
          blurDataURL: String(source.blurDataURL || fallbackSource.blurDataURL || '').trim(),
        };
      };

      const legacyDesktop = {
        url: item?.desktopImage?.url || item?.url || item?.image || '',
        publicId: item?.desktopImage?.publicId || item?.publicId || item?.public_id || '',
        blurDataURL: item?.desktopImage?.blurDataURL || item?.blurDataURL || '',
      };
      const desktopImage = normalizeAsset(legacyDesktop);
      if (!desktopImage) return null;
      const tabletImage = normalizeAsset(item?.tabletImage);
      const mobileImage = normalizeAsset(item?.mobileImage);

      const normalizedItem = {
        desktopImage,
        alt: String(item?.alt || '').trim(),
        sortOrder: Number(item?.sortOrder ?? index) || 0,
      };

      if (tabletImage) {
        normalizedItem.tabletImage = tabletImage;
      }

      if (mobileImage) {
        normalizedItem.mobileImage = mobileImage;
      }

      return normalizedItem;
    })
    .filter(Boolean);
}

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

  revalidateTag('products');
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

  revalidateTag('products');
  if (product.slug) {
    revalidateTag(`product-${product.slug}`);
  }
  revalidateTag('admin-dashboard');

  return { success: true };
}

export async function setProductDiscountAction(productId, discountPercentage) {
  await assertAdmin();
  await dbConnect();

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const pct = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
  product.discountPercentage = pct;
  product.isDiscounted = pct > 0;
  await product.save();

  // Use revalidateTag (hard/immediate flush) not updateTag (lazy background)
  // so the admin page re-render after this action gets fresh data from MongoDB
  revalidateTag('products');
  if (product.slug) {
    revalidateTag(`product-${product.slug}`);
  }
  revalidateTag('admin-dashboard');
  revalidatePath('/admin/products');
  revalidatePath('/');

  return { success: true, discountPercentage: product.discountPercentage, isDiscounted: product.isDiscounted };
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
    'coverImages',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (nextSettings[field] !== undefined) {
      updates[field] = field === 'coverImages' ? normalizeCoverImages(nextSettings[field]) : nextSettings[field];
    }
  }

  const settings = await Settings.findOneAndUpdate(
    { singletonKey: SETTINGS_KEY },
    { $set: updates },
    { new: true, upsert: true, runValidators: true },
  ).lean();

  revalidateTag('settings');

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

  const session = await getServerSession(authOptions);
  
  // Robust email capture:
  const sessionEmail = session?.user?.email ? normalizeEmail(session.user.email) : null;
  const inputEmail = input?.customerEmail ? normalizeEmail(input.customerEmail) : null;
  const userEmail = sessionEmail || inputEmail || null;

  // STRICT VALIDATION: If user is logged in, email MUST be captured.
  if (session?.user && !userEmail) {
    throw new Error('Unable to capture user email for account linking. Please try signing out and in again.');
  }

  const order = await Order.create({
    orderId: makeOrderId(),
    customerEmail: userEmail,
    customerName,
    customerPhone,
    customerAddress,
    items: normalizedItems,
    totalAmount,
    notes,
    status: 'Pending',
  });

  revalidateTag('orders');
  revalidateTag('admin-dashboard');

  // Update User Profile & Link Previous Orders (Background)
  if (userEmail) {
    try {
      // 1. Update user profile with the latest phone number
      await User.findOneAndUpdate(
        { email: userEmail },
        { phone: customerPhone },
        { upsert: true }
      );

      // 2. Link all previous orders using fuzzy phone matching
      const phoneRegex = getPhoneRegex(customerPhone);
      if (phoneRegex) {
        const linkResult = await Order.updateMany(
          { customerPhone: { $regex: phoneRegex }, customerEmail: null },
          { customerEmail: userEmail }
        );
        
        if (linkResult.modifiedCount > 0) {
          console.log(`Linked ${linkResult.modifiedCount} previous orders to ${userEmail} via fuzzy phone ${customerPhone}`);
        }
      }
    } catch (profileError) {
      console.error('Error updating user profile/linking orders:', profileError);
    }
  }

  // Create Admin Notification
  try {
    const Notification = (await import('@/models/Notification')).default;
    await Notification.create({
      type: 'order',
      message: `New Order ${order.orderId} received from ${customerName}`,
      link: `/admin/orders?id=${order.orderId}`,
      metadata: {
        id: order.orderId,
        userName: customerName,
      }
    });
  } catch (notifyError) {
    console.error('Failed to create order notification:', notifyError);
  }

  // Trigger Notification Email (Background)
  try {
    const emailResult = await resend.emails.send({
      from: 'China Unique <onboarding@resend.dev>',
      to: '123raza83@gmail.com',
      subject: `New Order Received - ${customerName}`,
      html: generateOrderEmailHtml(order),
    });
    console.log(`Email notification triggered for ${order.orderId}:`, emailResult);
  } catch (emailError) {
    console.error(`Failed to send email for ${order.orderId}:`, emailError);
  }

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

export async function getLastOrderDetailsAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  await dbConnect();
  const lastOrder = await Order.findOne({ userEmail: normalizeEmail(session.user.email) })
    .sort({ createdAt: -1 })
    .lean();

  if (!lastOrder) return null;

  return {
    phone: lastOrder.customerPhone || '',
    address: lastOrder.customerAddress || '',
    // Extract landmark and city from address string if possible (best effort)
    // Assuming format from CheckoutClient: "address, landmark, city"
    addressOnly: lastOrder.customerAddress.split(',')[0]?.trim() || lastOrder.customerAddress,
    city: lastOrder.customerAddress.split(',').pop()?.trim() || '',
    landmark: lastOrder.customerAddress.split(',').length > 2 ? lastOrder.customerAddress.split(',')[1]?.trim() : '',
  };
}

export async function linkOrdersAction(phone) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: 'Please sign in first.' };
  }

  const userEmail = normalizeEmail(session.user.email);
  const normalizedPhone = String(phone || '').trim();

  if (!normalizedPhone) {
    return { success: false, message: 'Phone number is required.' };
  }

  await dbConnect();

  // 1. Update User profile with this phone
  await User.findOneAndUpdate(
    { email: userEmail },
    { phone: normalizedPhone },
    { upsert: true }
  );

  // 2. Link orders using fuzzy phone matching
  const phoneRegex = getPhoneRegex(normalizedPhone);
  let modifiedCount = 0;

  if (phoneRegex) {
    const result = await Order.updateMany(
      { customerPhone: { $regex: phoneRegex }, customerEmail: null },
      { customerEmail: userEmail }
    );
    modifiedCount = result.modifiedCount;
  }

  if (modifiedCount > 0) {
    revalidatePath('/orders');
    return { 
      success: true, 
      message: `Successfully linked ${result.matchedCount} order(s) to your account.` 
    };
  } else {
    return { 
      success: false, 
      message: 'No unlinked orders found with this phone number, but your phone has been saved to your profile.' 
    };
  }
}
