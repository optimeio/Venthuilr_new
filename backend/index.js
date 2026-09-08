const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
// Shared transporter used instead
require('dotenv').config();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(uploadDir));

// 0. EMAIL CONFIGURATION
const transporter = require('./utils/email');

const LOGO_URL = 'https://i.ibb.co/S4vWN0XK/organic.png';

// 1. SCHEMAS & MODELS
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema, 'CustomerDetails');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String }, // Primary image (backward compatibility)
    images: { type: [String], default: [] }, // Array for multiple images
    category: { type: String, default: "General" },
    badge: { type: String, default: "" },
    variants: [{
        label: { type: String, required: true }, // e.g. "100g", "1L"
        price: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model('Product', ProductSchema, 'ProductDetails');

const MessageSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    message: { type: String, required: true },
    reply: { type: String }, // Admin response
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date } // Tracks when the reply "went"
});
const Message = mongoose.model('Message', MessageSchema, 'MessageHistory');

const OrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', OrderSchema, 'OrderRegistry');

// 2. DATABASE CONNECTION & SEEDING
const seedAdmin = async () => {
    try {
        const adminEmail = 'thesmgroups@gmail.com';
        const adminPass = 'TSMGPVT@2026';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPass, salt);
            const newAdmin = new User({
                name: 'Imperial Admin',
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true
            });
            await newAdmin.save();
            console.log('💎 Royal Admin Account Secured and Synced.');
        }
    } catch (err) {
        console.error('Admin Seeding Error:', err);
    }
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://Nithya:123456Nith@ac-ypjxfsu-shard-00-00.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-01.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-02.dwrbhgg.mongodb.net:27017/ecomVen?ssl=true&replicaSet=atlas-10jm2p-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('🌿 Royal Venthulir Database Connected (Direct)');
        seedAdmin();
    })
    .catch(err => console.error('❌ Connection Error:', err));

// 3. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, phone, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Identity not found in our records.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials. Access denied.' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'venthulir_secret_key', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err) {
        res.status(500).json({ error: 'Sovereign Server Error' });
    }
});

// 4. API ROUTES
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, badge, page = 1, limit = 12 } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (badge) {
            query.badge = badge;
        }

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
            totalProducts
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        const messageCount = await Message.countDocuments({ status: 'Open' });

        res.json({
            productCount,
            userCount,
            orderCount,
            messageCount
        });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        console.log("📥 Received query from customer:", req.body.customerEmail);
        const { customerName, customerEmail, message } = req.body;
        const msg = new Message({ customerName, customerEmail, message });
        await msg.save();
        res.status(201).json({ msg: 'Message sent', data: msg });
    } catch (err) {
        console.error("❌ Error saving message:", err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 5. ADMIN ROUTES
app.get('/api/admin/users', async (req, res) => {
    try {
        // Filter out the secret admin from customer list
        const users = await User.find({ email: { $ne: 'thesmgroups@gmail.com' } }).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.post('/api/admin/products', async (req, res) => {
    try {
        const { name, price, description, imageUrl, images, category, badge, variants } = req.body;
        const newProduct = new Product({
            name, price, description,
            imageUrl: imageUrl || (images && images.length > 0 ? images[0] : ''),
            images: images || [],
            category, badge,
            variants: variants || []
        });
        await newProduct.save();
        res.status(201).json({ msg: 'Product added successfully', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Get all products for admin management
app.get('/api/admin/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update product
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Delete product
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// Image upload endpoint (Multiple supported)
app.post('/api/admin/upload', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images provided' });
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrls = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
        res.json({ imageUrls });
    } catch (err) {
        res.status(500).json({ error: 'Upload Error' });
    }
});

// Messages management
app.get('/api/admin/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        console.log(`📤 Serving ${messages.length} messages to admin`);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.get('/api/admin/logs', async (req, res) => {
    try {
        // Return dummy logs for now
        res.json([]);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.put('/api/admin/messages/:id/resolve', async (req, res) => {
    try {
        const { reply } = req.body;
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ error: 'Not found' });

        message.status = 'Resolved';
        message.reply = reply || 'Your request has been processed.';
        message.resolvedAt = new Date(); // Log the time it "went" out
        await message.save();

        if (reply) {
            const mailOptions = {
                from: `"Venthullir Official" <${process.env.EMAIL_USER}>`,
                to: message.customerEmail,
                subject: 'Response to your Query - Venthullir Royal Reserves',
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                        <div style="background: #0b3d2e; padding: 30px; text-align: center;">
                            <img src="${LOGO_URL}" alt="Venthullir Logo" style="width: 120px; margin-bottom: 10px;">
                            <h2 style="color: #d4af37; margin: 0; font-family: serif; font-style: italic;">Royal Support</h2>
                        </div>
                        <div style="padding: 40px; color: #333; line-height: 1.6;">
                            <p style="font-size: 18px; font-weight: bold; color: #0b3d2e;">Dear ${message.customerName},</p>
                            <p>Thank you for reaching out to Venthullir Royal Reserves. We have reviewed your query regarding:</p>
                            <div style="background: #fdfcf7; border-left: 4px solid #d4af37; padding: 15px; margin: 20px 0; font-style: italic; color: #666;">
                                "${message.message}"
                            </div>
                            <p style="font-weight: bold; color: #0b3d2e; margin-top: 30px;">Our Response:</p>
                            <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;">${reply}</p>
                            <p style="margin-top: 40px;">Best Regards,<br><strong>Optime Team</strong><br>Venthullir Royal Reserves</p>
                        </div>
                        <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee; font-size: 12px; color: #888;">
                            &copy; 2026 Venthullir Royal Reserves. All rights reserved.<br>
                            This is an official communication regarding your support ticket.
                        </div>
                    </div>
                `
            };
            // Send email asynchronously so the admin doesn't wait
            transporter.sendMail(mailOptions).catch(err => console.error("Email Error:", err));
            console.log(`📧 Reply sent to ${message.customerEmail}`);
        }

        res.json(message);
    } catch (err) {
        console.error("Email Error:", err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// 6. SERVE FRONTEND (Production)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../client/dist');
    
    // Serve admin static files
    app.use('/admin', express.static(path.join(distPath, 'admin')));
    
    // Serve customer static files
    app.use(express.static(distPath));

    // Admin SPA routing
    app.get('/admin/*', (req, res) => {
        res.sendFile(path.join(distPath, 'admin', 'index.html'));
    });

    // Customer SPA routing
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Debug Email Route
app.get('/api/test-email', async (req, res) => {
    try {
        await transporter.sendMail({
            from: `"Venthulir Debug" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'Venthulir SMTP Reliability Test',
            text: 'Connection verified! Port 465 is OPEN and SSL is TRUE.'
        });
        res.json({ msg: 'Success! Test email sent to ' + process.env.EMAIL_USER });
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 Royal Server running at http://localhost:${PORT}`));

