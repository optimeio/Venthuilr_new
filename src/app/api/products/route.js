import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

const STOCK_FIELDS_EXCLUDE = '-initialStock -currentStock -updatedAt';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const badge = searchParams.get('badge');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (badge === 'New Arrival') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query.$or = [
        { badge: 'New Arrival' },
        { createdAt: { $gte: thirtyDaysAgo } }
      ];
    } else if (badge) {
      query.badge = badge;
    }

    const products = await Product.find(query)
      .select(STOCK_FIELDS_EXCLUDE)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const count = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    });
  } catch (err) {
    console.error('API Products Error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();
    const newProduct = new Product(body);
    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error('API Create Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
