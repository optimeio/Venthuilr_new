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
    const { name, phone } = await request.json();
    const user = await User.findById(auth.user.id);

    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    return NextResponse.json({ msg: 'Profile updated successfully', user: { name: user.name, phone: user.phone } });
  } catch (err) {
    console.error('API Update Profile Error:', err);
    return NextResponse.json({ msg: 'Server Error updating profile' }, { status: 500 });
  }
}
