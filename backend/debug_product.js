const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function checkProductObject() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/venthulir');
        console.log('Connected to DB');

        const p = await mongoose.connection.db.collection('ProductDetails').findOne({ name: 'Organic Chilli Powder' });
        console.log('Product Object from DB:');
        console.log(JSON.stringify(p, null, 2));

        const coupons = await mongoose.connection.db.collection('Coupons').find().toArray();
        console.log('\nCoupons in DB:', coupons.length);
        if (coupons.length > 0) console.log(JSON.stringify(coupons, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkProductObject();
