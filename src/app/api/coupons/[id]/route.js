import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body.couponCode) {
      body.couponCode = body.couponCode.trim().toUpperCase();
    }
    if (body.productId === 'all' || body.productId === '') {
      body.productId = null;
    }

    const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (err) {
    console.error('API Update Coupon Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ msg: 'Coupon deleted successfully' });
  } catch (err) {
    console.error('API Delete Coupon Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
