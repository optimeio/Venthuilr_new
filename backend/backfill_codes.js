const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

async function backfillAndCheck() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/venthulir');
        console.log('Connected to DB');

        const products = await Product.find();
        console.log(`Found ${products.length} products.`);

        for (let p of products) {
            if (!p.productCode) {
                const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit number
                p.productCode = `VNT-${randomPart}`;
                await p.save();
                console.log(`Backfilled code for ${p.name}: ${p.productCode}`);
            } else {
                console.log(`Product ${p.name} already has code: ${p.productCode}`);
            }
        }

        const coupons = await Coupon.find().populate('productId');
        console.log(`\nFound ${coupons.length} coupons.`);
        for (let c of coupons) {
            console.log(`Coupon ${c.couponCode}:`);
            console.log(`- productId: ${c.productId ? (c.productId.name + ' [' + c.productId.productCode + ']') : 'Generic/Null'}`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

backfillAndCheck();
