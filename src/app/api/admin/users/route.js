import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const users = await User.find({ email: { $ne: 'thesmgroups@gmail.com' } }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (err) {
    console.error('API Admin Get Users Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
