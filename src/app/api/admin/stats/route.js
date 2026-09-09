import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import Message from '@/models/Message';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const [productCount, userCount, orderCount, messageCount, lowStockCount, outOfStockCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ email: { $ne: 'thesmgroups@gmail.com' } }),
      Order.countDocuments(),
      Message.countDocuments({ status: 'Open' }),
      Product.countDocuments({ currentStock: { $gt: 0, $lt: 10 } }),
      Product.countDocuments({ currentStock: 0 })
    ]);

    return NextResponse.json({
      productCount,
      userCount,
      orderCount,
      messageCount,
      lowStockCount,
      outOfStockCount
    });
  } catch (err) {
    console.error('API Admin Stats Error:', err);
    return NextResponse.json({ error: 'Stats Error' }, { status: 500 });
  }
}
