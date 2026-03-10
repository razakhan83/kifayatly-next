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
            type: String,
            required: [true, 'Please provide a category.'],
        },
        StockStatus: {
            type: String,
            enum: ['In Stock', 'Out of Stock'], // Only allow these two values
            default: 'In Stock',
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
