require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://Nithya:123456Nith@ac-ypjxfsu-shard-00-00.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-01.dwrbhgg.mongodb.net:27017,ac-ypjxfsu-shard-00-02.dwrbhgg.mongodb.net:27017/ecomVen?ssl=true&replicaSet=atlas-10jm2p-shard-0&authSource=admin&retryWrites=true&w=majority';

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    images: { type: [String], default: [] },
    category: { type: String, default: "General" },
    badge: { type: String, default: "" },
    variants: [{
        label: { type: String, required: true },
        price: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', ProductSchema, 'ProductDetails');

const sampleProducts = [
    {
        name: "Premium Sambar Powder 200g",
        price: 180,
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800",
        badge: "Best Seller",
        description: "Handcrafted traditional Sambar powder made with sun-dried lentils and roasted spices for the most authentic South Indian taste."
    },
    {
        name: "Pure Turmeric Powder 200g",
        price: 120,
        category: "Spices",
        imageUrl: "https://images.unsplash.com/photo-1615485245456-62043697e883?auto=format&fit=crop&q=80&w=800",
        badge: "Authentic",
        description: "High-curcumin turmeric powder, cold-ground to preserve its medicinal properties and vibrant natural color."
    },
    {
        name: "Forest Lavender Oil 15ml",
        price: 450,
        category: "Essential Oils",
        imageUrl: "https://images.unsplash.com/photo-1595981267035-7b04ec82389e?auto=format&fit=crop&q=80&w=800",
        badge: "New Arrival",
        description: "100% pure steam-distilled Lavender essential oil sourced from the high-altitude fields for ultimate relaxation."
    },
    {
        name: "Organic Honey 500g",
        price: 320,
        category: "Wellness Products",
        imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800",
        badge: "Organic",
        description: "Raw, unfiltered forest honey collected from wild beehives, rich in antioxidants and natural enzymes."
    },
    {
        name: "Herbal Hair Care Oil 100ml",
        price: 280,
        category: "Health & Skin Care",
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800",
        badge: "Best Seller",
        description: "Traditional Ayurvedic blend of 21 herbs infused in cold-pressed coconut oil for deep hair nourishment."
    },
    {
        name: "Virgin Coconut Oil 500ml",
        price: 240,
        category: "General",
        imageUrl: "https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?auto=format&fit=crop&q=80&w=800",
        badge: "Pure",
        description: "Cold-pressed virgin coconut oil extracted from fresh coconut milk, retaining all natural nutrients and aroma."
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for restoration...');

        // Clear existing (just in case)
        await Product.deleteMany({});

        // Insert samples
        await Product.insertMany(sampleProducts);

        console.log('Sample products restored successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seedDatabase();
