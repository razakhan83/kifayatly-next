import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        customerEmail: {
            type: String,
            required: false,
            lowercase: true,
        },
        customerName: {
            type: String,
            required: [true, 'Customer name is required.'],
        },
        customerPhone: {
            type: String,
            required: false,
        },
        customerAddress: {
            type: String,
            required: false,
        },
        items: [
            {
                productId: { type: String },
                name: { type: String },
                price: { type: Number },
                quantity: { type: Number, default: 1 },
                image: { type: String },
                isReviewed: { type: Boolean, default: false },
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required.'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'In Process', 'Delivered', 'Delivery Address Issue', 'Returned'],
            default: 'Pending',
        },
        courierName: {
            type: String,
            required: false,
        },
        trackingNumber: {
            type: String,
            required: false,
        },
        notes: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Next.js hot reloading can keep old models in memory. 
// If the cached Order model doesn't have the updated status enum or missing fields, we must delete it to force re-registration.
const cachedOrder = mongoose.models.Order;
if (cachedOrder) {
    const hasStatusInProcess = cachedOrder.schema.path('status').options.enum.includes('In Process');
    const hasTracking = !!cachedOrder.schema.paths.trackingNumber;
    const hasIsReviewed = !!cachedOrder.schema.path('items').schema.paths.isReviewed;
    
    if (!hasStatusInProcess || !hasTracking || !hasIsReviewed) {
        delete mongoose.models.Order;
    }
}

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
