import mongoose from 'mongoose';

const ProductImageSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        blurDataURL: {
            type: String,
            default: '',
        },
        publicId: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        _id: false,
    }
);

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
        Images: {
            type: [ProductImageSchema],
            default: []
        },
        Category: {
            type: [String],
            required: [true, 'Please provide at least one category.'],
            default: [],
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
        isLive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
