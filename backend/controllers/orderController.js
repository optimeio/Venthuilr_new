const Order = require('../models/Order');
const User = require('../models/User');
const { restoreStock } = require('./inventoryController');

/**
 * GET /api/orders/me
 * Returns all orders for the logged-in customer.
 */
exports.getMyOrders = async (req, res) => {
    try {
        // Fetch user first to ensure we have the email, supporting older tokens that lacked it
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Case-insensitive email match to find all orders for this user
        const orders = await Order.find({
            customerEmail: { $regex: new RegExp(`^${user.email}$`, 'i') }
        }).sort({ createdAt: -1 });

        console.log(`📦 Orders fetched for ${user.email}: ${orders.length} orders found`);
        res.json(orders);
    } catch (err) {
        console.error('Order fetch error:', err);
        res.status(500).json({ error: 'Server Error fetching your orders' });
    }
};

/**
 * PUT /api/orders/:id/cancel
 * Lets a customer politely cancel an order before it ships.
 */
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Ensure user actually owns this order (case-insensitive check)
        if (order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
            return res.status(403).json({ error: 'Unauthorized to cancel this order' });
        }

        if (order.status !== 'Pending' && order.status !== 'Processing') {
            return res.status(400).json({ error: 'Order is already being shipped or completed.' });
        }

        order.status = 'Cancelled';

        // Restore stock atomically
        if (order.items && order.items.length > 0) {
            await restoreStock(order.items);
        }

        await order.save();
        res.json({ msg: 'Order cancelled successfully', order });
    } catch (err) {
        console.error('Customer cancel error:', err);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
};

/**
 * GET /api/admin/orders
 * Returns all orders for admin.
 */
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
};

/**
 * PUT /api/admin/orders/:id/status
 * Updates order status and handles stock logic:
 * - Cancelled / Returned → Restore stock
 * - Delivered → Keep stock reduced (no change)
 * - Pending / Processing → No stock change (already deducted on order place)
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const prevStatus = order.status;

        // If transitioning to Cancelled or Returned, restore stock
        const shouldRestoreStock = (status === 'Cancelled' || status === 'Returned') &&
            prevStatus !== 'Cancelled' && prevStatus !== 'Returned';

        if (shouldRestoreStock && order.items && order.items.length > 0) {
            await restoreStock(order.items);
        }

        order.status = status;
        order.statusUpdatedAt = new Date();
        await order.save();

        res.json({ msg: 'Order status updated', order });
    } catch (err) {
        console.error('Order status update error:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
