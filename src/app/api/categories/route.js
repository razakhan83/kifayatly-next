import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

// GET all categories
export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST new category
export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        
        if (!body.name) {
             return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
        }

        const category = await Category.create({ name: body.name });
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
         if (error.code === 11000) {
              return NextResponse.json({ success: false, error: "Category already exists" }, { status: 400 });
         }
         return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
