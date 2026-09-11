import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import User from '@/models/User';
import Order from '@/models/Order';
import Message from '@/models/Message';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';
import { cache } from '@/lib/cache';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    const cacheKey = 'stats:admin_summary';
    const cachedStats = cache.get(cacheKey);
    if (cachedStats) {
      return NextResponse.json(cachedStats, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'no-store' }
      });
    }

    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      productCount,
      userCount,
      orderCount,
      messageCount,
      couponsCount,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      orderAggregation,
      inventoryStats
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ email: { $ne: 'thesmgroups@gmail.com' } }),
      Order.countDocuments(),
      Message.countDocuments({ status: { $in: ['Open', 'Pending'] } }),
      Coupon.countDocuments({ status: 'Active' }),
      Product.find({ currentStock: { $gt: 0, $lte: 10 } }).select('name productCode currentStock initialStock price imageUrl').lean(),
      Product.find({ currentStock: 0 }).select('name productCode currentStock initialStock price imageUrl').lean(),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
      Order.aggregate([
        {
          $facet: {
            totalFinancials: [
              { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$totalAmount' },
                  todayRevenue: {
                    $sum: {
                      $cond: [{ $gte: ['$createdAt', startOfToday] }, '$totalAmount', 0]
                    }
                  }
                }
              }
            ],
            statusBreakdown: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            paymentBreakdown: [
              {
                $group: {
                  _id: {
                    $cond: [
                      { $regexMatch: { input: { $ifNull: ['$paymentMethod', 'Cash'] }, regex: /cash/i } },
                      'COD',
                      'ONLINE'
                    ]
                  },
                  count: { $sum: 1 }
                }
              }
            ],
            recent7Days: [
              { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $nin: ['Cancelled', 'Returned'] } } },
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  dailyRevenue: { $sum: '$totalAmount' },
                  ordersCount: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$currentStock' }
          }
        }
      ])
    ]);

    const facet = orderAggregation[0] || {};
    const financials = facet.totalFinancials?.[0] || { totalRevenue: 0, todayRevenue: 0 };

    const statusMap = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    (facet.statusBreakdown || []).forEach(st => {
      const s = (st._id || 'Pending').toLowerCase();
      if (s === 'pending') statusMap.pending += st.count;
      else if (s === 'confirmed' || s === 'processing') statusMap.confirmed += st.count;
      else if (s === 'shipped') statusMap.shipped += st.count;
      else if (s === 'delivered') statusMap.delivered += st.count;
      else if (s === 'cancelled' || s === 'returned') statusMap.cancelled += st.count;
    });

    const paymentMap = { cod: 0, online: 0 };
    (facet.paymentBreakdown || []).forEach(pm => {
      if (pm._id === 'COD') paymentMap.cod = pm.count;
      else paymentMap.online = pm.count;
    });

    // 7 Days Trend Formatter
    const last7Days = [];
    const trendLookup = new Map((facet.recent7Days || []).map(r => [r._id, r]));

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const record = trendLookup.get(isoDate);

      last7Days.push({
        day: dayStr,
        revenue: record ? record.dailyRevenue : 0,
        orders: record ? record.ordersCount : 0
      });
    }

    const payload = {
      totalRevenue: financials.totalRevenue || 0,
      todayRevenue: financials.todayRevenue || 0,
      productCount,
      userCount,
      orderCount,
      messageCount,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      couponsCount,
      statusCounts: statusMap,
      paymentBreakdown: paymentMap,
      recentOrders,
      bestSellers: [],
      lowStockProducts,
      outOfStockProducts,
      salesTrend: last7Days,
      totalInventoryUnits: inventoryStats[0]?.totalStock || 0
    };

    cache.set(cacheKey, payload, 30); // 30s TTL cache

    return NextResponse.json(payload, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('API Admin Stats Error:', err);
    return NextResponse.json({ error: 'Stats Error' }, { status: 500 });
  }
}
