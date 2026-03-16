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
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required.'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Shipped', 'Delivered'],
            default: 'Pending',
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
// If the cached Order model doesn't have the customerEmail field, we must delete it to force re-registration.
if (mongoose.models.Order && !mongoose.models.Order.schema.paths.customerEmail) {
    delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
