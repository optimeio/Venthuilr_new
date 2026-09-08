const Product = require('../models/Product');
const Offer = require('../models/Offer');

/**
 * GET /api/admin/inventory
 * Returns full inventory dashboard for admin only.
 */
exports.getInventory = async (req, res) => {
    try {
        const products = await Product.find().sort({ currentStock: 1 });
        const offers = await Offer.find().sort({ stock: 1 });

        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
        const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock < 10);
        const outOfStockProducts = products.filter(p => p.currentStock === 0);

        // Offer stock stats
        const lowStockOffers = offers.filter(o => o.stock > 0 && o.stock < 10);
        const outOfStockOffers = offers.filter(o => o.stock === 0);

        res.json({
            totalProducts,
            totalStock,
            lowStockProducts,
            outOfStockProducts,
            allProducts: products,
            // Offers inventory
            totalOffers: offers.length,
            totalOfferStock: offers.reduce((sum, o) => sum + o.stock, 0),
            lowStockOffers,
            outOfStockOffers,
            allOffers: offers
        });
    } catch (err) {
        console.error('Inventory fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

/**
 * PUT /api/admin/inventory/:productId/restock
 * Manually adjust stock for a product.
 * Body: { quantity: Number }
 */
exports.restockProduct = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
        }

        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        product.currentStock += Number(quantity);
        product.updatedAt = new Date();
        await product.save();

        res.json({ msg: 'Stock updated successfully', product });
    } catch (err) {
        console.error('Restock error:', err);
        res.status(500).json({ error: 'Failed to update stock' });
    }
};

/**
 * PUT /api/admin/inventory/offers/:offerId/restock
 * Manually add stock units to an offer.
 * Body: { quantity: Number }
 */
exports.restockOffer = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 0) {
            return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
        }

        const offer = await Offer.findById(req.params.offerId);
        if (!offer) return res.status(404).json({ error: 'Offer not found' });

        offer.stock += Number(quantity);
        offer.updatedAt = new Date();
        await offer.save();

        res.json({ msg: 'Offer stock updated successfully', offer });
    } catch (err) {
        console.error('Offer restock error:', err);
        res.status(500).json({ error: 'Failed to update offer stock' });
    }
};

/**
 * Utility: Atomically reduce stock when an order is placed.
 * Handles both regular Products and Offers.
 * Called internally from couponController (checkout).
 * Returns { success: boolean, error?: string }
 */
exports.reduceStock = async (items) => {
    for (const item of items) {
        const itemId = item.product;
        const qty = item.quantity || 1;

        // Try reducing from Product collection first
        let updated = await Product.findOneAndUpdate(
            { _id: itemId, currentStock: { $gte: qty } },
            { $inc: { currentStock: -qty }, $set: { updatedAt: new Date() } },
            { new: true }
        );

        if (!updated) {
            // Check if it's an Offer (not a product at all)
            const productDoc = await Product.findById(itemId).select('name currentStock');

            if (!productDoc) {
                // Not a product — check Offer model
                const offerUpdated = await Offer.findOneAndUpdate(
                    { _id: itemId, stock: { $gte: qty } },
                    { $inc: { stock: -qty }, $set: { updatedAt: new Date() } },
                    { new: true }
                );

                if (!offerUpdated) {
                    const offerDoc = await Offer.findById(itemId).select('name stock');
                    const stockLeft = offerDoc ? offerDoc.stock : 0;
                    const name = offerDoc ? offerDoc.name : item.name || itemId;
                    return { success: false, error: `"${name}" is Out of Stock. Only ${stockLeft} left.` };
                }
            } else {
                // It IS a product but stock insufficient
                const stockLeft = productDoc.currentStock;
                const name = productDoc.name;
                return { success: false, error: `"${name}" is Out of Stock. Only ${stockLeft} left.` };
            }
        }
    }
    return { success: true };
};

/**
 * Utility: Restore stock on cancellation or return.
 * Handles both Products and Offers.
 */
exports.restoreStock = async (items) => {
    for (const item of items) {
        const itemId = item.product;
        const qty = item.quantity || 1;

        // Try product first
        const productDoc = await Product.findById(itemId);
        if (productDoc) {
            await Product.findByIdAndUpdate(
                itemId,
                { $inc: { currentStock: qty }, $set: { updatedAt: new Date() } }
            );
        } else {
            // Must be an offer
            await Offer.findByIdAndUpdate(
                itemId,
                { $inc: { stock: qty }, $set: { updatedAt: new Date() } }
            );
        }
    }
};
