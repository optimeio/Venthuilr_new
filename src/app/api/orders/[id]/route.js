import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { restoreStock } from '@/lib/inventory';

export async function PUT(request, { params }) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { status, action } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer cancellation
    if (action === 'cancel' || (!auth.user.isAdmin && status === 'Cancelled')) {
      const user = await User.findById(auth.user.id);
      if (!user || order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 });
      }

      if (order.status !== 'Pending' && order.status !== 'Processing') {
        return NextResponse.json({ error: 'Order is already being shipped or completed.' }, { status: 400 });
      }

      order.status = 'Cancelled';
      order.statusUpdatedAt = new Date();
      if (order.items && order.items.length > 0) {
        await restoreStock(order.items);
      }
      await order.save();
      return NextResponse.json({ msg: 'Order cancelled successfully', order });
    }

    // Admin status update
    if (!auth.user.isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const prevStatus = order.status;
    const shouldRestoreStock = (status === 'Cancelled' || status === 'Returned') &&
      prevStatus !== 'Cancelled' && prevStatus !== 'Returned';

    if (shouldRestoreStock && order.items && order.items.length > 0) {
      await restoreStock(order.items);
    }

    order.status = status;
    order.statusUpdatedAt = new Date();
    await order.save();

    return NextResponse.json({ msg: 'Order status updated', order });
  } catch (err) {
    console.error('Order update error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
