import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const coupons = await Coupon.find().populate('productId', 'name productCode').sort({ createdAt: -1 }).lean();
    return NextResponse.json(coupons);
  } catch (err) {
    console.error('API Get Coupons Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
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
    const { couponCode, productId, maxUses, expiryDate, discountPercentage, status } = body;

    if (!couponCode || !discountPercentage || !expiryDate) {
      return NextResponse.json({ error: 'Coupon code, discount percentage, and expiry date are required.' }, { status: 400 });
    }

    const existing = await Coupon.findOne({ couponCode: couponCode.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 400 });
    }

    const newCoupon = new Coupon({
      couponCode: couponCode.trim().toUpperCase(),
      productId: productId && productId !== 'all' && productId !== '' ? productId : undefined,
      maxUses: Number(maxUses) || 25,
      expiryDate: new Date(expiryDate),
      discountPercentage: Number(discountPercentage),
      status: status || 'Active',
    });

    await newCoupon.save();
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (err) {
    console.error('API Create Coupon Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
