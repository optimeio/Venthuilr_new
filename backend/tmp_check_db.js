const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/venthulir');
        console.log('Connected to DB');

        const products = await Product.find({}, 'name productCode').lean();
        console.log('Products in DB:');
        products.forEach(p => {
            console.log(`- ${p.name}: [${p.productCode}]`);
        });

        const coupons = await mongoose.connection.db.collection('Coupons').find().toArray();
        console.log('\nCoupons in DB:');
        coupons.forEach(c => {
            console.log(`- ${c.couponCode}: productId=${c.productId}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkProducts();
