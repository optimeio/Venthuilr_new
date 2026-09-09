import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ msg: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ msg: 'Identity not found in our records.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ msg: 'Invalid credentials. Access denied.' }, { status: 400 });
    }

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = signToken(
      { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
      expiresIn
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        deliveryAddress: user.deliveryAddress
      }
    });
  } catch (err) {
    console.error('API Login Error:', err);
    return NextResponse.json({ msg: 'Sovereign Server Error' }, { status: 500 });
  }
}
