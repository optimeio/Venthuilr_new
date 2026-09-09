import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product';
import { reduceStock } from '@/lib/inventory';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerName,
      customerEmail,
      phone,
      deliveryAddress,
      items,
      originalAmount,
      shippingCharge,
      discountAmount,
      totalAmount,
      couponCode,
    } = await request.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
      if (coupon && coupon.status === 'Active' && new Date(coupon.expiryDate) >= new Date() && coupon.usedCount < coupon.maxUses) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const stockResult = await reduceStock(items);
    if (!stockResult.success) {
      return NextResponse.json({ error: stockResult.error }, { status: 400 });
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      try {
        const prod = await Product.findById(item.product || item._id);
        return {
          ...item,
          hsnSac: prod ? (prod.hsnSac || "") : (item.hsnSac || "")
        };
      } catch (e) {
        return item;
      }
    }));

    const newOrder = new Order({
      customerName,
      customerEmail,
      phone,
      deliveryAddress,
      items: enrichedItems,
      originalAmount: originalAmount || totalAmount,
      shippingCharge: shippingCharge || 0,
      discountAmount: discountAmount || 0,
      couponUsed: (couponCode && typeof couponCode === 'string') ? couponCode.toUpperCase() : null,
      totalAmount,
      paymentMethod: 'Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'Processing',
      statusUpdatedAt: new Date(),
    });

    await newOrder.save();

    sendEmail({
      to: customerEmail,
      subject: `🌿 Payment Successful & Order Confirmed #${newOrder._id.toString().slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0b3d2e; padding: 25px; text-align: center; color: #fff;">
            <h1 style="color: #d4af37; margin: 0;">VENTHULIR</h1>
            <p style="color: #a7f3d0; margin: 5px 0 0; font-size: 13px;">Payment Received via Razorpay</p>
          </div>
          <div style="padding: 25px;">
            <h2 style="color: #0b3d2e;">Thank You for Your Order, ${customerName}!</h2>
            <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Total Paid:</strong> ₹${totalAmount}</p>
          </div>
        </div>
      `
    }).catch(e => console.error('Payment email error:', e));

    return NextResponse.json({
      msg: 'Payment verified and order created',
      order: newOrder,
    }, { status: 201 });
  } catch (err) {
    console.error('Payment verify API error:', err);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
