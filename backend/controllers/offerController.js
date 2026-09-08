const Offer = require('../models/Offer');
const { API_BASE } = process.env; // Used for image URL normalization

// ─────────────────────────────────────────────
// PUBLIC: Get all currently active offers
// ─────────────────────────────────────────────
exports.getActiveOffers = async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).sort({ createdAt: -1 });

        res.json(offers);
    } catch (err) {
        console.error('Get Active Offers Error:', err);
        res.status(500).json({ error: 'Failed to load offers.' });
    }
};

// ─────────────────────────────────────────────
// ADMIN: Get ALL offers (regardless of status)
// ─────────────────────────────────────────────
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (err) {
        console.error('Get All Offers Error:', err);
        res.status(500).json({ error: 'Failed to load offers.' });
    }
};

// ─────────────────────────────────────────────
// ADMIN: Create a new offer
// ─────────────────────────────────────────────
exports.createOffer = async (req, res) => {
    try {
        const {
            name, description, imageUrl, images,
            price, offerPrice, mrpIllusion, discountPercent,
            category, badge, stock, rating, condition,
            startDate, endDate
        } = req.body;

        if (!name || !description || !price || !offerPrice || !startDate || !endDate) {
            return res.status(400).json({ error: 'Required fields missing.' });
        }

        const newOffer = new Offer({
            name,
            description,
            imageUrl: imageUrl || (images && images.length > 0 ? images[0] : ''),
            images: images || [],
            price: parseFloat(price),
            offerPrice: parseFloat(offerPrice),
            mrpIllusion: mrpIllusion ? parseFloat(mrpIllusion) : null,
            discountPercent: discountPercent ? parseFloat(discountPercent) : null,
            category: category || 'General',
            badge: badge || 'Limited Offer',
            stock: parseInt(stock) || 0,
            rating: parseFloat(rating) || 0,
            condition: condition || 'First 60 customers only allowed',
            comboContents: req.body.comboContents || '',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: true,
        });

        await newOffer.save();
        res.status(201).json({ msg: 'Offer created successfully', offer: newOffer });
    } catch (err) {
        console.error('Create Offer Error:', err);
        res.status(500).json({ error: 'Failed to create offer.' });
    }
};

// ─────────────────────────────────────────────
// ADMIN: Update an existing offer
// ─────────────────────────────────────────────
exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ error: 'Offer not found.' });

        const fields = req.body;
        if (fields.price) fields.price = parseFloat(fields.price);
        if (fields.offerPrice) fields.offerPrice = parseFloat(fields.offerPrice);
        if (fields.stock !== undefined) fields.stock = parseInt(fields.stock);
        if (fields.rating !== undefined) fields.rating = parseFloat(fields.rating);
        if (fields.startDate) fields.startDate = new Date(fields.startDate);
        if (fields.endDate) fields.endDate = new Date(fields.endDate);

        Object.assign(offer, fields);
        await offer.save();

        res.json({ msg: 'Offer updated successfully', offer });
    } catch (err) {
        console.error('Update Offer Error:', err);
        res.status(500).json({ error: 'Failed to update offer.' });
    }
};

// ─────────────────────────────────────────────
// ADMIN: Delete an offer
// ─────────────────────────────────────────────
exports.deleteOffer = async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Offer deleted successfully.' });
    } catch (err) {
        console.error('Delete Offer Error:', err);
        res.status(500).json({ error: 'Failed to delete offer.' });
    }
};
