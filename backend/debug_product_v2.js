const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function checkProductObject() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/venthulir';
        console.log('Connecting to URI (masked):', uri.replace(/:([^@]+)@/, ':****@'));

        await mongoose.connect(uri);
        console.log('Connected to DB:', mongoose.connection.name);

        const p = await mongoose.connection.db.collection('ProductDetails').findOne({ name: 'Organic Chilli Powder' });
        console.log('Product Object from DB:');
        console.log(JSON.stringify(p, null, 2));

        const coupons = await mongoose.connection.db.collection('Coupons').find().toArray();
        console.log('\nCoupons in DB:', coupons.length);
        if (coupons.length > 0) {
            coupons.forEach(c => console.log(`- ${c.couponCode}: productId=${c.productId}`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkProductObject();
