import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        Name: {
            type: String,
            required: [true, 'Please provide a name for this product.'],
            maxlength: [200, 'Name cannot be more than 200 characters'],
        },
        Description: {
            type: String,
            required: false,
        },
        Price: {
            type: Number,
            required: [true, 'Please provide a price.'],
        },
        ImageURL: {
            type: String,
            required: false,
        },
        Image: {
            type: String,
            required: false,
        },
        Category: {
            type: [String],
            default: [],
        },
        isLive: {
            type: Boolean,
            default: false,
        },
        stockQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        StockStatus: {
            type: String,
            enum: ['In Stock', 'Out of Stock'], // Only allow these two values
            required: true,
        },
        slug: {
            type: String,
            required: false,
            unique: true,
        },
        cloudinary_id: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
