import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function PUT(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { address, city, state, zipCode } = await request.json();
    const user = await User.findById(auth.user.id);

    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    user.deliveryAddress = {
      address: address || user.deliveryAddress?.address || '',
      city: city || user.deliveryAddress?.city || '',
      state: state || user.deliveryAddress?.state || '',
      zipCode: zipCode || user.deliveryAddress?.zipCode || ''
    };

    await user.save();
    return NextResponse.json({ msg: 'Address updated successfully', deliveryAddress: user.deliveryAddress });
  } catch (err) {
    console.error('API Update Address Error:', err);
    return NextResponse.json({ msg: 'Server Error updating address' }, { status: 500 });
  }
}
