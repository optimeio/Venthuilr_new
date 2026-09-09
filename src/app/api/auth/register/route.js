import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { signToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, password, address, city, state, zipCode } = await request.json();

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required.' }, { status: 400 });
    }

    const record = await OtpStore.findOne({ email, type: 'register', verified: true });
    if (!record || new Date() > record.expiresAt) {
      return NextResponse.json({ msg: 'Email not verified or session expired. Please verify your email again.' }, { status: 400 });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ msg: 'Identity already exists' }, { status: 400 });
    }

    await OtpStore.deleteOne({ email, type: 'register' });

    const salt = await bcrypt.genSalt(6);
    const hashedPassword = await bcrypt.hash(password, salt);

    const deliveryAddress = { address: address || '', city: city || '', state: state || '', zipCode: zipCode || '' };

    const user = new User({ name, email, phone, password: hashedPassword, deliveryAddress });
    await user.save();

    const token = signToken(
      { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
      '30d'
    );

    // Send welcome emails asynchronously
    sendEmail({
      to: email,
      subject: '🌿 Welcome to Venthulir Organic Harvest!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background: #0b3d2e; padding: 30px; text-align: center;">
                <h1 style="color: #d4af37; margin: 0; letter-spacing: 3px;">VENTHULIR</h1>
                <p style="color: #a7f3d0; font-size: 13px; margin: 5px 0 0;">Organic Harvest</p>
            </div>
            <div style="padding: 30px;">
                <h2 style="color: #0b3d2e;">Welcome, ${name}! 🎉</h2>
                <p style="color: #555; line-height: 1.7;">Your Venthulir account has been created successfully. You can now shop our premium organic products, track your orders, and enjoy exclusive member benefits.</p>
                <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #166534; font-size: 14px;"><strong>📧 Email:</strong> ${email}</p>
                </div>
            </div>
            <div style="background: #0b3d2e; padding: 16px; text-align: center; font-size: 12px; color: #a7f3d0;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Venthulir Royal Reserves. All rights reserved.</p>
            </div>
        </div>
      `
    }).catch(err => console.error('Welcome email error:', err));

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        deliveryAddress: user.deliveryAddress,
        isAdmin: user.isAdmin
      }
    }, { status: 201 });
  } catch (err) {
    console.error('API Register Error:', err);
    return NextResponse.json({ msg: 'Sovereign Server Error' }, { status: 500 });
  }
}
