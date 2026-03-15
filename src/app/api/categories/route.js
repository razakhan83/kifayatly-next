import { updateTag } from 'next/cache';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import mongoose from "mongoose";

function slugifyCategory(name = "") {
  return String(name)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

// GET all categories — sorted by sortOrder then name
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
    return NextResponse.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// POST new category
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    // Auto-assign sortOrder to end of list
    const count = await Category.countDocuments();

    const category = await Category.create({
      name: body.name.trim(),
      slug: slugifyCategory(body.name),
      image: body.image || "",
      imagePublicId: body.imagePublicId || "",
      sortOrder: body.sortOrder ?? count,
    });
    updateTag('categories');
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT — bulk update sort order for categories
// Body: { categories: [{ _id, sortOrder }, ...] }
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    if (!Array.isArray(body.categories)) {
      return NextResponse.json(
        { success: false, error: "Expected { categories: [...] }" },
        { status: 400 },
      );
    }

    const operations = body.categories.map((cat) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(cat._id) },
        update: { $set: { sortOrder: Number(cat.sortOrder) || 0 } },
      },
    }));

    const result = await Category.bulkWrite(operations);
    console.log('[API] Categories bulkWrite result:', result.modifiedCount, 'modified');

    // Return the freshly-sorted list so the frontend can use it directly
    const updated = await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, message: "Sort order updated", data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// DELETE a category by _id (sent as query param)
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
