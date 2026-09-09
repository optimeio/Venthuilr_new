import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ msg: 'Email is required.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ msg: 'Identity already exists' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(6);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OtpStore.findOneAndUpdate(
      { email, type: 'register' },
      { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 90000) },
      { upsert: true, new: true }
    );

    const emailRes = await sendEmail({
      to: email,
      subject: 'Verify Your Account - Venthulir',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0a2e1f; letter-spacing: 2px; margin: 0;">VENTHULIR</h1>
                <p style="color: #64748b; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Organic Harvest</p>
            </div>
            <h3 style="color: #111;">Verify your email</h3>
            <p style="color: #444; line-height: 1.6;">You have requested to create a new account at Venthulir. Use the code below to verify your email address.</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0a2e1f; background: #f8f9f8; padding: 15px 30px; border-radius: 8px; border: 1px solid #e2e8f0;">${otp}</span>
            </div>
            <p style="color: #c40000; font-size: 13px; text-align: center; font-weight: bold;">This code is valid for 90 seconds.</p>
        </div>
      `
    });

    return NextResponse.json({ msg: 'Verification code sent safely.' });
  } catch (err) {
    console.error('OTP Send Error:', err);
    return NextResponse.json({ msg: 'Failed to dispatch verification code.' }, { status: 500 });
  }
}
