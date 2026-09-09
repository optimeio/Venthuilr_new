import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import OtpStore from '@/models/OtpStore';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    const record = await OtpStore.findOne({ email, type: 'register' });
    if (!record || record.verified || new Date() > record.expiresAt) {
      return NextResponse.json({ msg: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return NextResponse.json({ msg: 'Invalid verification code.' }, { status: 400 });
    }

    record.verified = true;
    record.expiresAt = new Date(Date.now() + 600000);
    await record.save();

    return NextResponse.json({ msg: 'Email successfully verified' });
  } catch (err) {
    console.error('Register OTP Verify Error:', err);
    return NextResponse.json({ msg: 'Verification protocol failed.' }, { status: 500 });
  }
}
