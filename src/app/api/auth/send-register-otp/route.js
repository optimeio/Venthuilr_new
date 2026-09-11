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

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ msg: 'An account with this email already exists. Please sign in.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(6);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OtpStore.findOneAndUpdate(
      { email: cleanEmail, type: 'register' },
      { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 mins
      { upsert: true, new: true }
    );

    console.log(`[AUTH] Generated Registration OTP for ${cleanEmail}: ${otp}`);

    const emailRes = await sendEmail({
      to: cleanEmail,
      subject: `Your Venthulir verification code is ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #0f3d2a; padding: 24px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; letter-spacing: 2px; font-size: 22px; font-family: Georgia, serif;">VENTHULIR</h1>
            <p style="color: #a7f3d0; font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">100% Certified Organic Harvest</p>
          </div>
          <div style="padding: 30px 24px; text-align: center;">
            <h2 style="color: #0f3d2a; margin-top: 0; font-size: 18px;">Verify Your Email Address</h2>
            <p style="color: #4a5e52; font-size: 14.5px; line-height: 1.5; margin-bottom: 20px;">
              Welcome to Venthulir Organic. Enter the 6-digit verification code below to activate your member account:
            </p>
            <div style="margin: 24px auto; display: inline-block;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f3d2a; background: #f4f0e6; padding: 12px 24px; border-radius: 10px; border: 1.5px solid #d4af37; display: block; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 12px 0 0;">
              This verification code is valid for <strong>10 minutes</strong>.
            </p>
          </div>
          <div style="background: #faf8f5; border-top: 1px solid #eee7dc; padding: 14px 20px; text-align: center; font-size: 12px; color: #788c81;">
            <p style="margin: 0;">If you did not initiate this registration, please disregard this email.</p>
          </div>
        </div>
      `,
      text: `Your Venthulir verification code is: ${otp}\n\nEnter this code on the registration screen. This code will expire in 10 minutes.\nIf you did not request this, please disregard this email.`
    });

    if (!emailRes.success) {
      return NextResponse.json({ msg: 'Email dispatch failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ msg: 'Verification code sent successfully.' });
  } catch (err) {
    console.error('OTP Send Error:', err);
    return NextResponse.json({ msg: 'Failed to dispatch verification code.' }, { status: 500 });
  }
}
